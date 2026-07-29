import { Vendor, Product, Order, OrderStatus, ShippingCarrier, CartItem, User, UserRole } from '../types';
import { INITIAL_CARRIERS } from '../data/mockData';
import { supabase } from './supabaseClient';

// Cart is intentionally the only thing left in the browser: it's
// ephemeral, pre-purchase, per-device state — not another user's data —
// so there's no privacy reason to put it in the database.
const CART_KEY = 'bmle_cart_v3';

// ---------------------------------------------------------------------
// Row <-> App type mapping (DB is snake_case, app types are camelCase)
// ---------------------------------------------------------------------
const rowToUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role as UserRole,
  vendorId: row.vendor_id || undefined,
  phone: row.phone || undefined,
  location: row.location || undefined,
  avatarUrl: row.avatar_url || undefined,
  joinedDate: row.joined_date,
});

const rowToVendor = (row: any): Vendor => ({
  id: row.id,
  name: row.name,
  tagline: row.tagline || '',
  logoUrl: row.logo_url || '',
  bannerUrl: row.banner_url || '',
  rating: Number(row.rating ?? 5),
  reviewsCount: row.reviews_count ?? 0,
  location: row.location || '',
  email: row.email || '',
  phone: row.phone || '',
  bankAccount: row.bank_account || '',
  preferredCarrier: row.preferred_carrier || 'ghana-post-ems',
  freeShippingThreshold: row.free_shipping_threshold ?? undefined,
  joinedDate: row.joined_date,
  isVerified: !!row.is_verified,
});

const vendorToRow = (v: Partial<Vendor>) => ({
  ...(v.id ? { id: v.id } : {}),
  name: v.name,
  tagline: v.tagline,
  logo_url: v.logoUrl,
  banner_url: v.bannerUrl,
  rating: v.rating,
  reviews_count: v.reviewsCount,
  location: v.location,
  email: v.email,
  phone: v.phone,
  bank_account: v.bankAccount,
  preferred_carrier: v.preferredCarrier,
  free_shipping_threshold: v.freeShippingThreshold,
  joined_date: v.joinedDate,
  is_verified: v.isVerified,
});

const rowToProduct = (row: any): Product => ({
  id: row.id,
  vendorId: row.vendor_id,
  vendorName: row.vendor_name || '',
  name: row.name,
  category: row.category,
  price: Number(row.price),
  stock: row.stock,
  weightKg: Number(row.weight_kg ?? 0.5),
  dimensionsCm: row.dimensions_cm || { length: 10, width: 10, height: 10 },
  description: row.description || '',
  tags: row.tags || [],
  imageUrl: row.image_url || '',
  featured: !!row.featured,
  createdAt: row.created_at,
});

const productToRow = (p: Partial<Product>) => ({
  ...(p.id ? { id: p.id } : {}),
  vendor_id: p.vendorId,
  vendor_name: p.vendorName,
  name: p.name,
  category: p.category,
  price: p.price,
  stock: p.stock,
  weight_kg: p.weightKg,
  dimensions_cm: p.dimensionsCm,
  description: p.description,
  tags: p.tags,
  image_url: p.imageUrl,
  featured: p.featured,
  ...(p.createdAt ? { created_at: p.createdAt } : {}),
});

const rowToOrder = (row: any): Order => ({
  id: row.id,
  trackingNumber: row.tracking_number,
  customerId: row.customer_id,
  customerName: row.customer_name,
  customerEmail: row.customer_email,
  shippingAddress: row.shipping_address,
  items: row.items || [],
  subtotal: Number(row.subtotal ?? 0),
  shippingFee: Number(row.shipping_fee ?? 0),
  tax: Number(row.tax ?? 0),
  total: Number(row.total ?? 0),
  carrierId: row.carrier_id,
  carrierName: row.carrier_name,
  paymentMethod: row.payment_method,
  paymentStatus: row.payment_status,
  orderStatus: row.order_status,
  trackingEvents: row.tracking_events || [],
  estimatedDeliveryDate: row.estimated_delivery_date,
  createdAt: row.created_at,
  dispatchLabelUrl: row.dispatch_label_url || undefined,
});

const orderToRow = (o: Partial<Order>) => ({
  ...(o.id ? { id: o.id } : {}),
  tracking_number: o.trackingNumber,
  customer_id: o.customerId,
  customer_name: o.customerName,
  customer_email: o.customerEmail,
  shipping_address: o.shippingAddress,
  items: o.items,
  subtotal: o.subtotal,
  shipping_fee: o.shippingFee,
  tax: o.tax,
  total: o.total,
  carrier_id: o.carrierId,
  carrier_name: o.carrierName,
  payment_method: o.paymentMethod,
  payment_status: o.paymentStatus,
  order_status: o.orderStatus,
  tracking_events: o.trackingEvents,
  estimated_delivery_date: o.estimatedDeliveryDate,
  dispatch_label_url: o.dispatchLabelUrl,
});

function assertOk<T>(data: T | null, error: any, context: string): T {
  if (error) {
    console.error(`${context} failed:`, error);
    throw new Error(error.message || `${context} failed`);
  }
  return data as T;
}

