import React, { useState } from 'react';
import { X, Store, ShieldCheck, MapPin, Building, Sparkles } from 'lucide-react';
import { Vendor } from '../types';
import { ImageUploader } from './ImageUploader';

interface VendorRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (vendor: Vendor) => void;
}

export const VendorRegisterModal: React.FC<VendorRegisterModalProps> = ({
  isOpen,
  onClose,
  onRegister
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [location, setLocation] = useState('Osu, Accra, Ghana');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+233 24 555 0188');
  const [bankAccount, setBankAccount] = useState('GCB Bank ****9012');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newVendor: Vendor = {
      id: `vendor-${Date.now()}`,
      name,
      tagline: tagline || 'Quality artisan products shipped direct across Ghana.',
      logoUrl: logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80',
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
      rating: 5.0,
      reviewsCount: 1,
      location,
      email: email || `contact@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone,
      bankAccount,
      preferredCarrier: 'fedex-express',
      freeShippingThreshold: 500,
      joinedDate: new Date().toISOString().split('T')[0],
      isVerified: true
    };

    onRegister(newVendor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8">
        
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Register Merchant Brand on BMLE</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold uppercase">Store / Enterprise Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aseda Crafts & Sound Labs"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold uppercase">Brand Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Handcrafted quality Ghanaian goods and tech."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">Location in Ghana</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold uppercase">Support Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="support@merchant.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold uppercase">Payout Bank or MoMo Account</label>
            <input
              type="text"
              required
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="GCB Bank or MTN MoMo Number"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
            />
          </div>

          {/* REAL FILE IMAGE UPLOADS FOR LOGO AND BANNER */}
          <div className="space-y-4 pt-2 border-t border-slate-800/80">
            <ImageUploader
              label="Vendor Brand Logo (Upload Picture File)"
              value={logoUrl}
              onChange={setLogoUrl}
              aspectRatio="square"
              placeholder="Select Logo image file from computer or phone"
            />

            <ImageUploader
              label="Vendor Storefront Banner (Upload Picture File)"
              value={bannerUrl}
              onChange={setBannerUrl}
              aspectRatio="banner"
              placeholder="Select Store Banner image file from computer or phone"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:brightness-110 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
          >
            Register Merchant Brand
          </button>
        </form>

      </div>
    </div>
  );
};

