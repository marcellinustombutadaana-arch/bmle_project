import { Vendor, Product, ShippingCarrier, Order } from '../types';

export const INITIAL_CARRIERS: ShippingCarrier[] = [
  {
    id: 'ghana-post-ems',
    name: 'Ghana Post Courier & EMS',
    code: 'GPOST',
    logo: '📮',
    baseRate: 30.00,
    perKgRate: 5.00,
    estimatedDays: '1 - 2 Business Days',
    badge: 'National Post & GPS',
    features: ['GhanaPostGPS Integrated', 'All 16 Ghana Regions', 'PO Box & Doorstep']
  },
  {
    id: 'vip-express',
    name: 'VIP Jeoun Express Courier',
    code: 'VIP',
    logo: '🚌',
    baseRate: 30.00,
    perKgRate: 4.50,
    estimatedDays: '1 - 2 Business Days',
    badge: 'Inter-City Terminal',
    features: ['Terminal-to-Terminal', 'SMS Alert on Arrival', 'Waybill Parcel Tracking']
  },
  {
    id: 'stc-express',
    name: 'STC Intercity Cargo Express',
    code: 'STC',
    logo: '🚚',
    baseRate: 30.00,
    perKgRate: 4.00,
    estimatedDays: '1 - 3 Business Days',
    badge: 'State Express Freight',
    features: ['Heavy Item Freight', 'Regional Depot Pickup', 'Insured Cargo']
  },
  {
    id: 'omnifleet-local',
    name: 'Speedy Rider Same-Day',
    code: 'SPEEDY',
    logo: '🛵',
    baseRate: 35.00,
    perKgRate: 3.50,
    estimatedDays: 'Same-Day (Accra & Kumasi)',
    badge: 'Express Bike Rider',
    features: ['Doorstep Delivery', 'Live Rider Call', 'MoMo On Delivery']
  },
  {
    id: 'fedex-express',
    name: 'FedEx / DHL Priority Ghana',
    code: 'EXPRESS',
    logo: '✈️',
    baseRate: 50.00,
    perKgRate: 8.00,
    estimatedDays: '1 Business Day',
    badge: 'Priority Doorstep',
    features: ['Instant Dispatch', 'Signature Security', 'Express Flight Link']
  }
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vendor-lumina',
    name: 'Lumina Audio Labs',
    tagline: 'Precision engineered wireless acoustics and audiophile hardware.',
    logoUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    reviewsCount: 328,
    location: 'East Legon, Accra, Ghana',
    email: 'support@luminaaudio.io',
    phone: '+233 24 123 4567',
    bankAccount: 'GCB Bank ****4902',
    preferredCarrier: 'fedex-express',
    freeShippingThreshold: 500,
    joinedDate: '2024-03-15',
    isVerified: true
  },
  {
    id: 'vendor-nordic',
    name: 'Asante Craft House',
    tagline: 'Handmade minimalist wood furniture and organic home decor.',
    logoUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    rating: 4.8,
    reviewsCount: 215,
    location: 'Adum, Kumasi, Ghana',
    email: 'orders@asantecrafthouse.com',
    phone: '+233 20 987 6543',
    bankAccount: 'Ecobank Ghana ****8812',
    preferredCarrier: 'ups-ground',
    freeShippingThreshold: 600,
    joinedDate: '2024-01-20',
    isVerified: true
  },
  {
    id: 'vendor-botanica',
    name: 'Aura Botanica Organics',
    tagline: 'Sustainably crafted shea butter, skin serums, and remedies.',
    logoUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1608248597261-23d242487fb1?auto=format&fit=crop&w=1200&q=80',
    rating: 4.95,
    reviewsCount: 412,
    location: 'Airport Residential, Accra, Ghana',
    email: 'hello@aurabotanica.co',
    phone: '+233 27 555 0199',
    bankAccount: 'Stanbic Bank ****1092',
    preferredCarrier: 'dhl-global',
    freeShippingThreshold: 300,
    joinedDate: '2023-11-10',
    isVerified: true
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-101',
    vendorId: 'vendor-lumina',
    vendorName: 'Lumina Audio Labs',
    name: 'AeroPulse ANC Wireless Headphones',
    category: 'Tech & Electronics',
    price: 850.00,
    stock: 45,
    weightKg: 0.42,
    dimensionsCm: { length: 20, width: 18, height: 8 },
    description: 'Active noise-cancelling studio wireless headphones with 45-hour battery life and custom beryllium drivers.',
    tags: ['wireless', 'audio', 'anc', 'headphones', 'premium'],
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    featured: true,
    createdAt: '2025-01-10'
  },
  {
    id: 'prod-102',
    vendorId: 'vendor-lumina',
    vendorName: 'Lumina Audio Labs',
    name: 'SoundSphere Portable Hi-Fi Speaker',
    category: 'Tech & Electronics',
    price: 620.00,
    stock: 30,
    weightKg: 0.85,
    dimensionsCm: { length: 15, width: 15, height: 18 },
    description: '360-degree spatial audio speaker with IPX7 waterproof rating and ambient LED ring.',
    tags: ['speaker', 'bluetooth', 'waterproof', 'audio'],
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    featured: false,
    createdAt: '2025-02-01'
  },
  {
    id: 'prod-103',
    vendorId: 'vendor-nordic',
    vendorName: 'Asante Craft House',
    name: 'Handcrafted Solid Mahogany Desk Stand',
    category: 'Home & Living',
    price: 420.00,
    stock: 18,
    weightKg: 1.80,
    dimensionsCm: { length: 50, width: 22, height: 12 },
    description: 'Carved from sustainable West African mahogany with a soft velvet underside to protect furniture.',
    tags: ['desk', 'mahogany', 'handcrafted', 'workspace'],
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
    featured: true,
    createdAt: '2025-01-18'
  },
  {
    id: 'prod-104',
    vendorId: 'vendor-nordic',
    vendorName: 'Asante Craft House',
    name: 'Artisanal Ceramic Pour-Over Coffee Set',
    category: 'Gourmet & Organic',
    price: 280.00,
    stock: 25,
    weightKg: 0.95,
    dimensionsCm: { length: 22, width: 18, height: 20 },
    description: 'Matte-finish stoneware coffee dripper and carafe set designed for optimal thermal extraction.',
    tags: ['coffee', 'ceramic', 'handmade', 'kitchen'],
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    featured: false,
    createdAt: '2025-02-12'
  },
  {
    id: 'prod-105',
    vendorId: 'vendor-botanica',
    vendorName: 'Aura Botanica Organics',
    name: 'Radiance Raw Shea Serum (50ml)',
    category: 'Beauty & Wellness',
    price: 180.00,
    stock: 60,
    weightKg: 0.20,
    dimensionsCm: { length: 8, width: 8, height: 12 },
    description: 'Cold-pressed Northern Ghana shea oil, rosehip, and jojoba blend for glowing skin hydration.',
    tags: ['skincare', 'sheabutter', 'vegan', 'beauty', 'ghana'],
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    featured: true,
    createdAt: '2025-01-25'
  },
  {
    id: 'prod-106',
    vendorId: 'vendor-botanica',
    vendorName: 'Aura Botanica Organics',
    name: 'Lemongrass & Wild Sage Reed Diffuser',
    category: 'Home & Living',
    price: 160.00,
    stock: 40,
    weightKg: 0.50,
    dimensionsCm: { length: 10, width: 10, height: 22 },
    description: 'Natural essential oil diffuser set in an amber glass apothecary bottle with natural rattan reeds.',
    tags: ['aromatherapy', 'diffuser', 'lemongrass', 'home'],
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    featured: false,
    createdAt: '2025-02-20'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-88912',
    trackingNumber: 'FDX-9901-GH',
    customerId: 'cust-101',
    customerName: 'Kofi Mensah',
    customerEmail: 'kofi.mensah@example.com',
    shippingAddress: {
      fullName: 'Kofi Mensah',
      street: '12 Independence Avenue, Ridge',
      city: 'Accra',
      state: 'Greater Accra',
      postalCode: 'GA-112',
      country: 'Ghana',
      phone: '+233 24 456 7890'
    },
    items: [
      {
        productId: 'prod-101',
        productName: 'AeroPulse ANC Wireless Headphones',
        productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        vendorId: 'vendor-lumina',
        vendorName: 'Lumina Audio Labs',
        unitPrice: 850.00,
        quantity: 1
      }
    ],
    subtotal: 850.00,
    shippingFee: 0,
    tax: 42.50,
    total: 892.50,
    carrierId: 'fedex-express',
    carrierName: 'FedEx Priority Ghana',
    paymentMethod: 'momo_mtn',
    paymentStatus: 'Paid',
    orderStatus: 'In Transit',
    estimatedDeliveryDate: 'Tomorrow, 3:00 PM',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    trackingEvents: [
      {
        id: 'tr-1',
        status: 'Order Confirmed',
        title: 'Payment Verified via Mobile Money (MoMo)',
        location: 'Accra, Greater Accra',
        timestamp: 'Yesterday, 09:15 AM',
        description: 'Order confirmed by Lumina Audio Labs.'
      },
      {
        id: 'tr-2',
        status: 'Label Generated',
        title: 'Shipping Waybill Created',
        location: 'East Legon Hub, Accra',
        timestamp: 'Yesterday, 02:30 PM',
        description: 'FedEx Waybill #FDX-9901-GH created. Package weight: 0.42kg.'
      },
      {
        id: 'tr-3',
        status: 'Carrier Picked Up',
        title: 'Picked up by FedEx Courier Rider',
        location: 'East Legon, Accra',
        timestamp: 'Yesterday, 06:10 PM',
        description: 'Scanned into Accra Central Sorting Facility.'
      },
      {
        id: 'tr-4',
        status: 'In Transit',
        title: 'In Transit - Regional Sorting Hub',
        location: 'Ridge Depot, Accra',
        timestamp: 'Today, 04:45 AM',
        description: 'Departed transit hub heading toward destination street address.'
      }
    ]
  }
];

