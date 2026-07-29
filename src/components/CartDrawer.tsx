import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Sparkles, Lock } from 'lucide-react';
import { CartItem, Vendor, User } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  vendors: Vendor[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  currentUser?: User | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  vendors,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  currentUser
}) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Group items by vendor
  const vendorGroups = cart.reduce((groups, item) => {
    const vId = item.product.vendorId;
    if (!groups[vId]) groups[vId] = [];
    groups[vId].push(item);
    return groups;
  }, {} as Record<string, CartItem[]>);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Your Marketplace Cart</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-300">Your cart is empty</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Browse products from verified vendors and add them to your cart.
                </p>
              </div>
            ) : (
              (Object.entries(vendorGroups) as [string, CartItem[]][]).map(([vendorId, items]) => {
                const vendor = vendors.find(v => v.id === vendorId);
                const vendorSubtotal = items.reduce((s, i) => s + (i.product.price * i.quantity), 0);
                const freeThreshold = vendor?.freeShippingThreshold || 0;
                const distanceToFree = freeThreshold - vendorSubtotal;

                return (
                  <div key={vendorId} className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 shadow-lg">
                    {/* Vendor Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        {vendor?.logoUrl ? (
                          <img src={vendor.logoUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                          <img src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80" alt="" className="w-5 h-5 rounded-full object-cover" />
                        )}
                        <span className="text-xs font-bold text-amber-400">{vendor?.name || 'Vendor'}</span>
                        {vendor?.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <span className="text-xs font-bold text-slate-200">GH₵ {vendorSubtotal.toFixed(2)}</span>
                    </div>

                    {/* Free Shipping Progress */}
                    {freeThreshold > 0 && (
                      <div className="mb-3 text-[11px] bg-slate-900 border border-slate-800 p-2 rounded-xl">
                        {distanceToFree <= 0 ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Qualifies for FREE Shipping with this vendor!</span>
                          </div>
                        ) : (
                          <div className="text-slate-400">
                            Add <span className="font-bold text-amber-400">GH₵ {distanceToFree.toFixed(2)}</span> more to get FREE shipping from {vendor?.name}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.product.id} className="flex items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <img
                            src={item.product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-200 truncate">{item.product.name}</h4>
                            <div className="text-[11px] text-amber-400 font-semibold mt-0.5">
                              GH₵ {item.product.price.toFixed(2)}
                            </div>
                          </div>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg p-1">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="w-5 h-5 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold px-1">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="w-5 h-5 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer Checkout Button */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 pb-24 md:pb-6 border-t border-slate-800 bg-slate-950/95 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 uppercase font-semibold">Subtotal</span>
                <span className="text-xl font-extrabold text-white">GH₵ {subtotal.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Shipping rates and taxes will be calculated dynamically at checkout based on carrier selection.
              </p>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all text-sm"
              >
                {!currentUser && <Lock className="w-4 h-4" />}
                <span>{currentUser ? 'Proceed to Integrated Checkout' : 'Sign In / Register to Place Order'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!currentUser && (
                <p className="text-[11px] text-amber-400/90 text-center font-medium flex items-center justify-center gap-1">
                  <span>🔒 An account is required to place orders. Sign in or register in 1-click.</span>
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
