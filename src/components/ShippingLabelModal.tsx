import React from 'react';
import { X, Printer, QrCode, Download, ShieldCheck, Truck, Barcode } from 'lucide-react';
import { Order, Vendor } from '../types';

interface ShippingLabelModalProps {
  order: Order | null;
  vendor: Vendor | null;
  onClose: () => void;
}

export const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({
  order,
  vendor,
  onClose
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative">
        
        {/* Header bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-extrabold text-white">Carrier Master Waybill Label</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Thermal Label Body */}
        <div className="p-6 bg-white text-black font-mono">
          <div className="border-4 border-black p-4 space-y-4">
            
            {/* Carrier Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div>
                <h1 className="text-xl font-black tracking-tighter uppercase">{order.carrierName}</h1>
                <p className="text-[10px] font-bold">PRIORITY AIRWAY BILL • EXPRESS PARCEL</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black">ZONE 4</span>
              </div>
            </div>

            {/* From / To Addresses */}
            <div className="grid grid-cols-2 gap-3 text-[11px] border-b-2 border-black pb-3">
              <div>
                <span className="font-extrabold block text-[9px] uppercase text-gray-700">SHIP FROM (VENDOR):</span>
                <p className="font-bold">{vendor?.name || order.items[0]?.vendorName || 'Merchant'}</p>
                <p>{vendor?.location || 'Austin, TX'}</p>
                <p>REF #: {order.id}</p>
              </div>
              <div>
                <span className="font-extrabold block text-[9px] uppercase text-gray-700">SHIP TO (RECIPIENT):</span>
                <p className="font-bold">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Tracking Barcode Visual */}
            <div className="text-center py-2 border-b-2 border-black">
              <div className="text-[10px] font-bold tracking-widest text-gray-600 mb-1">
                TRACKING NUMBER
              </div>
              <div className="font-extrabold text-base tracking-wider bg-black text-white py-1 px-3 inline-block rounded mb-2">
                {order.trackingNumber}
              </div>

              {/* Simulated Barcode lines */}
              <div className="flex justify-center items-center gap-0.5 h-12 px-2 bg-gray-100 py-1 border border-black overflow-hidden">
                {[3, 1, 4, 1, 5, 2, 1, 4, 2, 3, 1, 5, 1, 2, 4, 1, 3, 2, 5, 1, 4, 2, 3, 1, 2, 4, 1, 5, 2, 3, 1, 4].map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-black h-full"
                    style={{ width: `${w * 2}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Parcel Specs & QR Code */}
            <div className="flex items-center justify-between text-[10px]">
              <div>
                <p><span className="font-bold">WEIGHT:</span> 0.85 KG</p>
                <p><span className="font-bold">DISPATCH:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p><span className="font-bold">PAYMENT:</span> PREPAID ({order.paymentMethod.toUpperCase()})</p>
              </div>

              <div className="w-12 h-12 border border-black flex items-center justify-center p-1 bg-slate-50">
                <QrCode className="w-full h-full text-black" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
