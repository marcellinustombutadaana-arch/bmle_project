import React, { useState } from 'react';
import { Store, Plus, Package, Truck, DollarSign, Sparkles, Printer, CheckCircle2, ShieldCheck, MapPin, Edit3, Trash2, Tag, Wand2, RefreshCw, XCircle } from 'lucide-react';
import { Vendor, Product, Order, Category } from '../types';
import { ShippingLabelModal } from './ShippingLabelModal';
import { ImageUploader } from './ImageUploader';

interface VendorHubProps {
  activeVendor: Vendor;
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrder: (order: Order) => void;
  onCancelOrder?: (orderId: string, reason?: string) => void;
  onDeleteOrder?: (orderId: string) => void;
  onOpenRegisterVendor: () => void;
}

const CATEGORIES: Category[] = [
  'Tech & Electronics',
  'Artisanal & Crafts',
  'Fashion & Apparel',
  'Home & Living',
  'Gourmet & Organic',
  'Beauty & Wellness',
  'Sports & Outdoors'
];

export const VendorHub: React.FC<VendorHubProps> = ({
  activeVendor,
  products,
  orders,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrder,
  onCancelOrder,
  onDeleteOrder,
  onOpenRegisterVendor
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'ai-insights'>('products');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedLabelOrder, setSelectedLabelOrder] = useState<Order | null>(null);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<Category>('Tech & Electronics');
  const [newProdPrice, setNewProdPrice] = useState('99.00');
  const [newProdStock, setNewProdStock] = useState('25');
  const [newProdWeight, setNewProdWeight] = useState('0.5');
  const [newProdLength, setNewProdLength] = useState('20');
  const [newProdWidth, setNewProdWidth] = useState('15');
  const [newProdHeight, setNewProdHeight] = useState('10');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdTags, setNewProdTags] = useState('premium, fast-shipping, quality');
  const [newProdImageUrl, setNewProdImageUrl] = useState('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80');

  // AI Generator state
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiLogisticsSummary, setAiLogisticsSummary] = useState<{ summary: string; recommendation: string } | null>(null);
  const [loadingLogisticsAI, setLoadingLogisticsAI] = useState(false);

  // Filter products for active vendor
  const vendorProducts = products.filter(p => p.vendorId === activeVendor.id);

  // Filter orders containing items from this vendor
  const vendorOrders = orders.filter(o => o.items.some(i => i.vendorId === activeVendor.id));

  // Compute vendor revenue
  const totalRevenue = vendorOrders.reduce((sum, order) => {
    const vendorItemsSubtotal = order.items
      .filter(i => i.vendorId === activeVendor.id)
      .reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
    return sum + vendorItemsSubtotal;
  }, 0);

  // Handle AI Description Generator call
  const handleGenerateAIDescription = async () => {
    if (!newProdName) return;
    setGeneratingAI(true);
    try {
      const res = await fetch('/api/ai/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: newProdName,
          category: newProdCategory,
          keyFeatures: newProdDescription || 'High quality construction, durable materials, excellent performance'
        })
      });
      const data = await res.json();
      if (data.description) setNewProdDescription(data.description);
      if (data.tags && Array.isArray(data.tags)) setNewProdTags(data.tags.join(', '));
      if (data.suggestedPrice) setNewProdPrice(data.suggestedPrice.toFixed(2));
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = newProdTags.split(',').map(t => t.trim()).filter(Boolean);

    const product: Product = {
      id: `prod-${Date.now()}`,
      vendorId: activeVendor.id,
      vendorName: activeVendor.name,
      name: newProdName,
      category: newProdCategory,
      price: parseFloat(newProdPrice) || 10,
      stock: parseInt(newProdStock) || 1,
      weightKg: parseFloat(newProdWeight) || 0.5,
      dimensionsCm: {
        length: parseFloat(newProdLength) || 10,
        width: parseFloat(newProdWidth) || 10,
        height: parseFloat(newProdHeight) || 10
      },
      description: newProdDescription,
      tags: tagsArray,
      imageUrl: newProdImageUrl,
      createdAt: new Date().toISOString()
    };

    onAddProduct(product);
    setIsAddProductOpen(false);
    // Reset inputs
    setNewProdName('');
    setNewProdDescription('');
  };

  // Dispatch Order Action
  const handleDispatchOrder = (order: Order) => {
    const updated: Order = {
      ...order,
      orderStatus: 'In Transit',
      trackingEvents: [
        ...order.trackingEvents,
        {
          id: `tr-${Date.now()}`,
          status: 'In Transit',
          title: 'Dispatched from Vendor Warehouse',
          location: activeVendor.location,
          timestamp: 'Just Now',
          description: `Package handed over to carrier (${order.carrierName}). Tracking #${order.trackingNumber}`
        }
      ]
    };
    onUpdateOrder(updated);
  };

  // Advance Order Delivery Progress Action
  const handleAdvanceDelivery = (order: Order) => {
    const nextStatuses: Record<string, 'In Transit' | 'Out for Delivery' | 'Delivered'> = {
      'Order Confirmed': 'In Transit',
      'Processing & Packing': 'In Transit',
      'Label Generated': 'In Transit',
      'In Transit': 'Out for Delivery',
      'Out for Delivery': 'Delivered'
    };

    const nextStatus = nextStatuses[order.orderStatus] || 'Delivered';

    const updated: Order = {
      ...order,
      orderStatus: nextStatus,
      trackingEvents: [
        ...order.trackingEvents,
        {
          id: `tr-${Date.now()}`,
          status: nextStatus,
          title: `Delivery Update: ${nextStatus}`,
          location: order.shippingAddress.city + ', ' + order.shippingAddress.state,
          timestamp: 'Just Now',
          description: nextStatus === 'Delivered' 
            ? 'Package handed to recipient at doorstep with signature verification.' 
            : `Carrier courier dispatched for final leg delivery.`
        }
      ]
    };
    onUpdateOrder(updated);
  };

  const handleFetchLogisticsAI = async () => {
    setLoadingLogisticsAI(true);
    try {
      const res = await fetch('/api/ai/logistics-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: vendorOrders })
      });
      const data = await res.json();
      setAiLogisticsSummary(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogisticsAI(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      
      {/* Vendor Profile Header Banner */}
      <div className="relative border-b border-slate-800 bg-slate-900">
        <div className="h-40 sm:h-52 w-full overflow-hidden relative">
          <img
            src={activeVendor.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'}
            alt={activeVendor.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 sm:-mt-20 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            
            <div className="flex items-end gap-4">
              <img
                src={activeVendor.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80'}
                alt={activeVendor.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-slate-900 shadow-2xl bg-slate-950"
              />
              <div className="mb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{activeVendor.name}</h1>
                  {activeVendor.isVerified && <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">{activeVendor.tagline}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {activeVendor.location}
                  </span>
                  <span>•</span>
                  <span>Payouts: {activeVendor.bankAccount}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:brightness-110"
              >
                <Plus className="w-4 h-4" />
                <span>List New Product</span>
              </button>

              <button
                onClick={onOpenRegisterVendor}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
              >
                + Register Brand
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Merchant Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white mt-2">
              GH₵ {totalRevenue.toFixed(2)}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Active Listings</span>
              <Package className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white mt-2">
              {vendorProducts.length} Products
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Fulfillment Orders</span>
              <Truck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white mt-2">
              {vendorOrders.length} Orders
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Customer Rating</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-400 mt-2">
              ★ {activeVendor.rating} ({activeVendor.reviewsCount})
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Catalog ({vendorProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Orders & Carrier Dispatch ({vendorOrders.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ai-insights');
              handleFetchLogisticsAI();
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'ai-insights'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Logistics Optimizer</span>
          </button>
        </div>

        {/* TAB 1: PRODUCTS TABLE / GRID */}
        {activeTab === 'products' && (
          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendorProducts.map(prod => (
                <div key={prod.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4">
                  <img src={prod.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'} alt={prod.name} className="w-20 h-20 rounded-xl object-cover border border-slate-800" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-semibold text-amber-400 uppercase">{prod.category}</div>
                      <h3 className="text-sm font-bold text-white truncate">{prod.name}</h3>
                      <div className="text-xs text-slate-400 mt-0.5">GH₵ {prod.price.toFixed(2)} • Stock: {prod.stock}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onDeleteProduct(prod.id)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS & FULFILLMENT */}
        {activeTab === 'orders' && (
          <div className="mt-6 space-y-4">
            {vendorOrders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
                No orders for this vendor yet.
              </div>
            ) : (
              vendorOrders.map(order => (
                <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">Order {order.id}</span>
                        <span className="text-xs bg-slate-800 text-amber-400 px-2 py-0.5 rounded-md font-mono">
                          {order.trackingNumber}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Recipient: <span className="text-slate-200 font-medium">{order.shippingAddress.fullName} ({order.shippingAddress.city}, {order.shippingAddress.state})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                        {order.orderStatus}
                      </span>
                      <button
                        onClick={() => setSelectedLabelOrder(order)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Shipping Label</span>
                      </button>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <img src={item.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1">
                          <div className="font-bold text-white">{item.productName}</div>
                          <div className="text-slate-400">Qty: {item.quantity} x GH₵ {item.unitPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dispatch Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3">
                    <div className="text-xs text-slate-400">
                      Carrier: <span className="text-amber-400 font-bold">{order.carrierName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {order.orderStatus !== 'In Transit' && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                        <button
                          onClick={() => handleDispatchOrder(order)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Handover to Courier</span>
                        </button>
                      )}

                      {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                        <button
                          onClick={() => handleAdvanceDelivery(order)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Simulate Carrier Event</span>
                        </button>
                      )}

                      {order.orderStatus !== 'Cancelled' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to cancel Order ${order.id}?`)) {
                              if (onCancelOrder) onCancelOrder(order.id, 'Cancelled by Merchant');
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Order</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (window.confirm(`Permanently delete Order ${order.id} from system records?`)) {
                            if (onDeleteOrder) onDeleteOrder(order.id);
                          }
                        }}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 text-xs font-bold transition-all"
                        title="Delete Order Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: AI INSIGHTS */}
        {activeTab === 'ai-insights' && (
          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Gemini AI Carrier & Dispatch Optimizer</h2>
            </div>

            {loadingLogisticsAI ? (
              <div className="py-8 text-center text-xs text-amber-400 animate-pulse">
                Analyzing order weight distributions, package volumetric sizing, and carrier transit times...
              </div>
            ) : aiLogisticsSummary ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-amber-400">Fulfillment Efficiency Analysis</div>
                  <p className="text-slate-300 leading-relaxed">{aiLogisticsSummary.summary}</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                  <div className="font-bold text-amber-300">Carrier & Packaging Tip</div>
                  <p className="text-slate-200 leading-relaxed">{aiLogisticsSummary.recommendation}</p>
                </div>
              </div>
            ) : null}
          </div>
        )}

      </div>

      {/* CREATE PRODUCT MODAL */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">List Product for Sale</h3>
              <button onClick={() => setIsAddProductOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Product Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. AeroNoise Active Wireless Headphones"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateAIDescription}
                    disabled={generatingAI || !newProdName}
                    className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold flex items-center gap-1 border border-amber-500/40"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{generatingAI ? 'AI Generating...' : 'AI Auto-Fill'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Price (GH₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newProdWeight}
                    onChange={(e) => setNewProdWeight(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Description</label>
                <textarea
                  rows={3}
                  required
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <ImageUploader
                label="Product Picture (Upload File or Select Preset)"
                value={newProdImageUrl}
                onChange={setNewProdImageUrl}
                aspectRatio="square"
                placeholder="Click to upload product image file"
                presetImages={[
                  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
                  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
                  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
                  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
                ]}
              />

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20"
              >
                Publish Listing to Marketplace
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PRINT LABEL MODAL */}
      <ShippingLabelModal
        order={selectedLabelOrder}
        vendor={activeVendor}
        onClose={() => setSelectedLabelOrder(null)}
      />

    </div>
  );
};
