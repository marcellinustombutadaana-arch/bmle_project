import React, { useState } from 'react';
import { Search, Truck, MapPin, CheckCircle2, Clock, PackageCheck, AlertCircle, ShieldCheck, ArrowRight, Navigation } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderTrackingProps {
  orders: Order[];
}

const STATUS_STEPS: OrderStatus[] = [
  'Order Confirmed',
  'Label Generated',
  'Carrier Picked Up',
  'In Transit',
  'Out for Delivery',
  'Delivered'
];

export const OrderTracking: React.FC<OrderTrackingProps> = ({ orders }) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const currentOrder = orders.find(o => 
    o.id.toLowerCase() === selectedOrderId.toLowerCase() || 
    o.trackingNumber.toLowerCase() === selectedOrderId.toLowerCase()
  ) || orders[0];

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.shippingAddress.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStepIndex = (status: OrderStatus) => {
    const idx = STATUS_STEPS.indexOf(status);
    return idx === -1 ? 1 : idx;
  };

  const currentStepIdx = currentOrder ? getStepIndex(currentOrder.orderStatus) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold mb-2">
              <Truck className="w-3.5 h-3.5" />
              <span>Real-Time Carrier Logistics Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Seamless Order Delivery & Courier Map
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Track multi-vendor dispatches with integrated GPS courier status and step-by-step waypoint scans.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Tracking # or Order ID..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
            No active orders to track yet. Place an order from the marketplace catalog to test live shipping logistics!
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Orders List */}
            <div className="lg:col-span-4 space-y-3 max-h-[700px] overflow-y-auto pr-1">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Your Deliveries ({filteredOrders.length})
              </h2>

              {filteredOrders.map(ord => (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    currentOrder?.id === ord.id
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/5'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-white">{ord.id}</span>
                    <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded-md font-mono">
                      {ord.carrierName}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mt-2 line-clamp-1">
                    {ord.items.map(i => i.productName).join(', ')}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-semibold">{ord.orderStatus}</span>
                    <span className="text-slate-500 font-bold">GH₵ {ord.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Selected Order Map & Step Timeline */}
            {currentOrder && (
              <div className="lg:col-span-8 space-y-6">
                
                {/* Main Status Banner */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <div className="text-xs font-semibold text-amber-400">WAYBILL #{currentOrder.trackingNumber}</div>
                      <h2 className="text-xl font-extrabold text-white mt-0.5">
                        Status: {currentOrder.orderStatus}
                      </h2>
                      <div className="text-xs text-slate-400 mt-1">
                        Estimated Delivery: <span className="text-amber-300 font-bold">{currentOrder.estimatedDeliveryDate}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-right">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Consignee Address</div>
                      <div className="text-xs font-bold text-slate-200">{currentOrder.shippingAddress.fullName}</div>
                      <div className="text-[11px] text-slate-400">
                        {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state} {currentOrder.shippingAddress.postalCode}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Timeline */}
                  <div className="mt-8">
                    <div className="relative flex items-center justify-between">
                      {/* Connecting line */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-amber-500 to-emerald-400 -translate-y-1/2 z-0 transition-all duration-500" 
                        style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                      />

                      {STATUS_STEPS.map((stepName, i) => {
                        const isCompleted = i <= currentStepIdx;
                        const isCurrent = i === currentStepIdx;

                        return (
                          <div key={stepName} className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                              isCurrent
                                ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 scale-110 shadow-lg'
                                : isCompleted
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}>
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={`text-[10px] font-semibold mt-2 hidden sm:block max-w-[80px] text-center ${
                              isCompleted ? 'text-slate-200' : 'text-slate-600'
                            }`}>
                              {stepName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Animated Courier Graphic Map */}
                  <div className="mt-8 p-6 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-amber-400" />
                      Live Courier GPS Routing Graphic
                    </div>

                    <div className="relative h-32 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between px-8 overflow-hidden">
                      {/* Grid overlay */}
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:12px_12px]" />

                      {/* Origin Warehouse */}
                      <div className="relative z-10 text-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-md">
                          <PackageCheck className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 block mt-1">Vendor Dispatch Hub</span>
                      </div>

                      {/* Moving Truck icon along route */}
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-700"
                        style={{ left: `${Math.min(85, Math.max(15, (currentStepIdx / (STATUS_STEPS.length - 1)) * 80))}%` }}
                      >
                        <div className="p-2.5 rounded-full bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 animate-bounce">
                          <Truck className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Destination Home */}
                      <div className="relative z-10 text-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-md">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 block mt-1">
                          {currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Waypoint Event Logs */}
                  <div className="mt-6 space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Carrier Waypoint Activity Log
                    </h3>

                    <div className="space-y-2">
                      {currentOrder.trackingEvents.slice().reverse().map((ev, idx) => (
                        <div key={ev.id || idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-3 text-xs">
                          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{ev.title}</span>
                              <span className="text-[10px] text-slate-500">{ev.timestamp}</span>
                            </div>
                            <p className="text-slate-400 text-[11px] mt-0.5">{ev.description}</p>
                            <span className="text-[10px] text-amber-400/80 font-mono mt-1 block">
                              📍 Location: {ev.location}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
