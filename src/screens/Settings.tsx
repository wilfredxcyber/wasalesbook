import { useState } from 'react';
import { BusinessProfile } from '../store/types';

interface SettingsProps {
  profile: BusinessProfile;
  updateProfile: (patch: Partial<BusinessProfile>) => void;
  onViewChange: (view: string) => void;
  showToast: (msg: string) => void;
  onSignOut: () => void;
}

export function Settings({ profile, updateProfile, onViewChange, showToast, onSignOut }: SettingsProps) {
  const [userName, setUserName] = useState(profile.userName);
  const [email, setEmail] = useState(profile.email);
  const [currency, setCurrency] = useState(profile.currencySymbol);
  const [paymentDetails, setPaymentDetails] = useState(profile.paymentDetails);
  const [notifications, setNotifications] = useState(profile.notifications);
  const [logoUrl, setLogoUrl] = useState<string | undefined>(profile.logoUrl);
  const [storefrontContactLink, setStorefrontContactLink] = useState(profile.storefrontContactLink || '');
  
  const [newProduct, setNewProduct] = useState('');
  const [products, setProducts] = useState<string[]>(profile.predefinedProducts);

  const [openSection, setOpenSection] = useState<'profile' | 'products' | 'preferences' | null>('profile');

  const toggleSection = (section: 'profile' | 'products' | 'preferences') => {
    setOpenSection(prev => prev === section ? null : section);
  };

  const handleSave = () => {
    updateProfile({
      userName: userName.trim(),
      email: email.trim(),
      currencySymbol: currency.trim() || '$',
      paymentDetails: paymentDetails.trim(),
      predefinedProducts: products,
      notifications,
      logoUrl,
      storefrontContactLink: storefrontContactLink.trim(),
    });
    showToast('Profile saved successfully!');
    onViewChange('dashboard');
  };

  const addProduct = () => {
    if (newProduct.trim() && !products.includes(newProduct.trim())) {
      setProducts([...products, newProduct.trim()]);
      setNewProduct('');
    }
  };

  const removeProduct = (prod: string) => {
    setProducts(products.filter(p => p !== prod));
  };

  return (
    <div className="bg-background min-h-screen pb-32">
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-4 py-3 w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => onViewChange('dashboard')} className="p-2 -ml-2 rounded-full hover:bg-slate-100/50 transition-colors active:scale-95">
              <span className="material-symbols-outlined text-slate-900">arrow_back</span>
            </button>
            <h1 className="font-semibold tracking-tight text-slate-900 text-lg">Profile</h1>
          </div>
        </div>
        <div className="bg-slate-100 h-[1px] w-full"></div>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto space-y-4">
        {/* Accordion 1: Profile Details */}
        <section className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_16px_rgba(12,30,38,0.04)] overflow-hidden transition-all">
          <button 
            onClick={() => toggleSection('profile')}
            className="w-full flex items-center justify-between p-5 bg-surface-container-lowest"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">person</span>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Profile Details</h2>
            </div>
            <span className={`material-symbols-outlined text-slate-400 transition-transform ${openSection === 'profile' ? 'rotate-180' : ''}`}>expand_more</span>
          </button>
          
          {openSection === 'profile' && (
            <div className="p-5 pt-0 space-y-5 border-t border-slate-50 animate-slide-up">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-slate-50 border-2 border-dashed border-outline-variant/40 flex items-center justify-center relative overflow-hidden group cursor-pointer shadow-sm">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-slate-400 text-[24px]">add_photo_alternate</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Logo</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[20px]">edit</span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const maxSize = 200;
                            let width = img.width;
                            let height = img.height;
                            
                            if (width > height) {
                              if (width > maxSize) {
                                height *= maxSize / width;
                                width = maxSize;
                              }
                            } else {
                              if (height > maxSize) {
                                width *= maxSize / height;
                                height = maxSize;
                              }
                            }
                            
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              ctx.drawImage(img, 0, 0, width, height);
                              // Export as lightweight JPEG to fit within Supabase's textual payload limits
                              setLogoUrl(canvas.toDataURL('image/jpeg', 0.8));
                            }
                          };
                          if (ev.target?.result) {
                            img.src = ev.target.result as string;
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1 group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block group-focus-within:text-primary transition-colors">Seller Name</label>
                <input
                  className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary px-0 py-2 text-on-surface font-medium outline-none transition-all"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Ada Johnson"
                />
              </div>

              <div className="space-y-1 group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block group-focus-within:text-primary transition-colors">Email Address</label>
                <input
                  className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary px-0 py-2 text-on-surface font-medium outline-none transition-all"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@salesbook.app"
                />
              </div>

              <div className="space-y-1 group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block group-focus-within:text-primary transition-colors">Storefront Contact Link</label>
                <input
                  className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary px-0 py-2 text-on-surface font-medium outline-none transition-all"
                  type="text"
                  value={storefrontContactLink}
                  onChange={(e) => setStorefrontContactLink(e.target.value)}
                  placeholder="e.g. wa.me/2348000... or instagram.com/..."
                />
              </div>

              <div className="space-y-1 group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block group-focus-within:text-primary transition-colors">Currency Symbol</label>
                <input
                  className="w-full max-w-[100px] bg-transparent border-b border-outline-variant/40 focus:border-primary px-0 py-2 text-on-surface font-medium outline-none transition-all"
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="$, ₦, £, etc."
                />
              </div>

              <div className="space-y-1 group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block group-focus-within:text-primary transition-colors">Saved Payment Details</label>
                <textarea
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 focus:border-primary focus:ring-1 focus:ring-primary text-sm text-on-surface outline-none transition-all resize-none mt-2"
                  rows={3}
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  placeholder="e.g. Bank Name: Zenith\nAcc: 1234567890\nName: Ada Johnson"
                />
              </div>
            </div>
          )}
        </section>

        {/* Accordion 2: Predefined Products */}
        <section className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_16px_rgba(12,30,38,0.04)] overflow-hidden transition-all">
          <button 
            onClick={() => toggleSection('products')}
            className="w-full flex items-center justify-between p-5 bg-surface-container-lowest"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">sell</span>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Predefined Tags</h2>
            </div>
            <span className={`material-symbols-outlined text-slate-400 transition-transform ${openSection === 'products' ? 'rotate-180' : ''}`}>expand_more</span>
          </button>
          
          {openSection === 'products' && (
            <div className="p-5 pt-0 border-t border-slate-50 animate-slide-up space-y-4">
              <p className="text-xs text-slate-500">Add quick product tags to use when logging an order.</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl px-3 py-2 text-sm focus:border-primary outline-none transition-all"
                  type="text"
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addProduct()}
                  placeholder="e.g. Bulk Rice"
                />
                <button onClick={addProduct} className="px-4 py-2 bg-secondary-container text-secondary font-bold rounded-xl active:scale-95 transition-transform">Add</button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {products.map(prod => (
                  <div key={prod} className="flex items-center gap-1 bg-surface-container-highest px-3 py-1.5 rounded-full text-sm font-medium text-slate-700">
                    {prod}
                    <button onClick={() => removeProduct(prod)} className="ml-1 text-slate-400 hover:text-error">
                      <span className="material-symbols-outlined text-sm pt-0.5">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Accordion 3: App Preferences */}
        <section className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_16px_rgba(12,30,38,0.04)] overflow-hidden transition-all">
          <button 
            onClick={() => toggleSection('preferences')}
            className="w-full flex items-center justify-between p-5 bg-surface-container-lowest"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">tune</span>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">App Preferences</h2>
            </div>
            <span className={`material-symbols-outlined text-slate-400 transition-transform ${openSection === 'preferences' ? 'rotate-180' : ''}`}>expand_more</span>
          </button>
          
          {openSection === 'preferences' && (
            <div className="p-5 pt-0 border-t border-slate-50 animate-slide-up space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-on-surface">Order Notifications</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Alerts when new items arrive</p>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${notifications ? 'bg-primary' : 'bg-outline-variant/30'}`}
                >
                  <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-transform ${notifications ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </button>
              </div>

            </div>
          )}
        </section>

        {/* Receipt Design Card */}
        <section className="pt-2">
          <button
            onClick={() => onViewChange('receipt_design')}
            className="w-full bg-gradient-to-br from-[#8b5cf6] to-[#4c1d95] text-white rounded-2xl p-5 shadow-[0_8px_32px_rgba(12,30,38,0.15)] flex items-center gap-4 active:scale-95 transition-transform group mb-4"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
              <span className="material-symbols-outlined text-2xl text-white">palette</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-extrabold text-base tracking-tight">Receipt Design</p>
              <p className="text-white/70 text-xs mt-0.5">Customize your receipt colors, fonts, & templates</p>
            </div>
            <span className="material-symbols-outlined text-white/60 group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>
        </section>

        {/* Storefront Preview Card */}
        <section className="pt-2">
          <button
            onClick={() => onViewChange('storefront_preview')}
            className="w-full bg-gradient-to-br from-[#10b981] to-[#047857] text-white rounded-2xl p-5 shadow-[0_8px_32px_rgba(12,30,38,0.15)] flex items-center gap-4 active:scale-95 transition-transform group mb-4"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
              <span className="material-symbols-outlined text-2xl text-white">storefront</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-extrabold text-base tracking-tight">Public Storefront Preview</p>
              <p className="text-white/80 text-xs mt-0.5">See what your customers see when they visit your link</p>
            </div>
            <span className="material-symbols-outlined text-white/60 group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>
        </section>

        {/* Product Catalogue Card */}
        <section className="pt-0">
          <button
            onClick={() => onViewChange('product_catalogue')}
            className="w-full bg-gradient-to-br from-primary to-secondary-container text-white rounded-2xl p-5 shadow-[0_8px_32px_rgba(12,30,38,0.15)] flex items-center gap-4 active:scale-95 transition-transform group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
              <span className="material-symbols-outlined text-2xl text-white">inventory_2</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-extrabold text-base tracking-tight">Product Catalogue</p>
              <p className="text-white/75 text-xs mt-0.5">Manage your full product inventory with photos, prices &amp; categories</p>
            </div>
            <span className="material-symbols-outlined text-white/60 group-hover:translate-x-1 transition-transform">chevron_right</span>
          </button>
        </section>
      </main>

      <div className="px-4 max-w-2xl mx-auto mt-8 mb-32 space-y-4">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to sign out? Your local data will remain safe.')) {
              onSignOut();
            }
          }}
          className="w-full bg-error-container text-on-error-container font-bold py-4 rounded-xl shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </div>

      <div className="fixed bottom-20 left-0 w-full p-4 bg-gradient-to-t from-background via-background to-transparent z-40">
        <button
          onClick={handleSave}
          className="w-full max-w-2xl mx-auto block bg-primary text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">save</span>
          Save Changes
        </button>
      </div>
    </div>
  );
}
