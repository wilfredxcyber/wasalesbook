import { useState } from 'react';
import { BusinessProfile, Order } from '../store/types';
import { ReceiptCard, RECEIPT_THEMES, FONTS } from '../components/ReceiptCard';

interface ReceiptDesignScreenProps {
  profile: BusinessProfile;
  updateProfile: (patch: Partial<BusinessProfile>) => void;
  onViewChange: (view: string) => void;
  showToast: (msg: string) => void;
}

const dummyOrder: Order = {
  id: '102934',
  customerName: 'Jane Doe',
  product: 'Premium Handmade Ceramics',
  amount: 45000.50,
  paymentStatus: 'Paid',
  deliveryStatus: 'Pending',
  notes: 'Deliver to front porch please.',
  phone: '2348012345678',
  createdAt: new Date().toISOString()
};

export function ReceiptDesignScreen({ profile, updateProfile, onViewChange, showToast }: ReceiptDesignScreenProps) {
  const [themeId, setThemeId] = useState<string>(profile.receiptDesign?.themeId || RECEIPT_THEMES[0].id);
  const [fontId, setFontId] = useState<string>(profile.receiptDesign?.fontId || FONTS[0].id);
  const [dividerStyle, setDividerStyle] = useState<'zigzag' | 'dashed' | 'solid' | 'wavy'>(profile.receiptDesign?.dividerStyle || 'zigzag');
  const [logoShape, setLogoShape] = useState<'circle' | 'square' | 'squircle'>(profile.receiptDesign?.logoShape || 'circle');
  const [footerMessage, setFooterMessage] = useState<string>(profile.receiptDesign?.footerMessage || 'Thank you for your purchase ❤️');
  
  const [customBgColor, setCustomBgColor] = useState<string>(profile.receiptDesign?.customBgColor || '#ffffff');
  const [customTextColor, setCustomTextColor] = useState<string>(profile.receiptDesign?.customTextColor || '#1e293b');
  const [customAccentColor, setCustomAccentColor] = useState<string>(profile.receiptDesign?.customAccentColor || '#006d2f');
  const [watermark, setWatermark] = useState<'none' | 'paid' | 'thank_you' | 'handmade' | 'verified'>(profile.receiptDesign?.watermark || 'none');

  const previewProfile: BusinessProfile = {
    ...profile,
    receiptDesign: { themeId, fontId, dividerStyle, logoShape, footerMessage, customBgColor, customTextColor, customAccentColor, watermark }
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        receiptDesign: { themeId, fontId, dividerStyle, logoShape, footerMessage, customBgColor, customTextColor, customAccentColor, watermark }
      });
      showToast('Receipt design saved!');
      onViewChange('settings');
    } catch (err) {
      console.error('Failed to save receipt design:', err);
      showToast('Error: Could not save design.');
    }
  };

  return (
    <div className="bg-background min-h-screen pb-32">
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-4 py-3 w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => onViewChange('settings')} className="p-2 -ml-2 rounded-full hover:bg-slate-100/50 transition-colors active:scale-95">
              <span className="material-symbols-outlined text-slate-900">arrow_back</span>
            </button>
            <h1 className="font-semibold tracking-tight text-slate-900 text-lg">Receipt Design</h1>
          </div>
          <button 
            onClick={handleSave}
            className="text-primary font-bold text-sm px-4 py-1.5 bg-primary/10 rounded-full active:scale-95 transition-transform"
          >
            Save
          </button>
        </div>
        <div className="bg-slate-100 h-[1px] w-full"></div>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto space-y-8">
        
        {/* Real-time Preview Area */}
        <section className="bg-surface-container-lowest p-6 pt-8 rounded-3xl shadow-sm border border-outline-variant/10 flex flex-col items-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 w-full text-center">Live Preview</p>
          <div className="pointer-events-none w-full max-w-sm shrink-0 scale-[0.9] origin-top md:scale-100">
            <ReceiptCard order={dummyOrder} profile={previewProfile} showToast={() => {}} />
          </div>
        </section>

        {/* Customization Panes */}
        <section className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/10 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">palette</span>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Templates</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {RECEIPT_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                className={`relative h-20 rounded-2xl flex items-center justify-center text-sm font-bold transition-all border-2 overflow-hidden ${themeId === t.id ? 'border-primary ring-2 ring-primary/20 ring-offset-2' : 'border-outline-variant/20 hover:border-outline-variant/50'}`}
                style={{ background: t.cardLg }}
              >
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: t.topBar }} />
                <span style={{ color: t.primaryText }}>{t.name}</span>
                {themeId === t.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[12px] text-white font-bold">check</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="w-full h-px bg-slate-100 my-6"></div>

          <div className="mt-4 p-5 bg-surface-container border border-outline-variant/20 rounded-2xl space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">format_color_fill</span>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Custom Colors</h3>
              </div>
            </div>
            {themeId !== 'custom' && (
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                You are currently using a preset template. Touch any color below to switch to a custom design.
              </p>
            )}
            
            <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-outline-variant/10">
              <span className="text-sm font-semibold text-slate-700">Background Color</span>
              <div className="relative w-8 h-8 rounded overflow-hidden shadow-sm border border-outline-variant/20">
                <input type="color" value={customBgColor} onChange={e => { setCustomBgColor(e.target.value); setThemeId('custom'); }} className="absolute -inset-2 w-16 h-16 cursor-pointer" />
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-outline-variant/10">
              <span className="text-sm font-semibold text-slate-700">Primary Text Color</span>
              <div className="relative w-8 h-8 rounded overflow-hidden shadow-sm border border-outline-variant/20">
                <input type="color" value={customTextColor} onChange={e => { setCustomTextColor(e.target.value); setThemeId('custom'); }} className="absolute -inset-2 w-16 h-16 cursor-pointer" />
              </div>
            </div>

            <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-outline-variant/10">
              <span className="text-sm font-semibold text-slate-700">Brand / Accent Color</span>
              <div className="relative w-8 h-8 rounded overflow-hidden shadow-sm border border-outline-variant/20">
                <input type="color" value={customAccentColor} onChange={e => { setCustomAccentColor(e.target.value); setThemeId('custom'); }} className="absolute -inset-2 w-16 h-16 cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100 my-6"></div>

          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">font_download</span>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Typography</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {FONTS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFontId(f.id)}
                style={{ fontFamily: f.value }}
                className={`relative h-16 px-4 rounded-xl text-left transition-all border-2 ${fontId === f.id ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:bg-surface-container-lowest'}`}
              >
                <p className={`text-base ${fontId === f.id ? 'font-bold text-primary' : 'text-slate-700'}`}>{f.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-full">The quick brown fox...</p>
                {fontId === f.id && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[12px] text-white font-bold">check</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="w-full h-px bg-slate-100 my-6"></div>

          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">interests</span>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Logo Shape</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'circle', label: 'Round', radius: "50%" },
              { id: 'squircle', label: 'Soft Edge', radius: "12px" },
              { id: 'square', label: 'Square', radius: "4px" }
            ].map(shape => (
               <button
                key={shape.id}
                onClick={() => setLogoShape(shape.id as 'circle' | 'square' | 'squircle')}
                className={`relative py-4 rounded-xl flex flex-col items-center gap-2 transition-all border-2 ${logoShape === shape.id ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:bg-surface-container-lowest'}`}
               >
                 <div className="w-8 h-8 bg-slate-300" style={{ borderRadius: shape.radius }} />
                 <span className={`text-[11px] uppercase tracking-widest ${logoShape === shape.id ? 'font-bold text-primary' : 'font-semibold text-slate-500'}`}>{shape.label}</span>
               </button>
            ))}
          </div>

          <div className="w-full h-px bg-slate-100 my-6"></div>

          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">horizontal_rule</span>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Divider Line</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
             {[
               { id: 'zigzag', label: 'ZigZag' },
               { id: 'wavy', label: 'Wavy' },
               { id: 'dashed', label: 'Dashed' },
               { id: 'solid', label: 'Solid' }
             ].map(div => (
               <button
                key={div.id}
                onClick={() => setDividerStyle(div.id as 'zigzag' | 'dashed' | 'solid' | 'wavy')}
                className={`relative py-3 rounded-xl transition-all border-2 ${dividerStyle === div.id ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:bg-surface-container-lowest'}`}
               >
                 <span className={`text-[11px] uppercase tracking-widest ${dividerStyle === div.id ? 'font-bold text-primary' : 'font-semibold text-slate-500'}`}>{div.label}</span>
               </button>
             ))}
          </div>

          <div className="w-full h-px bg-slate-100 my-6"></div>

          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">local_police</span>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Rubber Stamp</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
             {[
               { id: 'none', label: 'None' },
               { id: 'paid', label: 'PAID' },
               { id: 'verified', label: 'VERIFIED' },
               { id: 'thank_you', label: 'THANK YOU' },
               { id: 'handmade', label: 'HANDMADE' }
             ].map(stamp => (
               <button
                key={stamp.id}
                onClick={() => setWatermark(stamp.id as 'none' | 'paid' | 'thank_you' | 'handmade' | 'verified')}
                className={`relative py-3 rounded-xl transition-all border-2 ${watermark === stamp.id ? 'border-primary bg-primary/5' : 'border-outline-variant/20 hover:bg-surface-container-lowest'}`}
               >
                 <span className={`text-[11px] uppercase tracking-widest ${watermark === stamp.id ? 'font-bold text-primary' : 'font-semibold text-slate-500'}`}>{stamp.label}</span>
               </button>
             ))}
          </div>

          <div className="w-full h-px bg-slate-100 my-6"></div>

          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">edit_note</span>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Footer Message</h2>
          </div>
          <textarea
            value={footerMessage}
            onChange={(e) => setFooterMessage(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all resize-none"
            rows={2}
            placeholder="Thank you for your purchase ❤️"
          />
        </section>

      </main>
    </div>
  );
}
