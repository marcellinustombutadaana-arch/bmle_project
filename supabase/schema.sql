-- =====================================================================
-- BMLE — Real backend schema for Supabase (Postgres + Auth + RLS)
-- =====================================================================
-- Run this once in your Supabase project's SQL editor
-- (Dashboard → SQL Editor → New query → paste → Run).
--
-- What this gives you:
--   • Real accounts via Supabase Auth (auth.users), not localStorage.
--   • A `profiles` table (one row per user) holding name/role/etc.
--   • Self sign-up can only ever produce role = 'customer' or 'vendor'.
--     Even if someone tampers with the client and sends role:"admin",
--     the database trigger below clamps it back down — the client is
--     never trusted for this decision.
--   • Row Level Security so a user can only see their own profile/orders;
--     admins can see everyone's, via an is_admin() check, not a client flag.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- ROLE TYPE
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('customer', 'vendor', 'admin');
  end if;
end $$;

-- ---------------------------------------------------------------------
-- VENDORS
-- ---------------------------------------------------------------------
create table if not exists public.vendors (
  id                       text primary key default gen_random_uuid()::text,
  name                     text not null,
  tagline                  text,
  logo_url                 text,
  banner_url               text,
  rating                   numeric not null default 5,
  reviews_count            integer not null default 0,
  location                 text,
  email                    text,
  phone                    text,
  bank_account             text,
  preferred_carrier        text default 'ghana-post-ems',
  free_shipping_threshold  numeric,
  joined_date              date not null default current_date,
  is_verified              boolean not null default false
);

-- ---------------------------------------------------------------------
-- PROFILES  (one row per auth.users row — this is "your account")
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null,
  email        text not null,
  role         user_role not null default 'customer',
  vendor_id    text references public.vendors(id) on delete set null,
  phone        text,
  location     text,
  avatar_url   text,
  joined_date  date not null default current_date
);

-- ---------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id             text primary key default gen_random_uuid()::text,
  vendor_id      text not null references public.vendors(id) on delete cascade,
  vendor_name    text,
  name           text not null,
  category       text not null,
  price          numeric not null,
  stock          integer not null default 0,
  weight_kg      numeric,
  dimensions_cm  jsonb,
  description    text,
  tags           text[] default '{}',
  image_url      text,
  featured       boolean default false,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------------------
create table if not exists public.orders (
  id                       text primary key default gen_random_uuid()::text,
  tracking_number          text,
  customer_id              uuid references auth.users(id) on delete set null,
  customer_name            text,
  customer_email           text,
  shipping_address         jsonb,
  items                    jsonb not null default '[]',
  subtotal                 numeric,
  shipping_fee             numeric,
  tax                      numeric,
  total                    numeric,
  carrier_id               text,
  carrier_name             text,
  payment_method           text,
  payment_status           text,
  order_status             text,
  tracking_events          jsonb default '[]',
  estimated_delivery_date  text,
  created_at               timestamptz not null default now(),
  dispatch_label_url       text
);

-- =====================================================================
-- HELPER FUNCTIONS (security definer — bypass RLS internally so they
-- can safely be *used inside* RLS policies without infinite recursion)
-- =====================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.my_vendor_id()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select vendor_id from public.profiles where id = auth.uid();
$$;

-- =====================================================================
-- NEW-USER TRIGGER — the actual "can't self sign up as admin" control.
-- This runs server-side no matter what the client sends.
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data->>'requested_role';
  safe_role user_role;
