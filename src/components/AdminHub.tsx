import React, { useState, useEffect } from 'react';
import { ShieldCheck, Store, Package, Users, Plus, Trash2, CheckCircle, AlertTriangle, Search, DollarSign, Truck, Phone, Mail, MapPin, Building2, ExternalLink, XCircle } from 'lucide-react';
import { Vendor, Product, Order, User } from '../types';
import { storage } from '../services/storage';

interface AdminHubProps {
  currentUser: User | null;
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  products: Product[];
  orders: Order[];
  onCancelOrder?: (orderId: string, reason?: string) => void;
  onDeleteOrder?: (orderId: string) => void;
  onOpenRegisterVendor: () => void;
}

export const AdminHub: React.FC<AdminHubProps> = ({
  currentUser,
  vendors,
  setVendors,
  products,
  orders,
  onCancelOrder,
  onDeleteOrder,
  onOpenRegisterVendor
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'vendors' | 'orders' | 'users'>('vendors');
  const [usersList, setUsersList] = useState<User[]>([]);

  // RLS returns every profile only when the caller is actually an admin;
  // anyone else calling this would just get their own single row back.
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      storage.getUsers().then(setUsersList).catch(console.error);
    }
  }, [currentUser]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const activeVendorsCount = vendors.length;
  const totalProductsCount = products.length;
  const pendingOrdersCount = orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;

  const handleToggleVerify = async (vendorId: string) => {
    const updated = await storage.toggleVendorVerification(vendorId);
    setVendors(updated);
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (confirm('Are you sure you want to remove this vendor and their listed products from BMLE?')) {
      const updated = await storage.deleteVendor(vendorId);
      setVendors(updated);
    }
  };

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-orange-500/0 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>BMLE Enterprise Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              System Admin Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage verified believers marketplace merchants, dispatch orders, and system users across Ghana.
            </p>
          </div>

          <button
            onClick={onOpenRegisterVendor}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Onboard New Vendor</span>
          </button>
        </div>

        {/* System Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Total Marketplace GMV</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
              GH₵ {totalRevenue.toFixed(2)}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-medium">Ghana Cedis Transacted</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Onboarded Merchants</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {activeVendorsCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Verified Believer Vendors</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Active Products Listed</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {totalProductsCount}
            </div>
            <div className="text-[10px] text-amber-400 mt-0.5 font-medium">Catalog Items</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Active Orders</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
              {pendingOrdersCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Carrier In-Transit</div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('vendors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'vendors'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Vendor Merchants ({vendors.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'orders'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Marketplace Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'users'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>System Users ({usersList.length})</span>
        </button>
      </div>

      {/* VENDORS MANAGEMENT VIEW */}
      {activeSubTab === 'vendors' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vendor name, email, or city in Ghana..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Showing {filteredVendors.length} of {vendors.length} Vendors
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((vendor) => {
              const vendorProds = products.filter(p => p.vendorId === vendor.id);
              const vendorOrds = orders.filter(o => o.items.some(i => i.vendorId === vendor.id));

              return (
                <div
                  key={vendor.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Banner Image */}
                    <div className="h-24 relative overflow-hidden bg-slate-950">
                      <img
                        src={vendor.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'}
                        alt=""
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => handleToggleVerify(vendor.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-md backdrop-blur-md ${
                            vendor.isVerified
                              ? 'bg-emerald-500/90 text-slate-950'
                              : 'bg-amber-500/90 text-slate-950'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{vendor.isVerified ? 'Verified' : 'Pending Verification'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Logo & Content */}
                    <div className="p-4 pt-0 relative">
                      <div className="-mt-8 mb-3 flex items-end justify-between">
                        <img
                          src={vendor.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80'}
                          alt={vendor.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-900 shadow-xl bg-slate-950"
                        />
                        <div className="text-right">
                          <div className="text-xs font-black text-amber-400">
                            GH₵ {vendorOrds.reduce((s, o) => s + o.total, 0).toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-500">Total Sales</div>
                        </div>
                      </div>

                      <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                        <span>{vendor.name}</span>
                        {vendor.isVerified && <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{vendor.tagline}</p>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{vendor.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{vendor.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{vendor.email}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                        <span>{vendorProds.length} Products</span>
                        <span>{vendorOrds.length} Orders</span>
                        <span>Joined {vendor.joinedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0 flex items-center gap-2">
                    <button
                      onClick={() => handleToggleVerify(vendor.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        vendor.isVerified
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      }`}
                    >
                      {vendor.isVerified ? 'Unverify' : 'Approve & Verify'}
                    </button>
                    <button
                      onClick={() => handleDeleteVendor(vendor.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                      title="Delete Vendor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ORDERS MANAGEMENT VIEW */}
      {activeSubTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 text-xs font-bold text-white uppercase tracking-wider">
            All Platform Orders Across Ghana
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Order ID / Tracking</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Carrier</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40">
                    <td className="p-3">
                      <div className="font-bold text-amber-400">{ord.id}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{ord.trackingNumber}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{ord.customerName}</div>
                      <div className="text-[10px] text-slate-400">{ord.shippingAddress.city}, {ord.shippingAddress.country}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-slate-200">{ord.carrierName}</span>
                    </td>
                    <td className="p-3">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                        {ord.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">
                      GH₵ {ord.total.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-extrabold border ${
                        ord.orderStatus === 'Cancelled'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ord.orderStatus !== 'Cancelled' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Admin Action: Cancel Order ${ord.id}?`)) {
                                if (onCancelOrder) onCancelOrder(ord.id, 'Cancelled by System Administrator');
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-all flex items-center gap-1"
                            title="Cancel Order"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(`Admin Action: Permanently delete Order ${ord.id}?`)) {
                              if (onDeleteOrder) onDeleteOrder(ord.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 text-[11px] font-bold transition-all"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS LIST VIEW */}
      {activeSubTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">
            Registered Users ({usersList.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {usersList.map((usr) => (
              <div key={usr.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <img src={usr.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-xs truncate">{usr.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{usr.email}</div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase mt-0.5">{usr.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
