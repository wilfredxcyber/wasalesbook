import { useState, useEffect, useMemo } from 'react';
import { Order, BusinessProfile } from '../store/types';
import { SalesChart } from '../components/SalesChart';
import { Confetti } from '../components/Confetti';

type Filter = 'All' | 'Pending' | 'Paid' | 'Delivered';

interface DashboardProps {
  orders: Order[];
  profile: BusinessProfile;
  onViewChange: (view: string, orderId?: string) => void;
  showToast: (msg: string) => void;
  updateOrder: (id: string, patch: Partial<Order>) => Promise<void>;
}

function formatCurrency(amount: number) {
  return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function Dashboard({ orders, profile, onViewChange, showToast, updateOrder }: DashboardProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const len = orders.length;
    if (len === 1 || len === 10 || len === 50 || len === 100) {
      const key = `celebrated_milestone_${len}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, 'true');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 8000);
        showToast(`🎉 Milestone Reached: ${len} order${len > 1 ? 's' : ''}!`);
      }
    }
  }, [orders.length, showToast]);

  const pColors = profile.receiptDesign?.customAccentColor 
     ? [profile.receiptDesign.customAccentColor, profile.receiptDesign.customBgColor || '#25D366', '#facc15', '#3b82f6', '#e11d48']
     : ['#25D366', '#006d2f', '#facc15', '#3b82f6', '#e11d48'];

  const filters: Filter[] = ['All', 'Pending', 'Paid', 'Delivered'];

  const toShipCount = orders.filter(o => o.deliveryStatus === 'Pending').length;
  const unpaidTotal = orders
    .filter(o => o.paymentStatus === 'Unpaid')
    .reduce((sum, o) => sum + o.amount, 0);

  const filteredOrders = useMemo(() => orders.filter(o => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Paid') return o.paymentStatus === 'Paid';
    if (activeFilter === 'Pending') return o.paymentStatus === 'Unpaid';
    if (activeFilter === 'Delivered') return o.deliveryStatus === 'Delivered';
    return true;
  }), [orders, activeFilter]);

  const exportCSV = () => {
    if (orders.length === 0) {
      showToast('No orders to export');
      return;
    }
    const header = ['Order ID', 'Date', 'Customer', 'Phone', 'Product', 'Amount', 'Payment Status', 'Delivery Status', 'Notes'];
    const rows = orders.map(o => [
      o.id,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customerName}"`,
      `"${o.phone || ''}"`,
      `"${o.product}"`,
      o.amount,
      o.paymentStatus,
      o.deliveryStatus,
      `"${o.notes}"`
    ]);
    const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${(profile.userName || 'salesbook').replace(/\s+/g, '_').toLowerCase()}_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV');
  };

  const getStatusBadge = (order: Order) => {
    if (order.deliveryStatus === 'Delivered') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary-container text-on-primary-container">Delivered</span>;
    }
    if (order.paymentStatus === 'Paid') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary-container text-secondary">Paid</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-error-container text-on-error-container">Unpaid</span>;
  };

  return (
    <div className="bg-background min-h-screen pb-24">
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-4 py-3 w-full">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-inner relative overflow-hidden group">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="App Logo" className="w-full h-full object-cover z-10" />
              ) : (
                <>
                  <img src="/logo.png" alt="App Logo" className="w-full h-full object-cover z-10 hidden group-has-[img[src='/logo.png']]:block" onError={(e) => { e.currentTarget.classList.add('hidden'); }} />
                  <span className="material-symbols-outlined text-white text-xl absolute" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
                </>
              )}
            </div>
            <h1 className="text-lg font-bold tracking-tighter text-[#006d2f]">Whatsbook</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="p-2 text-slate-500 hover:bg-slate-100/50 transition-colors rounded-full active:scale-95 flex items-center justify-center"
              title="Export CSV"
            >
              <span className="material-symbols-outlined text-xl">download</span>
            </button>
            <button
              onClick={() => onViewChange('daily_summary')}
              className="flex items-center gap-1 px-3 py-1.5 bg-secondary-container text-secondary rounded-full text-xs font-semibold active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">summarize</span>
              Summary
            </button>
          </div>
        </div>
        <div className="bg-slate-100 h-[1px] w-full"></div>
      </header>

      <main className="pt-16 px-4 max-w-2xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-[#075E54] p-4 rounded-xl shadow-sm relative overflow-hidden group transition-transform active:scale-95">
            <div className="absolute -right-2 -top-2 opacity-10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white text-6xl">local_shipping</span>
            </div>
            <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">To Deliver</p>
            <p className="text-white text-3xl font-bold tracking-tight">{toShipCount}</p>
          </div>
          <div className="bg-[#075E54] p-4 rounded-xl shadow-sm relative overflow-hidden group transition-transform active:scale-95">
            <div className="absolute -right-2 -top-2 opacity-10 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white text-6xl">payments</span>
            </div>
            <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">Unpaid</p>
            <p className="text-white text-xl font-bold tracking-tight truncate">{profile.currencySymbol}{unpaidTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {orders.length > 0 && <SalesChart orders={orders} />}


        {orders.length === 0 ? (
          <div className="mt-6 border-transparent">
            <div className="px-2 mb-4">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Welcome to Whatsbook! 🎉</h2>
              <p className="text-sm text-slate-500 mt-1">Swipe through your setup steps below:</p>
            </div>
            
            {/* Carousel / Slider */}
            <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-6 snap-x snap-mandatory hide-scrollbar -mx-4 px-4">
              
              {/* Card 1 */}
              <div className="w-[85%] shrink-0 snap-center bg-gradient-to-br from-[#006d2f] to-[#004d20] rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <span className="material-symbols-outlined text-[100px] text-white">person</span>
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-white">person</span>
                </div>
                <h3 className="text-white font-extrabold text-lg mb-1">1. Set up Profile</h3>
                <p className="text-white/80 text-sm mb-6 min-h-[40px]">Configure your business name, currency, and payment details.</p>
                <button onClick={() => onViewChange('settings')} className="bg-white text-[#006d2f] px-5 py-2.5 rounded-xl font-bold text-sm w-full active:scale-95 transition-transform shadow-md">
                  Go to Settings
                </button>
              </div>

              {/* Card 2 */}
              <div className="w-[85%] shrink-0 snap-center bg-gradient-to-br from-surface-container-high to-surface-container-highest rounded-3xl p-6 shadow-lg border border-outline-variant/20 relative overflow-hidden">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary">inventory_2</span>
                </div>
                <h3 className="text-on-surface font-extrabold text-lg mb-1">2. Build Catalogue</h3>
                <p className="text-on-surface-variant text-sm mb-6 min-h-[40px]">Add your products to quickly auto-fill future orders.</p>
                <button onClick={() => onViewChange('product_catalogue')} className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm w-full active:scale-95 transition-transform shadow-md">
                  Add Products
                </button>
              </div>

              {/* Card 3 */}
              <div className="w-[85%] shrink-0 snap-center bg-gradient-to-br from-secondary-container/50 to-secondary-container/20 rounded-3xl p-6 shadow-lg border border-secondary-container relative overflow-hidden">
                <div className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined">add</span>
                </div>
                <h3 className="text-on-surface font-extrabold text-lg mb-1">3. Create Order</h3>
                <p className="text-on-surface-variant text-sm mb-6 min-h-[40px]">Log your first sale either manually or using AI Smart Paste.</p>
                <button onClick={() => onViewChange('new_order')} className="bg-secondary text-white px-5 py-2.5 rounded-xl font-bold text-sm w-full active:scale-95 transition-transform shadow-md">
                  New Order
                </button>
              </div>

            </div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Recent Orders</h2>
              <button 
                onClick={() => onViewChange('orders')}
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider flex items-center gap-1"
              >
                View all <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(12,30,38,0.04)]">
              {orders.slice(0, 5).map((order, idx) => (
                <div
                  key={order.id}
                  onClick={() => onViewChange('order_details', order.id)}
                  className={`cursor-pointer flex items-center p-4 hover:bg-slate-50 transition-colors group ${idx < (Math.min(orders.length, 5) - 1) ? 'border-b border-[#E9EDEF]' : ''}`}
                >
                  {/* Avatar initial */}
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center font-bold text-secondary text-sm mr-3 shrink-0">
                    {order.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-on-surface truncate">{order.customerName}</span>
                      <span className="text-primary font-bold ml-2 shrink-0">{profile.currencySymbol}{order.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-on-surface-variant text-sm truncate">{order.product}</span>
                      {getStatusBadge(order)}
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{timeAgo(order.createdAt)}</p>
                  </div>
                  <div className="flex gap-1.5 ml-3 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrder(order.id, { deliveryStatus: 'Delivered' });
                        showToast('Marked as delivered');
                      }}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-high text-secondary hover:bg-secondary-container active:scale-90 transition-transform"
                      title="Mark Delivered"
                    >
                      <span className="material-symbols-outlined text-base">check_circle</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOrder(order.id, { paymentStatus: 'Paid' });
                        showToast('Marked as paid');
                      }}
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-high text-primary hover:bg-primary-container active:scale-90 transition-transform"
                      title="Mark Paid"
                    >
                      <span className="material-symbols-outlined text-base">payments</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => onViewChange('new_order')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {showConfetti && <Confetti colors={pColors} />}
    </div>
  );
}
