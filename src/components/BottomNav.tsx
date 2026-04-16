export function BottomNav({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  const tabs = [
    { id: 'dashboard', icon: 'home', label: 'Home' },
    { id: 'orders', icon: 'receipt_long', label: 'Orders' },
    { id: 'directory', icon: 'group', label: 'Customers' },
    { id: 'daily_summary', icon: 'summarize', label: 'Summary' },
    { id: 'settings', icon: 'person', label: 'Profile' },
  ];

  return (
    <nav 
      className="fixed bottom-0 w-full z-50 bg-white border-t border-slate-100 shadow-[0_-4px_12px_rgba(12,30,38,0.04)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center w-full px-2 py-2">
        {tabs.map(tab => {
          const isActive =
            activeTab === tab.id ||
            (activeTab === 'new_order' && tab.id === 'orders') ||
            (activeTab === 'order_details' && tab.id === 'orders') ||
            (activeTab === 'order_status' && tab.id === 'orders');
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center px-4 py-1.5 transition-transform active:scale-90 ${
                isActive
                  ? 'bg-[#e8f6ff] text-[#006d2f] rounded-xl'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span
                className="material-symbols-outlined mb-1"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {tab.icon}
              </span>
              <span className="font-['Inter'] text-[10px] font-medium uppercase tracking-[0.05em]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
