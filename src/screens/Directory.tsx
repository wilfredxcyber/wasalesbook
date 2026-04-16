import { useMemo, useState } from 'react';
import { Order } from '../store/types';

interface DirectoryProps {
  orders: Order[];
  onViewChange: (view: string, orderId?: string) => void;
  showToast: (msg: string) => void;
}

type CustomerFilter = 'All' | 'With Balance' | 'Recent';

function formatCurrency(amount: number) {
  return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

export function Directory({ orders, onViewChange, showToast }: DirectoryProps) {
  const [activeFilter, setActiveFilter] = useState<CustomerFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filters: CustomerFilter[] = ['All', 'With Balance', 'Recent'];

  // Derive unique customers from orders
  const customers = useMemo(() => {
    const map = new Map<string, {
      name: string;
      totalOrders: number;
      unpaidBalance: number;
      lastOrderAt: string;
    }>();

    orders.forEach(o => {
      const key = o.customerName.toLowerCase().trim();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          name: o.customerName,
          totalOrders: 1,
          unpaidBalance: o.paymentStatus === 'Unpaid' ? o.amount : 0,
          lastOrderAt: o.createdAt,
        });
      } else {
        existing.totalOrders += 1;
        if (o.paymentStatus === 'Unpaid') existing.unpaidBalance += o.amount;
        if (o.createdAt > existing.lastOrderAt) existing.lastOrderAt = o.createdAt;
      }
    });
    return Array.from(map.values()).sort((a, b) => b.lastOrderAt.localeCompare(a.lastOrderAt));
  }, [orders]);

  const filtered = useMemo(() => {
    let result = customers;
    if (searchQuery.trim()) {
      result = result.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (activeFilter === 'With Balance') result = result.filter(c => c.unpaidBalance > 0);
    if (activeFilter === 'Recent') result = result.slice(0, 10);
    return result;
  }, [customers, activeFilter, searchQuery]);

  return (
    <div className="bg-background min-h-screen pb-20">
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-4 py-3 w-full">
          <h1 className="text-lg font-bold tracking-tighter text-[#006d2f]">Customers</h1>
          <span className="text-xs text-outline">{customers.length} customers</span>
        </div>
        <div className="bg-slate-100 h-[1px] w-full"></div>
      </header>

      <main className="pt-16 px-4">
        <div className="mt-4 mb-4">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-outline">search</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest border-none rounded-xl py-3.5 pl-12 pr-4 shadow-[0_2px_8px_rgba(12,30,38,0.04)] focus:ring-2 focus:ring-primary transition-all outline-none placeholder:text-outline/60"
              placeholder="Search by name..."
              type="text"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-secondary-container text-on-secondary-container font-semibold shadow-sm'
                  : 'bg-surface-container-lowest border border-outline-variant/20 text-on-surface-variant font-medium'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">group</span>
            <p className="font-bold text-on-surface-variant">No customers yet</p>
            <p className="text-sm text-outline mt-1">Customers appear automatically when you log orders</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_24px_rgba(12,30,38,0.04)] overflow-hidden">
            <div className="px-5 py-3 bg-surface-container-low flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-outline">Customer</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-outline">Balance</span>
            </div>
            <div className="divide-y divide-[#E9EDEF]">
              {filtered.map(customer => (
                <div
                  key={customer.name}
                  onClick={() => showToast(`${customer.name} — ${customer.totalOrders} orders`)}
                  className="cursor-pointer flex items-center justify-between p-4 hover:bg-surface-container-low/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center font-bold text-secondary text-lg">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface text-[15px] group-hover:text-primary transition-colors">{customer.name}</p>
                      <p className="text-[12px] text-outline font-medium">{customer.totalOrders} {customer.totalOrders === 1 ? 'order' : 'orders'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {customer.unpaidBalance > 0 ? (
                      <>
                        <p className="text-[14px] font-bold text-error tracking-tight">{formatCurrency(customer.unpaidBalance)}</p>
                        <p className="text-[10px] font-bold uppercase text-error/70 tracking-widest">Owes</p>
                      </>
                    ) : (
                      <>
                        <p className="text-[14px] font-bold text-outline tracking-tight">{formatCurrency(0)}</p>
                        <p className="text-[10px] font-bold uppercase text-outline/50 tracking-widest">Settled</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
