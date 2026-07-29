export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  vendorId?: string; // Links to vendor if role is vendor
  phone?: string;
  location?: string;
  avatarUrl?: string;
  joinedDate: string;
}

export type Category = 
  | 'Tech & Electronics'
  | 'Artisanal & Crafts'
  | 'Fashion & Apparel'
  | 'Home & Living'
  | 'Gourmet & Organic'
  | 'Beauty & Wellness'
  | 'Sports & Outdoors';

export interface Vendor {
  id: string;
  name: string;
  tagline: string;
  logoUrl: string;
  bannerUrl: string;
  rating: number;
  reviewsCount: number;
  location: string;
  email: string;
  phone: string;
  bankAccount: string;
  preferredCarrier: string;
  freeShippingThreshold?: number;
  joinedDate: string;
  isVerified: boolean;
}

export interface Product {
  id: string;
  vendorId: string;
  vendorName: string;
  name: string;
  category: Category;
  price: number;
  stock: number;
  weightKg: number;
  dimensionsCm: {
    length: number;
    width: number;
    height: number;
  };
  description: string;
  tags: string[];
  imageUrl: string;
  featured?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingCarrier {
  id: string;
  name: string;
  code: string;
  logo: string;
  baseRate: number;
  perKgRate: number;
  estimatedDays: string;
  badge?: string;
  features: string[];
}

export interface DeliveryAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export type OrderStatus = 
  | 'Pending Payment'
  | 'Order Confirmed'
  | 'Processing & Packing'
  | 'Label Generated'
  | 'Carrier Picked Up'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface TrackingEvent {
  id: string;
  status: OrderStatus;
  title: string;
  location: string;
  timestamp: string;
  description: string;
}

export interface Order {
  id: string;
  trackingNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: DeliveryAddress;
  items: {
    productId: string;
    productName: string;
    productImage: string;
    vendorId: string;
    vendorName: string;
    unitPrice: number;
    quantity: number;
  }[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  carrierId: string;
  carrierName: string;
  paymentMethod: 'momo_mtn' | 'momo_telecel' | 'momo_at' | 'credit_card' | 'bank_transfer' | 'digital_wallet' | 'bnpl_klarna' | 'crypto';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  orderStatus: OrderStatus;
  trackingEvents: TrackingEvent[];
  estimatedDeliveryDate: string;
  createdAt: string;
  dispatchLabelUrl?: string;
}

export interface VendorStats {
  totalSales: number;
  totalOrders: number;
  pendingDispatch: number;
  activeProducts: number;
  averageRating: number;
}
