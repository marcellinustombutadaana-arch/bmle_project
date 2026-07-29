import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldCheck, Truck, Package, Sparkles, ArrowUpDown, Plus } from 'lucide-react';
import { Product, Vendor, Category } from '../types';

interface MarketplaceProps {
  products: Product[];
  vendors: Vendor[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onOpenRegisterVendor: () => void;
}

const CATEGORIES: (Category | 'All')[] = [
  'All',
  'Tech & Electronics',
  'Artisanal & Crafts',
  'Fashion & Apparel',
  'Home & Living',
  'Gourmet & Organic',
  'Beauty & Wellness',
  'Sports & Outdoors'
];

export const Marketplace: React.FC<MarketplaceProps> = ({
  products,
  vendors,
  onSelectProduct,
  onAddToCart,
  onOpenRegisterVendor
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'stock'>('featured');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesVendor = selectedVendorId === 'All' || p.vendorId === selectedVendorId;
      const matchesQuery = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesVendor && matchesQuery;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'stock') return b.stock - a.stock;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, selectedCategory, selectedVendorId, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Believers Linkage Ghana Marketplace & Regional Logistics</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Shop Direct from Verified Ghana Merchants
              </h1>
              <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
                Connect directly with Ghanaian faith-based artisans & merchants. Calculate live delivery rates via <strong className="text-amber-300">Ghana Post EMS, VIP Jeoun, STC Express, and Same-Day Motorbike Couriers</strong> with instant Mobile Money checkout (MTN MoMo, Telecel Cash, AT Money).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 p-4 rounded-2xl flex items-center gap-3 shadow-lg">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400">Ghana Parcel Logistics</div>
                  <div className="text-sm font-bold text-white">5 Carrier Networks</div>
                </div>
              </div>

              <button
                onClick={onOpenRegisterVendor}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold px-5 py-3 rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-5 h-5" />
                <span>Sell as Vendor</span>
              </button>
            </div>
          </div>

          {/* Search & Main Filter Controls */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-xl">
            {/* Search bar */}
            <div className="relative md:col-span-6">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, tags, keywords..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Vendor Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Merchants ({vendors.length})</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="md:col-span-3 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:inline shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="featured">Featured / Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="stock">In-Stock First</option>
              </select>
            </div>
          </div>

          {/* Category Pills Bar */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Main Catalog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <span>Catalog Items</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
              {filteredProducts.length} Results
            </span>
          </h2>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto my-12">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200">No products found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try resetting your search query or choosing a different category.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedVendorId('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-amber-400 text-xs font-semibold hover:bg-slate-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const vendor = vendors.find(v => v.id === product.vendorId);

              return (
                <div
                  key={product.id}
                  className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative aspect-square overflow-hidden bg-slate-950">
                      <img
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Category Badge */}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur border border-slate-800 text-[10px] font-semibold text-slate-300">
                        {product.category}
                      </span>

                      {/* Stock Badge */}
                      <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur border ${
                        product.stock > 10 
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80' 
                          : product.stock > 0 
                          ? 'bg-amber-950/80 text-amber-400 border-amber-800/80'
                          : 'bg-rose-950/80 text-rose-400 border-rose-800/80'
                      }`}>
                        {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Vendor Info */}
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mb-1.5">
                        <span className="truncate">{product.vendorName}</span>
                        {vendor?.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </div>

                      <h3 
                        onClick={() => onSelectProduct(product)}
                        className="text-sm font-bold text-slate-100 hover:text-amber-300 cursor-pointer line-clamp-1 transition-colors"
                      >
                        {product.name}
                      </h3>

                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Parcel Specs */}
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-slate-500" />
                          {product.weightKg} kg
                        </span>
                        <span className="text-slate-500">
                          {product.dimensionsCm.length}x{product.dimensionsCm.width}x{product.dimensionsCm.height} cm
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Price & Actions */}
                  <div className="p-4 pt-0">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Unit Price</div>
                        <div className="text-lg font-extrabold text-white">
                          GH₵ {product.price.toFixed(2)}
                        </div>
                      </div>

                      {vendor?.freeShippingThreshold && product.price >= vendor.freeShippingThreshold && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                          Free Ship Eligible
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        View Details
                      </button>

                      <button
                        disabled={product.stock <= 0}
                        onClick={() => onAddToCart(product)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                          product.stock > 0
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
                            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
