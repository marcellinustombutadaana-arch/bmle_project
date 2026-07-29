import React, { useState } from 'react';
import { Store, ShoppingBag, Truck, PlusCircle, ChevronDown, ShieldCheck, Building2, User as UserIcon, LogOut, Lock, LogIn, Menu, X, Sparkles } from 'lucide-react';
import { Vendor, CartItem, User } from '../types';

interface NavbarProps {
  activeTab: 'marketplace' | 'vendor' | 'tracking' | 'admin';
  setActiveTab: (tab: 'marketplace' | 'vendor' | 'tracking' | 'admin') => void;
  vendors: Vendor[];
  activeVendor: Vendor;
  onSelectVendor: (vendorId: string) => void;
  onOpenRegisterVendor: () => void;
  cart: CartItem[];
  onOpenCart: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  vendors,
  activeVendor,
  onSelectVendor,
  onOpenRegisterVendor,
  cart,
  onOpenCart,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Mobile Menu Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 flex items-center gap-1.5 transition-all"
              aria-label="Open Mobile Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button 
              onClick={() => {
                setActiveTab('marketplace');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 sm:gap-2.5 text-left group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                  BMLE
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700 uppercase tracking-wider">
                  Believers Link
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'marketplace'
                  ? 'bg-slate-800 text-amber-400 shadow-inner'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Marketplace</span>
            </button>

            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'tracking'
                  ? 'bg-slate-800 text-amber-400 shadow-inner'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Track Deliveries</span>
            </button>

            {/* Merchant Portal Link - Only for Vendor or Admin */}
            {(currentUser?.role === 'vendor' || currentUser?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('vendor')}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'vendor'
                    ? 'bg-slate-800 text-amber-400 shadow-inner'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span>Merchant Portal</span>
              </button>
            )}

            {/* Admin Hub Link - Only for Admin */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sys Admin</span>
              </button>
            )}
          </nav>