begin
  -- Only 'vendor' is honored from the client; everything else (including
  -- 'admin', blank, or garbage) becomes 'customer'. Admin accounts can
  -- only be created by promoting an existing profile (see bottom of file).
  if requested_role = 'vendor' then
    safe_role := 'vendor';
  else
    safe_role := 'customer';
  end if;

  insert into public.profiles (id, name, email, role, phone, location, avatar_url, joined_date)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    safe_role,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'location',
    new.raw_user_meta_data->>'avatar_url',
    current_date
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prevent a user from ever promoting their own role via a client-side
-- profile update (UPDATE profiles SET role='admin' WHERE id=me).
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.role <> old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- =====================================================================
-- register_vendor() — atomic "become a vendor" RPC used by self sign-up.
-- Runs as security definer so it can insert a vendor row and link the
-- caller's own profile to it in one transaction, without needing a
-- broad "anyone can insert vendors" policy.
-- =====================================================================
create or replace function public.register_vendor(
  p_name text,
  p_tagline text,
  p_logo_url text,
  p_banner_url text,
  p_location text,
  p_email text,
  p_phone text
)
returns public.vendors
language plpgsql
security definer
set search_path = public
as $$
declare
  new_vendor public.vendors;
  existing_vendor_id text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select vendor_id into existing_vendor_id from public.profiles where id = auth.uid();
  if existing_vendor_id is not null then
    raise exception 'This account already has a vendor store.';
  end if;

  insert into public.vendors (name, tagline, logo_url, banner_url, location, email, phone, is_verified, rating, reviews_count)
  values (p_name, p_tagline, p_logo_url, p_banner_url, p_location, p_email, p_phone, false, 5, 0)
  returning * into new_vendor;

  update public.profiles set vendor_id = new_vendor.id where id = auth.uid();

  return new_vendor;
end;
$$;

grant execute on function public.register_vendor to authenticated;

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.vendors  enable row level security;
alter table public.products enable row level security;
alter table public.orders   enable row level security;

-- PROFILES: you can see your own row; admins can see every row.
-- (This is the core "users can't see other users except admin" rule.)
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- No client-side insert policy for profiles: rows are only created by
-- the handle_new_user() trigger above.

-- VENDORS: storefronts are public read (it's a marketplace), but only
-- the owning vendor's linked profile (or an admin) can change them.
drop policy if exists vendors_select on public.vendors;
create policy vendors_select on public.vendors for select using (true);

drop policy if exists vendors_insert on public.vendors;
create policy vendors_insert on public.vendors
  for insert with check (public.is_admin());  -- self sign-up uses register_vendor() instead

drop policy if exists vendors_update on public.vendors;
create policy vendors_update on public.vendors
  for update using (public.is_admin() or id = public.my_vendor_id());

drop policy if exists vendors_delete on public.vendors;
create policy vendors_delete on public.vendors
  for delete using (public.is_admin());

-- PRODUCTS: public read; only the owning vendor or an admin can write.
drop policy if exists products_select on public.products;
create policy products_select on public.products for select using (true);

drop policy if exists products_insert on public.products;
create policy products_insert on public.products
  for insert with check (public.is_admin() or vendor_id = public.my_vendor_id());

drop policy if exists products_update on public.products;
create policy products_update on public.products
  for update using (public.is_admin() or vendor_id = public.my_vendor_id());

drop policy if exists products_delete on public.products;
create policy products_delete on public.products
  for delete using (public.is_admin() or vendor_id = public.my_vendor_id());

-- ORDERS: a customer sees only their own orders; a vendor sees only
-- orders that contain at least one of their own products; admin sees all.
drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders
  for select using (
    customer_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from jsonb_array_elements(items) elem
      where elem->>'vendorId' = public.my_vendor_id()
    )
  );

drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders
  for insert with check (customer_id = auth.uid());

drop policy if exists orders_update on public.orders;
create policy orders_update on public.orders
  for update using (
    public.is_admin()
    or exists (
      select 1 from jsonb_array_elements(items) elem
      where elem->>'vendorId' = public.my_vendor_id()
    )
  );

drop policy if exists orders_delete on public.orders;
create policy orders_delete on public.orders
  for delete using (public.is_admin());

-- =====================================================================
-- CREATING YOUR FIRST ADMIN
-- =====================================================================
-- Self sign-up can never create an admin. To create one:
--   1. Sign up normally through the app as a customer (any email).
--   2. In the SQL editor, run:
--        update public.profiles set role = 'admin' where email = 'you@example.com';
--   That account can now promote/demote other users' roles from the app
--   or SQL — self sign-up remains locked to customer/vendor either way.
-- =====================================================================
