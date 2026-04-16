import { useState } from 'react';
import { Order, BusinessProfile } from '../store/types';
import { ReceiptCard } from '../components/ReceiptCard';

interface OrderDetailsProps {
  order: Order;
  profile: BusinessProfile;
  updateOrder: (id: string, patch: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  onViewChange: (view: string) => void;
  showToast: (msg: string) => void;
}

function formatCurrency(amount: number) {
  return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function OrderDetails({ order, profile, updateOrder, deleteOrder, onViewChange, showToast }: OrderDetailsProps) {
  const [showReceipt, setShowReceipt] = useState(false);

  const handleDelete = () => {
    if (window.confirm(`Delete order for ${order.customerName}?`)) {
      deleteOrder(order.id);
      showToast('Order deleted');
    }
  };

  return (
    <div className="bg-background min-h-screen pb-32">
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-4 py-3 w-full">
          <div className="flex flex-col">
            <div className="flex items-center text-xs font-semibold tracking-wide text-slate-500 mb-0.5">
              <button onClick={() => onViewChange('orders')} className="hover:text-primary transition-colors flex items-center gap-1 active:scale-95">
                <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                Orders
              </button>
              <span className="material-symbols-outlined mx-0.5 text-[14px] text-slate-300">chevron_right</span>
              <span className="text-slate-800 truncate max-w-[150px]">{order.customerName}</span>
            </div>
            <p className="text-[10px] text-slate-400">#{order.id}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            {order.phone && (
              <button
                onClick={() => {
                  const text = `Hi ${order.customerName},\n\nOrder Update ✅\nProduct: ${order.product}\nAmount: ${profile.currencySymbol}${order.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}\nPayment: ${order.paymentStatus}\nDelivery: ${order.deliveryStatus}\nRef: ${order.id}\n\n${order.paymentStatus === 'Unpaid' && profile.paymentDetails ? `Please make payment to:\n${profile.paymentDetails}` : ''}`;
                  const url = `https://wa.me/${order.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
                  if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    window.location.href = url;
                  } else {
                    window.open(url, '_blank');
                  }
                }}
                className="w-9 h-9 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors active:scale-95 flex items-center justify-center"
                title="Send WhatsApp Message"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            )}
            <button
              onClick={handleDelete}
              className="w-9 h-9 rounded-full bg-error/10 text-error hover:bg-error/20 transition-colors active:scale-95 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
        <div className="bg-slate-100 h-[1px] w-full"></div>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto space-y-4">
        {/* Customer & Amount */}
        <section className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center font-bold text-secondary text-lg">
                {order.customerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-on-surface">{order.customerName}</p>
                <p className="text-xs text-on-surface-variant">{formatDate(order.createdAt)}</p>
              </div>
            </div>
            <p className="font-extrabold text-primary text-xl">{profile.currencySymbol}{order.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-outline text-base mt-0.5">inventory_2</span>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product</p>
                <p className="text-sm font-medium text-on-surface">{order.product}</p>
              </div>
            </div>
            {order.notes && (
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-outline text-base mt-0.5">notes</span>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notes</p>
                  <p className="text-sm text-on-surface-variant">{order.notes}</p>
                </div>
              </div>
            )}
            {order.imageUrl && (
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-outline text-base mt-0.5">image</span>
                <div className="w-full">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attached File</p>
                  <img src={order.imageUrl} alt="Attached file" className="mt-2 w-full max-w-[200px] rounded-xl border border-outline-variant/20 shadow-sm object-cover" />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Status Toggles */}
        <section className="grid grid-cols-2 gap-3">
          {/* Payment */}
          <div className="bg-surface-container-lowest p-1 rounded-xl shadow-sm border border-outline-variant/10 flex">
            <button
              onClick={() => { updateOrder(order.id, { paymentStatus: 'Unpaid' }); showToast('Marked as unpaid'); }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${order.paymentStatus === 'Unpaid' ? 'bg-error-container text-on-error-container' : 'text-slate-400 hover:bg-slate-50'}`}
            >Unpaid</button>
            <button
              onClick={() => { updateOrder(order.id, { paymentStatus: 'Paid' }); showToast('Marked as paid ✓'); }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${order.paymentStatus === 'Paid' ? 'bg-secondary-container text-secondary' : 'text-slate-400 hover:bg-slate-50'}`}
            >Paid</button>
          </div>
          {/* Delivery */}
          <div className="bg-surface-container-lowest p-1 rounded-xl shadow-sm border border-outline-variant/10 flex">
            <button
              onClick={() => { updateOrder(order.id, { deliveryStatus: 'Pending' }); showToast('Marked as pending'); }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${order.deliveryStatus === 'Pending' ? 'bg-surface-container-highest text-slate-600' : 'text-slate-400 hover:bg-slate-50'}`}
            >Pending</button>
            <button
              onClick={() => { updateOrder(order.id, { deliveryStatus: 'Delivered' }); showToast('Marked as delivered ✓'); }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${order.deliveryStatus === 'Delivered' ? 'bg-primary-container text-on-primary-container' : 'text-slate-400 hover:bg-slate-50'}`}
            >Delivered</button>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">Activity</h3>
          <div className="relative pl-4 space-y-5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/20">
            <div className="relative">
              <div className="absolute -left-[21px] top-1 w-3 h-3 bg-primary rounded-full ring-4 ring-white"></div>
              <p className="text-sm font-bold text-on-surface">Order Placed</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{formatDate(order.createdAt)}</p>
            </div>
            <div className={`relative ${order.paymentStatus === 'Unpaid' ? 'opacity-40' : ''}`}>
              <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${order.paymentStatus === 'Paid' ? 'bg-secondary' : 'bg-outline-variant'}`}></div>
              <p className="text-sm font-bold text-on-surface">Payment Confirmed</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{order.paymentStatus === 'Paid' ? 'Paid ✓' : 'Awaiting payment'}</p>
            </div>
            <div className={`relative ${order.deliveryStatus === 'Pending' ? 'opacity-40' : ''}`}>
              <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${order.deliveryStatus === 'Delivered' ? 'bg-primary' : 'bg-outline-variant'}`}></div>
              <p className="text-sm font-bold text-on-surface">Delivered</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{order.deliveryStatus === 'Delivered' ? 'Completed ✓' : 'Pending delivery'}</p>
            </div>
          </div>
        </section>

        {/* Share Receipt Section */}
        <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <button
            onClick={() => setShowReceipt(!showReceipt)}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#25D366]">receipt_long</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-on-surface text-sm">Share Receipt</p>
                <p className="text-xs text-on-surface-variant">Generate a visual receipt image</p>
              </div>
            </div>
            <span className={`material-symbols-outlined text-slate-400 transition-transform ${showReceipt ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
          </button>
          {showReceipt && (
            <div className="px-5 pb-5 animate-slide-up">
              <ReceiptCard order={order} profile={profile} showToast={showToast} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
