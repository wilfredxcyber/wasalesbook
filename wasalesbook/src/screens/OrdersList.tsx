import { useState } from 'react';
import { Order, BusinessProfile } from '../store/types';

type Filter = 'All' | 'Pending' | 'Paid' | 'Delivered';

interface OrdersListProps {
  orders: Order[];
  profile: BusinessProfile;
  onViewChange: (view: string, orderId?: string) => void;
  showToast: (msg: string) => void;
  updateOrder: (id: string, patch: Partial<Order>) => Promise<void>;
  initialSearch?: string;
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

export function OrdersList({ orders, profile, onViewChange, showToast, updateOrder, initialSearch = '' }: OrdersListProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const filters: Filter[] = ['All', 'Pending', 'Paid', 'Delivered'];

  const filteredOrders = orders.filter(o => {
    // text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!o.customerName.toLowerCase().includes(q) && !o.product.toLowerCase().includes(q)) {
        return false;
      }
    }
    // status filter
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Paid') return o.paymentStatus === 'Paid';
    if (activeFilter === 'Pending') return o.paymentStatus === 'Unpaid';
    if (activeFilter === 'Delivered') return o.deliveryStatus === 'Delivered';
    return true;
  });

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
        <div className="flex items-center px-4 py-3 h-14">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">All Orders</h1>
        </div>
        <div className="bg-slate-100 h-[1px] w-full"></div>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto space-y-4">
        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              className="w-full bg-surface-container-lowest border-none rounded-2xl pl-10 pr-4 py-3 text-sm text-on-surface shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Search by customer or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter
                    ? 'bg-secondary-container text-on-secondary-container shadow-sm'
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Order List */}
        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(12,30,38,0.04)]">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">search_off</span>
              <h2 className="text-base font-bold text-slate-700">No orders found</h2>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            filteredOrders.map((order, idx) => (
              <div
                key={order.id}
                onClick={() => onViewChange('order_details', order.id)}
                className={`cursor-pointer flex items-center p-4 hover:bg-slate-50 transition-colors group ${idx < filteredOrders.length - 1 ? 'border-b border-[#E9EDEF]' : ''}`}
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
            ))
          )}
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => onViewChange('new_order')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_8px_16px_rgba(37,211,102,0.3)] active:scale-90 transition-all z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
}
