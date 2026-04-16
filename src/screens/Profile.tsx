import { useState } from 'react';

export function Profile({ onViewChange, showToast }: { onViewChange: (view: string) => void, showToast: (msg: string) => void }) {
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [autoParse, setAutoParse] = useState(true);
  const [template, setTemplate] = useState("Hello {customer_name}, your order #{order_id} has been confirmed! Total amount is {total_amount}. Thank you for supporting Handmade Ceramics!");

  const insertVariable = (variable: string) => {
    setTemplate(prev => prev + ` {${variable}}`);
    showToast(`Variable {${variable}} inserted`);
  };

  return (
    <div className="bg-background min-h-screen pb-24">
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-md shadow-sm flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <button onClick={() => onViewChange('dashboard')} className="transition-all duration-200 active:scale-95 p-2 rounded-full hover:bg-slate-100 text-slate-500">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-['Inter'] font-semibold text-lg tracking-tight text-slate-900">Profile</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => showToast('More options')} className="transition-all duration-200 active:scale-95 p-2 rounded-full hover:bg-slate-100 text-slate-500">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto space-y-6">
        <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_8px_32px_rgba(12,30,38,0.04)] flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <img className="w-24 h-24 rounded-full object-cover ring-4 ring-primary-container/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtG7gWTN5LmJQB8VXoN5yooEtD-LYsK60hTN48Tk4cjVs8A7YeCuUqbzXk9BIuKUQ2ZlPSr8bwXJfe9RnyDEDiT7EzL4HiQY4rut7bluK3L5LoRoCFUGS_Ee9UYnCkanBvuewTsB0IoL-DeYha4G6bFy9201ZlTs38fyr0FJpkhApsEO-7opL8DzkqXoebvcgJAuCbsqCQMIo8uyqbEueAxuoVSreHExOZ_ueLYuzQrvh_ieFi7qj-sJuy48SLVnRr5PUx0qDDiTY" alt="Profile" />
            <button onClick={() => showToast('Change profile photo')} className="absolute bottom-0 right-0 bg-primary-container text-white p-1.5 rounded-full border-2 border-white active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-sm">photo_camera</span>
            </button>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">Maria Garcia</h2>
            <p className="text-on-surface-variant flex items-center justify-center md:justify-start gap-2 mt-1">
              <span className="material-symbols-outlined text-primary">call</span>
              +1 (555) 012-3456
            </p>
            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-secondary-container/30 text-on-secondary-container text-xs font-bold rounded-full tracking-wider uppercase">Verified Seller</span>
              <span className="px-3 py-1 bg-primary-container/20 text-on-primary-container text-xs font-bold rounded-full tracking-wider uppercase">Top Rated</span>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest opacity-60">Business Settings</h3>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-1 shadow-[0_4px_12px_rgba(12,30,38,0.02)] border border-outline-variant/10">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Business Name</label>
                  <div className="relative">
                    <input className="w-full bg-surface-container-low border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary font-medium transition-all outline-none" type="text" defaultValue="Handmade Ceramics" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Default Currency</label>
                  <div className="relative">
                    <select className="w-full bg-surface-container-low border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary font-medium appearance-none outline-none">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">keyboard_arrow_down</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">Tax Rate</label>
                <div className="relative max-w-[120px]">
                  <input className="w-full bg-surface-container-low border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary font-medium text-center outline-none" type="text" defaultValue="8%" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest opacity-60">WhatsApp Template</h3>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_12px_rgba(12,30,38,0.02)] border border-outline-variant/10">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Default Order Receipt Template</label>
            <div className="relative">
              <textarea 
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full bg-surface-container-low border-0 rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary font-body text-sm leading-relaxed resize-none outline-none" 
                rows={4} 
              />
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2 hide-scrollbar">
                <button onClick={() => insertVariable('customer_name')} className="shrink-0 px-3 py-1.5 bg-surface-container-high rounded text-[10px] font-bold text-on-surface-variant hover:bg-surface-container-highest transition-colors">+{'{'}customer_name{'}'}</button>
                <button onClick={() => insertVariable('order_id')} className="shrink-0 px-3 py-1.5 bg-surface-container-high rounded text-[10px] font-bold text-on-surface-variant hover:bg-surface-container-highest transition-colors">+{'{'}order_id{'}'}</button>
                <button onClick={() => insertVariable('total_amount')} className="shrink-0 px-3 py-1.5 bg-surface-container-high rounded text-[10px] font-bold text-on-surface-variant hover:bg-surface-container-highest transition-colors">+{'{'}total_amount{'}'}</button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest opacity-60">Preferences</h3>
          </div>
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(12,30,38,0.02)] border border-outline-variant/10 divide-y divide-outline-variant/10">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">dark_mode</span>
                <span className="text-sm font-medium text-on-surface">Dark Mode</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">notifications</span>
                <span className="text-sm font-medium text-on-surface">Push Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input checked={pushNotifications} onChange={(e) => setPushNotifications(e.target.checked)} className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">content_paste</span>
                <span className="text-sm font-medium text-on-surface">Auto-Parse Clipboard</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input checked={autoParse} onChange={(e) => setAutoParse(e.target.checked)} className="sr-only peer" type="checkbox" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>
          </div>
        </section>

        <section className="pt-4">
          <button onClick={() => showToast('Logged out successfully')} className="w-full bg-surface-container-lowest border border-error/20 text-error font-bold py-4 rounded-xl shadow-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
          <p className="text-center text-[10px] text-on-surface-variant/40 mt-6 uppercase tracking-widest font-bold">App Version 2.4.1 (Stable)</p>
        </section>
      </main>
    </div>
  );
}
