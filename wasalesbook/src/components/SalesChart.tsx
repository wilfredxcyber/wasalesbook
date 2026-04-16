import { useMemo } from 'react';
import { Order } from '../store/types';

interface SalesChartProps {
  orders: Order[];
}

export function SalesChart({ orders }: SalesChartProps) {
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toDateString(),
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
        total: 0
      };
    });

    orders.forEach(o => {
      const oDate = new Date(o.createdAt).toDateString();
      const dayData = last7Days.find(d => d.date === oDate);
      if (dayData) {
        dayData.total += o.amount;
      }
    });

    const maxVal = Math.max(...last7Days.map(d => d.total), 1); // Avoid div by zero
    
    return last7Days.map(d => ({
      ...d,
      heightPercentage: Math.max((d.total / maxVal) * 100, 4) // minimum 4% height so it's a visible bump
    }));

  }, [orders]);

  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm border border-outline-variant/10 mt-4">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Last 7 Days Sales</h3>
      <div className="flex items-end justify-between h-32 gap-2">
        {chartData.map((d, i) => (
          <div key={i} className="flex flex-col items-center flex-1 group">
            <div className="w-full max-w-[24px] bg-primary/20 rounded-t-sm relative transition-all duration-500 ease-out group-hover:bg-primary/40" style={{ height: `${d.heightPercentage}%` }}>
              <div 
                className="absolute bottom-0 w-full bg-primary rounded-t-sm transition-all duration-500" 
                style={{ height: d.total > 0 ? '100%' : '0%' }}
              />
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 transition-opacity">
                ₦{d.total}
              </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 mt-2">{d.dayLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
