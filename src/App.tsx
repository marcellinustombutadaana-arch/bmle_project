import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Marketplace } from './components/Marketplace';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { VendorHub } from './components/VendorHub';
import { OrderTracking } from './components/OrderTracking';
import { VendorRegisterModal } from './components/VendorRegisterModal';
import { AdminHub } from './components/AdminHub';
import { AuthPage } from './components/AuthPage';
import { storage } from './services/storage';
import { supabase } from './services/supabaseClient';
import { Vendor, Product, Order, CartItem, ShippingCarrier, User } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'vendor' | 'tracking' | 'admin'>('marketplace');
  
  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // State from storage
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([]);
  const [activeVendorId, setActiveVendorId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals & Drawers state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isRegisterVendorOpen, setIsRegisterVendorOpen] = useState(false);

  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Reload everything that's scoped to "who's logged in" — vendors and
  // products are public, but orders are filtered server-side by RLS
  // based on the current session (own orders / own vendor's orders / all).
  const refreshAllData = async (user: User | null) => {
    const [loadedVendors, loadedProducts, loadedOrders] = await Promise.all([
      storage.getVendors(),
      storage.getProducts(),
      storage.getOrders(),
    ]);
    setVendors(loadedVendors);
    setProducts(loadedProducts);
    setOrders(loadedOrders);
    setCarriers(storage.getCarriers());
    setActiveVendorId(user?.vendorId || storage.getActiveVendorId());
    setCart(storage.getCart());
  };

  // Load initial session + data, and keep it in sync with real auth state
  // (e.g. token refresh, logout in another tab) rather than a one-shot read.
  useEffect(() => {
    let isMounted = true;

    (async () => {
      const user = await storage.getCurrentUser();
      if (!isMounted) return;
      setCurrentUser(user);
      await refreshAllData(user);
      if (isMounted) setIsLoadingSession(false);
    })();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setCurrentUser(null);
        return;
      }
      const profile = await storage.getProfile(session.user.id);
      setCurrentUser(profile);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Enforce role-based navigation tab visibility
  useEffect(() => {
    if (!currentUser || currentUser.role === 'customer') {
      if (activeTab === 'vendor' || activeTab === 'admin') {
        setActiveTab('marketplace');
      }
    } else if (currentUser.role === 'vendor') {
      if (activeTab === 'admin') {
        setActiveTab('vendor');
      }
    }
  }, [currentUser, activeTab]);

  const activeVendor = vendors.find(v => v.id === activeVendorId) || vendors[0] || {
    id: 'vendor-fallback',
    name: 'BMLE Merchant',
    tagline: 'Quality faith-based goods across Ghana',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    rating: 5,
    reviewsCount: 1,
    location: 'Accra, Ghana',
    email: '',
    phone: '',
    bankAccount: '',
    preferredCarrier: 'fedex-express',
    joinedDate: '2025-01-01',
    isVerified: true
  };

  const handleSelectVendor = (vendorId: string) => {
    setActiveVendorId(vendorId);
    storage.setActiveVendorId(vendorId);
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    const existingIndex = cart.findIndex(i => i.product.id === product.id);
    let updatedCart: CartItem[];

    if (existingIndex > -1) {
      updatedCart = [...cart];
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart = [...cart, { product, quantity }];
    }

    setCart(updatedCart);
    storage.saveCart(updatedCart);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    let updatedCart: CartItem[];
    if (quantity <= 0) {
      updatedCart = cart.filter(i => i.product.id !== productId);
    } else {
      updatedCart = cart.map(i => i.product.id === productId ? { ...i, quantity } : i);
    }
    setCart(updatedCart);
    storage.saveCart(updatedCart);
  };

  const handleRemoveCartItem = (productId: string) => {
    const updatedCart = cart.filter(i => i.product.id !== productId);
    setCart(updatedCart);
    storage.saveCart(updatedCart);
  };

  const handleAddProduct = async (newProduct: Product) => {
    await storage.addProduct(newProduct);
    setProducts(await storage.getProducts());
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    await storage.updateProduct(updatedProduct);
    setProducts(await storage.getProducts());
  };

  const handleDeleteProduct = async (productId: string) => {
    await storage.deleteProduct(productId);
    setProducts(await storage.getProducts());
  };

  const handleRegisterVendor = async (newVendor: Vendor) => {
    await storage.addVendor(newVendor);
    setVendors(await storage.getVendors());
    setActiveVendorId(newVendor.id);
    storage.setActiveVendorId(newVendor.id);
  };

  const handleOrderPlaced = async (newOrder: Order) => {
    await storage.addOrder(newOrder);
    setOrders(await storage.getOrders());
    // Clear cart
    setCart([]);
    storage.clearCart();
    // Switch tab to tracking
    setActiveTab('tracking');
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    await storage.updateOrder(updatedOrder);
    setOrders(await storage.getOrders());
  };

  const handleCancelOrder = async (orderId: string, reason?: string) => {
    const updated = await storage.cancelOrder(orderId, reason);
    setOrders(updated);
  };

  const handleDeleteOrder = async (orderId: string) => {
    const updated = await storage.deleteOrder(orderId);
    setOrders(updated);
  };

  const [authReasonMessage, setAuthReasonMessage] = useState<string>('');
  const [pendingCheckoutAfterAuth, setPendingCheckoutAfterAuth] = useState(false);

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      setAuthReasonMessage('Account Required to Place Order: Please sign in or register an account to complete your purchase.');
      setPendingCheckoutAfterAuth(true);
      setIsAuthOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    setAuthReasonMessage('');
    await refreshAllData(user);

    if (pendingCheckoutAfterAuth) {
      setPendingCheckoutAfterAuth(false);
      setIsCheckoutOpen(true);
      return;
    }

    if (user.role === 'admin') {
      setActiveTab('admin');
    } else if (user.role === 'vendor') {
      if (user.vendorId) {
        handleSelectVendor(user.vendorId);
      }
      setActiveTab('vendor');
    } else {
      setActiveTab('marketplace');
    }
  };

  const handleLogout = async () => {
    await storage.signOut();
    setCurrentUser(null);
    setActiveTab('marketplace');
    await refreshAllData(null);
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-amber-400 text-xs font-bold uppercase tracking-widest animate-pulse">
          Loading BMLE…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
      
      {/* System Atmospheric Background Images & Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-luminosity scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=2000&q=80')` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.12),rgba(2,6,23,0.96))]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Top Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          vendors={vendors}
          activeVendor={activeVendor}
          onSelectVendor={handleSelectVendor}
          onOpenRegisterVendor={() => setIsRegisterVendorOpen(true)}
          cart={cart}
          onOpenCart={() => setIsCartOpen(true)}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />

        {/* Main Views */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-28 md:pb-16">
          {activeTab === 'marketplace' && (
            <Marketplace
              products={products}
              vendors={vendors}
              onSelectProduct={(prod) => setSelectedProduct(prod)}
              onAddToCart={(prod) => handleAddToCart(prod, 1)}
              onOpenRegisterVendor={() => setIsRegisterVendorOpen(true)}
            />
          )}

          {activeTab === 'vendor' && (
            <VendorHub
              activeVendor={activeVendor}
              products={products}
              orders={orders}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onUpdateOrder={handleUpdateOrder}
              onCancelOrder={handleCancelOrder}
              onDeleteOrder={handleDeleteOrder}
              onOpenRegisterVendor={() => setIsRegisterVendorOpen(true)}
            />
          )}

          {activeTab === 'tracking' && (
            <OrderTracking
              orders={orders}
            />
          )}

          {activeTab === 'admin' && (
            <AdminHub
              currentUser={currentUser}
              vendors={vendors}
              setVendors={setVendors}
              products={products}
              orders={orders}
              onCancelOrder={handleCancelOrder}
              onDeleteOrder={handleDeleteOrder}
              onOpenRegisterVendor={() => setIsRegisterVendorOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        vendor={vendors.find(v => v.id === selectedProduct?.vendorId) || null}
        carriers={carriers}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Side Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        vendors={vendors}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
        currentUser={currentUser}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        carriers={carriers}
        onOrderPlaced={handleOrderPlaced}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthReasonMessage('Account Required to Place Order: Please sign in or register an account to complete your purchase.');
          setPendingCheckoutAfterAuth(true);
          setIsAuthOpen(true);
        }}
      />

      {/* Register Vendor Modal */}
      <VendorRegisterModal
        isOpen={isRegisterVendorOpen}
        onClose={() => setIsRegisterVendorOpen(false)}
        onRegister={handleRegisterVendor}
      />

      {/* Auth Modal / Page Overlay */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <AuthPage
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => {
              setIsAuthOpen(false);
              setAuthReasonMessage('');
              setPendingCheckoutAfterAuth(false);
            }}
            message={authReasonMessage}
          />
        </div>
      )}

    </div>
  );
}
