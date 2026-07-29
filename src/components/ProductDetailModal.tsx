import React, { useState } from 'react';
import { X, ShieldCheck, Truck, Package, MapPin, CheckCircle2, ShoppingBag, Star, Calculator } from 'lucide-react';
import { Product, Vendor, ShippingCarrier } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  vendor: Vendor | null;
  carriers: ShippingCarrier[];
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  vendor,
  carriers,
  onClose,
  onAddToCart
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [testPostalCode, setTestPostalCode] = useState('GA-112');
  const [testCountry, setTestCountry] = useState('Ghana');
  const [calculatingRates, setCalculatingRates] = useState(false);
  const [calculatedRates, setCalculatedRates] = useState<{ carrierName: string; fee: number; days: string }[] | null>(null);

  const handleCalculateShipping = async () => {
    setCalculatingRates(true);
    try {
      const results = [];
      for (const carrier of carriers) {
        const res = await fetch('/api/shipping/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [{ weightKg: product.weightKg, dimensionsCm: product.dimensionsCm, quantity }],
            carrierId: carrier.id,
            country: testCountry,
            postalCode: testPostalCode
          })
        });
        const data = await res.json();
        results.push({
          carrierName: carrier.name,
          fee: data.shippingFee,
          days: data.estimatedDays
        });
      }
      setCalculatedRates(results);
    } catch (e) {
      console.error(e);
    } finally {
      setCalculatingRates(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-3xl w-full my-auto max-h-[92vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
          
          {/* Left Column: Image & Vendor Card */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 text-xs font-semibold text-slate-300 border border-slate-800 backdrop-blur">
                {product.category}
              </span>
            </div>

            {/* Vendor Details Box */}
            {vendor && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={vendor.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80'}
                      alt={vendor.name}
                      className="w-10 h-10 rounded-full object-cover border border-amber-500/40"
                    />
                    <div>
                      <div className="flex items-center gap-1 text-sm font-bold text-white">
                        <span>{vendor.name}</span>
                        {vendor.isVerified && <ShieldCheck className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {vendor.rating} ({vendor.reviewsCount})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {vendor.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2 italic line-clamp-2">
                  "{vendor.tagline}"
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Title, Specs, Shipping Estimator, Purchase */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                {product.vendorName}
              </div>
              <h2 className="text-xl font-bold text-white leading-snug">
                {product.name}
              </h2>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-black text-amber-400">
                  GH₵ {product.price.toFixed(2)}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  product.stock > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {product.stock > 0 ? `${product.stock} Units Ready to Ship` : 'Sold Out'}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                {product.description}
              </p>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {product.tags.map(tag => (
                  <span key={tag} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700/60">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Package Specs */}
              <div className="mt-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-slate-500 block text-[10px]">Weight</span>
                    <span className="font-semibold text-slate-200">{product.weightKg} kg</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-slate-500 block text-[10px]">Dimensions (L x W x H)</span>
                    <span className="font-semibold text-slate-200">
                      {product.dimensionsCm.length} x {product.dimensionsCm.width} x {product.dimensionsCm.height} cm
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Shipping Estimator */}
              <div className="mt-5 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-amber-400" />
                    Live Carrier Delivery Estimator
                  </span>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={testPostalCode}
                    onChange={(e) => setTestPostalCode(e.target.value)}
                    placeholder="ZIP / Postal Code"
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                  />
                  <button
                    onClick={handleCalculateShipping}
                    disabled={calculatingRates}
                    className="w-1/2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold py-1.5 rounded-lg border border-slate-700 transition-colors"
                  >
                    {calculatingRates ? 'Calculating...' : 'Calculate Shipping'}
                  </button>
                </div>

                {calculatedRates && (
                  <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                    {calculatedRates.map((r, i) => (
                      <div key={i} className="flex items-center justify-between py-1 border-b border-slate-900 last:border-0">
                        <span className="text-slate-300 font-medium">{r.carrierName} ({r.days})</span>
                        <span className="font-bold text-amber-400">GH₵ {r.fee.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Quantity & Add to Cart Action */}
            <div className="mt-6 border-t border-slate-800 pt-4 flex items-center gap-3">
              <div className="flex items-center border border-slate-800 rounded-xl bg-slate-950 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-slate-400 hover:text-white font-bold"
                >
                  -
                </button>
                <span className="px-3 text-sm font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 text-slate-400 hover:text-white font-bold"
                >
                  +
                </button>
              </div>

              <button
                disabled={product.stock <= 0}
                onClick={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add {quantity} to Cart (GH₵ {(product.price * quantity).toFixed(2)})</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