          {/* Right Actions: Active Vendor Selector (for Vendors/Admins), Cart & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Vendor Switcher - Only for Vendors or Admin */}
            {(currentUser?.role === 'vendor' || currentUser?.role === 'admin') && (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setVendorDropdownOpen(!vendorDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-colors"
                >
                  <img
                    src={activeVendor.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80'}
                    alt={activeVendor.name}
                    className="w-5 h-5 rounded-full object-cover border border-amber-500/50"
                  />
                  <span className="max-w-[110px] truncate font-medium">
                    {activeVendor.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {vendorDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setVendorDropdownOpen(false)}
                  >
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      Switch Active Merchant
                    </div>

                    <div className="max-h-60 overflow-y-auto py-1">
                      {vendors.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => {
                            onSelectVendor(v.id);
                            setVendorDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-800 text-xs transition-colors ${
                            v.id === activeVendor.id ? 'bg-amber-500/10 text-amber-300 font-medium' : 'text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img src={v.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80'} alt={v.name} className="w-6 h-6 rounded-full object-cover" />
                            <span className="truncate">{v.name}</span>
                          </div>
                          {v.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-slate-800 p-2">
                      <button
                        onClick={() => {
                          onOpenRegisterVendor();
                          setVendorDropdownOpen(false);
                        }}
                        className="w-full py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Register New Vendor</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-slate-900 text-amber-400 border border-amber-500 text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Login Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-white transition-all min-h-[40px]"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-amber-400/50"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="font-bold text-xs max-w-[90px] truncate">{currentUser.name}</div>
                    <div className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">{currentUser.role}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="p-3 bg-slate-950 rounded-xl mb-2">
                      <div className="font-bold text-xs text-white truncate">{currentUser.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {currentUser.role} Account
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onOpenAuth();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full py-2.5 px-3 hover:bg-slate-800 text-xs text-slate-300 rounded-xl text-left flex items-center gap-2 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-amber-400" />
                      <span>Switch Account / Sign In</span>
                    </button>

                    <button
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full py-2.5 px-3 hover:bg-rose-500/20 text-xs text-rose-400 rounded-xl text-left flex items-center gap-2 transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all min-h-[40px]"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Log In</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>

    {/* Full Responsive Slide-out Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Menu Body */}
          <div className="relative w-4/5 max-w-sm bg-slate-900 border-r border-slate-800 h-full overflow-y-auto z-10 p-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-white text-base">BMLE Ghana</div>
                    <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Believers Linkage</div>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Navigation Links */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">Navigation Menu</div>

                <button
                  onClick={() => {
                    setActiveTab('marketplace');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                    activeTab === 'marketplace'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-950/60 text-slate-300 border border-slate-800/80 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>Marketplace Shop</span>
                  </div>
                  <span className="text-[10px] font-normal text-slate-500">Products</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('tracking');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                    activeTab === 'tracking'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-950/60 text-slate-300 border border-slate-800/80 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>Track Parcel Deliveries</span>
                  </div>
                  <span className="text-[10px] font-normal text-slate-500">Logistics</span>
                </button>

                {(currentUser?.role === 'vendor' || currentUser?.role === 'admin') && (
                  <button
                    onClick={() => {
                      setActiveTab('vendor');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                      activeTab === 'vendor'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-950/60 text-slate-300 border border-slate-800/80 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Store className="w-4 h-4 text-amber-400" />
                      <span>Merchant Hub</span>
                    </div>
                    <span className="text-[10px] font-semibold text-amber-400">Portal</span>
                  </button>
                )}

                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setActiveTab('admin');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${
                      activeTab === 'admin'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4" />
                      <span>System Admin Hub</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold">Admin</span>
                  </button>
                )}
              </div>

              {/* Active Vendor Store Switcher section for Mobile */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Active Store</span>
                  {activeVendor.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={activeVendor.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80'}
                    alt={activeVendor.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/40"
                  />
                  <div>
                    <div className="font-extrabold text-xs text-white">{activeVendor.name}</div>
                    <div className="text-[10px] text-slate-400">{activeVendor.location}</div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <label className="text-[10px] font-semibold text-slate-400">Switch Active Store:</label>
                  <select
                    value={activeVendor.id}
                    onChange={(e) => {
                      onSelectVendor(e.target.value);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-semibold focus:outline-none"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.location})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    onOpenRegisterVendor();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-amber-500/30 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register New Vendor</span>
                </button>
              </div>

            </div>

            {/* Mobile Drawer Footer User Account */}
            <div className="pt-4 border-t border-slate-800">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-slate-950 rounded-xl">
                    <img
                      src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/50"
                    />
                    <div className="truncate">
                      <div className="font-bold text-xs text-white truncate">{currentUser.name}</div>
                      <div className="text-[10px] text-amber-400 uppercase font-bold">{currentUser.role} account</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onOpenAuth();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 bg-slate-800 text-xs text-slate-300 rounded-xl flex items-center justify-center gap-2 font-medium"
                  >
                    <UserIcon className="w-4 h-4 text-amber-400" />
                    <span>Switch Account</span>
                  </button>

                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-rose-500/30"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-amber-500 text-slate-950 text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Mobile Bottom Dock Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 md:hidden px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[48px] ${
            activeTab === 'marketplace'
              ? 'text-amber-400 font-extrabold bg-amber-500/10 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Shop</span>
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[48px] ${
            activeTab === 'tracking'
              ? 'text-amber-400 font-extrabold bg-amber-500/10 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Track</span>
        </button>

        {(currentUser?.role === 'vendor' || currentUser?.role === 'admin') && (
          <button
            onClick={() => setActiveTab('vendor')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[48px] ${
              activeTab === 'vendor'
                ? 'text-amber-400 font-extrabold bg-amber-500/10 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Store className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Merchant</span>
          </button>
        )}

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[56px] min-h-[48px] ${
              activeTab === 'admin'
                ? 'text-amber-400 font-extrabold bg-amber-500/10 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Admin</span>
          </button>
        )}

        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-amber-400 transition-all min-w-[56px] min-h-[48px]"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Cart</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-amber-400 hover:text-amber-300 transition-all min-w-[56px] min-h-[48px]"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight font-bold">Menu</span>
        </button>
      </nav>
    </>
  );
};