export const storage = {
  // -------------------------------------------------------------
  // AUTH / CURRENT USER — real Supabase Auth session, not a guess
  // -------------------------------------------------------------
  async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return this.getProfile(session.user.id);
  },

  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) {
      console.error('getProfile failed:', error);
      return null;
    }
    return data ? rowToUser(data) : null;
  },

  // Admin-only: RLS ensures this returns every profile for an admin and
  // only the caller's own single row for anyone else — the client never
  // has to enforce that boundary itself.
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('profiles').select('*').order('joined_date', { ascending: false });
    const rows = assertOk(data, error, 'getUsers');
    return rows.map(rowToUser);
  },

  async signOut() {
    await supabase.auth.signOut();
  },

  // -------------------------------------------------------------
  // VENDORS
  // -------------------------------------------------------------
  async getVendors(): Promise<Vendor[]> {
    const { data, error } = await supabase.from('vendors').select('*').order('joined_date', { ascending: false });
    const rows = assertOk(data, error, 'getVendors');
    return rows.map(rowToVendor);
  },

  // Used by self sign-up: atomically creates the vendor row and links it
  // to the caller's own profile via the register_vendor() RPC.
  async registerVendorForCurrentUser(v: {
    name: string; tagline: string; logoUrl: string; bannerUrl: string;
    location: string; email: string; phone: string;
  }): Promise<Vendor> {
    const { data, error } = await supabase.rpc('register_vendor', {
      p_name: v.name,
      p_tagline: v.tagline,
      p_logo_url: v.logoUrl,
      p_banner_url: v.bannerUrl,
      p_location: v.location,
      p_email: v.email,
      p_phone: v.phone,
    });
    const row = assertOk(data, error, 'registerVendorForCurrentUser');
    return rowToVendor(row);
  },

  // Admin-only path (RLS enforces this): onboarding a vendor on someone's behalf.
  async addVendor(vendor: Vendor): Promise<Vendor> {
    const { data, error } = await supabase.from('vendors').insert(vendorToRow(vendor)).select().single();
    const row = assertOk(data, error, 'addVendor');
    return rowToVendor(row);
  },

  async toggleVendorVerification(vendorId: string): Promise<Vendor[]> {
    const { data: current, error: fetchErr } = await supabase.from('vendors').select('is_verified').eq('id', vendorId).single();
    assertOk(current, fetchErr, 'toggleVendorVerification (fetch)');
    const { error } = await supabase.from('vendors').update({ is_verified: !current!.is_verified }).eq('id', vendorId);
    if (error) throw new Error(error.message);
    return this.getVendors();
  },

  async deleteVendor(vendorId: string): Promise<Vendor[]> {
    const { error } = await supabase.from('vendors').delete().eq('id', vendorId);
    if (error) throw new Error(error.message);
    return this.getVendors();
  },

  // -------------------------------------------------------------
  // PRODUCTS
  // -------------------------------------------------------------
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    const rows = assertOk(data, error, 'getProducts');
    return rows.map(rowToProduct);
  },

  async addProduct(product: Product): Promise<Product> {
    const { data, error } = await supabase.from('products').insert(productToRow(product)).select().single();
    const row = assertOk(data, error, 'addProduct');
    return rowToProduct(row);
  },

  async updateProduct(product: Product): Promise<void> {
    const { id, ...rest } = productToRow(product);
    const { error } = await supabase.from('products').update(rest).eq('id', product.id);
    if (error) throw new Error(error.message);
  },

  async deleteProduct(productId: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw new Error(error.message);
  },

  // -------------------------------------------------------------
  // ORDERS — RLS already scopes rows to "mine" (customer), "mine"
  // (vendor's own items), or "all" (admin), so getOrders() just works.
  // -------------------------------------------------------------
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const rows = assertOk(data, error, 'getOrders');
    return rows.map(rowToOrder);
  },

  async addOrder(order: Order): Promise<Order> {
    const { data, error } = await supabase.from('orders').insert(orderToRow(order)).select().single();
    const row = assertOk(data, error, 'addOrder');
    return rowToOrder(row);
  },

  async updateOrder(order: Order): Promise<void> {
    const { id, ...rest } = orderToRow(order);
    const { error } = await supabase.from('orders').update(rest).eq('id', order.id);
    if (error) throw new Error(error.message);
  },

  async deleteOrder(orderId: string): Promise<Order[]> {
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) throw new Error(error.message);
    return this.getOrders();
  },

  async cancelOrder(orderId: string, reason?: string): Promise<Order[]> {
    const { data: current, error: fetchErr } = await supabase.from('orders').select('tracking_events').eq('id', orderId).single();
    assertOk(current, fetchErr, 'cancelOrder (fetch)');

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const trackingEvents = [
      ...((current!.tracking_events as any[]) || []),
      {
        id: `evt-${Date.now()}`,
        status: 'Cancelled' as OrderStatus,
        title: 'Order Cancelled',
        location: 'Merchant / Admin Hub',
        timestamp: now,
        description: reason || 'Order has been cancelled by the vendor or system administrator.',
      },
    ];

    const { error } = await supabase
      .from('orders')
      .update({ order_status: 'Cancelled', payment_status: 'Refunded', tracking_events: trackingEvents })
      .eq('id', orderId);
    if (error) throw new Error(error.message);
    return this.getOrders();
  },

  // -------------------------------------------------------------
  // CARRIERS — static config, no DB needed
  // -------------------------------------------------------------
  getCarriers(): ShippingCarrier[] {
    return INITIAL_CARRIERS;
  },

  // -------------------------------------------------------------
  // ACTIVE VENDOR (vendor-portal UI convenience, not user data)
  // -------------------------------------------------------------
  getActiveVendorId(): string {
    return localStorage.getItem('bmle_active_vendor_v3') || '';
  },

  setActiveVendorId(id: string) {
    localStorage.setItem('bmle_active_vendor_v3', id);
  },

  // -------------------------------------------------------------
  // CART — per-device only, not synced or shared
  // -------------------------------------------------------------
  getCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  saveCart(cart: CartItem[]) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  },

  clearCart() {
    localStorage.removeItem(CART_KEY);
  },
};
