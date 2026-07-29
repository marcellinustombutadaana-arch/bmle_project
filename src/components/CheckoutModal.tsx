import React, { useState, useEffect } from 'react';
import { X, Check, Truck, CreditCard, ShieldCheck, MapPin, ArrowRight, ArrowLeft, PackageCheck, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, DeliveryAddress, ShippingCarrier, Order, OrderStatus, User } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  carriers: ShippingCarrier[];
  onOrderPlaced: (order: Order) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  carriers,
  onOrderPlaced,
  currentUser,
  onOpenAuth
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Address State
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: currentUser?.name || 'Kofi Mensah',
    street: '12 Independence Avenue, Ridge',
    city: 'Accra',
    state: 'Greater Accra',
    postalCode: 'GA-112',
    country: 'Ghana',
    phone: currentUser?.phone || '+233 24 456 7890'
  });

  useEffect(() => {
    if (currentUser) {
      setAddress(prev => ({
        ...prev,
        fullName: currentUser.name || prev.fullName,
        phone: currentUser.phone || prev.phone
      }));
    }
  }, [currentUser]);

  // Carrier State & Dynamic Calculation
  const [selectedCarrierId, setSelectedCarrierId] = useState<string>('fedex-express');
  const [calculatedRates, setCalculatedRates] = useState<Record<string, { fee: number; days: string }>>({});
  const [loadingRates, setLoadingRates] = useState(false);

  // Payment State (Mobile Money is primary in Ghana!)
  const [paymentMethod, setPaymentMethod] = useState<'momo_mtn' | 'momo_telecel' | 'momo_at' | 'credit_card' | 'bank_transfer'>('momo_mtn');
  const [momoNumber, setMomoNumber] = useState('0244567890');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Calculate carrier rates on address or cart change
  useEffect(() => {
    async function fetchCarrierRates() {
      setLoadingRates(true);
      const rates: Record<string, { fee: number; days: string }> = {};

      for (const carrier of carriers) {
        try {
          const res = await fetch('/api/shipping/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: cart.map(i => ({
                weightKg: i.product.weightKg,
                dimensionsCm: i.product.dimensionsCm,
                quantity: i.quantity
              })),
              carrierId: carrier.id,
              country: address.country,
              city: address.city,
              postalCode: address.postalCode,
              vendorLocations: ['East Legon, Accra', 'Adum, Kumasi', 'Ridge, Accra', 'Osu, Accra']
            })
          });
          const data = await res.json();
          rates[carrier.id] = {
            fee: data.shippingFee !== undefined ? data.shippingFee : carrier.baseRate,
            days: data.estimatedDays || carrier.estimatedDays
          };
        } catch (e) {
          rates[carrier.id] = { fee: carrier.baseRate, days: carrier.estimatedDays };
        }
      }
      setCalculatedRates(rates);
      setLoadingRates(false);
    }

    if (cart.length > 0) {
      fetchCarrierRates();
    }
  }, [address.country, address.city, address.postalCode, cart, carriers]);

  const selectedCarrier = carriers.find(c => c.id === selectedCarrierId) || carriers[0];
  const shippingFee = calculatedRates[selectedCarrierId]?.fee || selectedCarrier.baseRate;
  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% VAT / NHIL / GETFund
  const total = Math.round((subtotal + shippingFee + tax) * 100) / 100;

  const handleCompleteOrder = () => {
    if (!currentUser) {
      onClose();
      onOpenAuth();
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.error(e);
      }

      const trackingNum = `${selectedCarrier.code}-${Math.floor(1000 + Math.random() * 9000)}-GH`;

      const newOrder: Order = {
        id: `ord-${Math.floor(10000 + Math.random() * 90000)}`,
        trackingNumber: trackingNum,
        customerId: currentUser.id,
        customerName: address.fullName || currentUser.name,
        customerEmail: currentUser.email,
        shippingAddress: address,
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.imageUrl,
          vendorId: item.product.vendorId,
          vendorName: item.product.vendorName,
          unitPrice: item.product.price,
          quantity: item.quantity
        })),
        subtotal,
        shippingFee,
        tax,
        total,
        carrierId: selectedCarrier.id,
        carrierName: selectedCarrier.name,
        paymentMethod,
        paymentStatus: 'Paid',
        orderStatus: 'Order Confirmed',
        estimatedDeliveryDate: calculatedRates[selectedCarrierId]?.days || selectedCarrier.estimatedDays,
        createdAt: new Date().toISOString(),
        trackingEvents: [
          {
            id: `tr-${Date.now()}`,
            status: 'Order Confirmed',
            title: 'Payment Confirmed & Order Placed',
            location: `${address.city}, ${address.state}`,
            timestamp: 'Just Now',
            description: `Payment of GH₵ ${total.toFixed(2)} processed via ${paymentMethod.toUpperCase().replace('_', ' ')}. Order routed to vendor dispatch.`
          }
        ]
      };

      setIsSubmitting(false);
      onOrderPlaced(newOrder);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
          <div>
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Checkout</span>
            <h2 className="text-base sm:text-lg font-extrabold text-white">Delivery Logistics & Payment</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-3 sm:px-6 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-[11px] sm:text-xs font-semibold shrink-0">
          <div className={`flex items-center gap-1 sm:gap-1.5 ${step === 1 ? 'text-amber-400' : 'text-emerald-400'}`}>
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
            <span className="hidden sm:inline">Shipping Address</span>
            <span className="sm:hidden">Address</span>
          </div>
          <div className={`flex items-center gap-1 sm:gap-1.5 ${step === 2 ? 'text-amber-400' : step > 2 ? 'text-emerald-400' : 'text-slate-600'}`}>
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
            <span className="hidden sm:inline">Carrier Logistics</span>
            <span className="sm:hidden">Carrier</span>
          </div>
          <div className={`flex items-center gap-1 sm:gap-1.5 ${step === 3 ? 'text-amber-400' : 'text-slate-600'}`}>
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">3</span>
            <span className="hidden sm:inline">Payment & Complete</span>
            <span className="sm:hidden">Payment</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">

          {!currentUser && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-amber-300 font-medium">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>An account is required to place your order. Please sign in or register below.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold rounded-xl text-xs hover:brightness-110 shrink-0 transition-all shadow-md shadow-amber-500/20"
              >
                Sign In / Register
              </button>
            </div>
          )}

          {/* STEP 1: ADDRESS */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                Delivery Address
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">City</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">State / Province</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">ZIP / Postal Code</label>
                  <input
                    type="text"
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Country</label>
                  <input
                    type="text"
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CARRIER SELECTION */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                Select Integrated Shipping Provider
              </h3>
              <p className="text-xs text-slate-400">
                Shipping rates are dynamically computed based on package weight and distance.
              </p>

              <div className="space-y-3">
                {carriers.map(carrier => {
                  const rateInfo = calculatedRates[carrier.id];
                  const fee = rateInfo ? rateInfo.fee : carrier.baseRate;
                  const days = rateInfo ? rateInfo.days : carrier.estimatedDays;

                  return (
                    <div
                      key={carrier.id}
                      onClick={() => setSelectedCarrierId(carrier.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedCarrierId === carrier.id
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/5'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl font-bold">
                          {carrier.logo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 font-bold text-sm">
                            <span>{carrier.name}</span>
                            {carrier.badge && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                                {carrier.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Estimated: <span className="text-slate-200 font-medium">{days}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-base font-extrabold ${fee === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {fee === 0 ? 'FREE' : `GH₵ ${fee.toFixed(2)}`}
                        </div>
                        <div className="text-[10px] text-slate-500">{fee === 0 ? 'Local Vendor Free Zone' : 'Live Rate'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT & SUMMARY */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                Select Payment Method
              </h3>

              {/* Payment Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'momo_mtn', label: 'MTN MoMo', icon: '📱' },
                  { id: 'momo_telecel', label: 'Telecel Cash', icon: '🔴' },
                  { id: 'momo_at', label: 'AT Money', icon: '🔵' },
                  { id: 'credit_card', label: 'Debit / Card', icon: '💳' },
                  { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏛️' }
                ].map(pm => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-2.5 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === pm.id
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{pm.icon}</span>
                    <span>{pm.label}</span>
                  </button>
                ))}
              </div>

              {/* Mobile Money Prompt Input */}
              {(paymentMethod === 'momo_mtn' || paymentMethod === 'momo_telecel' || paymentMethod === 'momo_at') && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Instant Mobile Money USSD Prompt</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    A prompt will be sent to your phone number. Enter your MoMo PIN to authorize payment of <strong className="text-white">GH₵ {total.toFixed(2)}</strong>.
                  </p>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block mb-1">Registered MoMo Phone Number</label>
                    <input
                      type="tel"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      placeholder="024 XXX XXXX"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* Card Inputs */}
              {paymentMethod === 'credit_card' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold block mb-1">CVC Security Code</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer */}
              {paymentMethod === 'bank_transfer' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="text-slate-300 font-bold mb-1">Ghana Interbank Payment System (GhIPSS Instant Pay)</div>
                  <div className="text-slate-400">Bank: <strong className="text-white">GCB Bank / Ecobank Ghana</strong></div>
                  <div className="text-slate-400">Account Number: <strong className="text-white">1081134882019</strong></div>
                  <div className="text-slate-400">Reference: <strong className="text-amber-400">ORD-ACC-GH</strong></div>
                </div>
              )}

              {/* Order Summary */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span className="text-slate-200 font-semibold">GH₵ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Carrier Shipping ({selectedCarrier.name})</span>
                  <span className="text-slate-200 font-semibold">GH₵ {shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>VAT & Statutory Levies (5%)</span>
                  <span className="text-slate-200 font-semibold">GH₵ {tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-extrabold text-white">
                  <span>Total Amount Due</span>
                  <span className="text-amber-400 text-base">GH₵ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Controls */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((step + 1) as any)}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCompleteOrder}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 text-sm font-black shadow-lg shadow-amber-500/30 flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing Payment...' : `Pay GH₵ ${total.toFixed(2)} & Place Order`}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
