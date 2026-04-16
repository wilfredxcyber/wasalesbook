import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BusinessProfile, CatalogueProduct } from '../store/types';
import { RECEIPT_THEMES } from '../components/ReceiptCard';

export function PublicStore({ storeId }: { storeId: string }) {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [catalogue, setCatalogue] = useState<CatalogueProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStore() {
      try {
        const [profileRes, catalogueRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', storeId).single(),
          supabase.from('products').select('*').eq('user_id', storeId).order('created_at', { ascending: false })
        ]);

        if (profileRes.error) {
          console.error('[PublicStore] Profile fetch error:', profileRes.error);
          setError(`DB_ERROR: ${profileRes.error.message}`);
          throw profileRes.error;
        }
        
        const rawProfile = profileRes.data;
        const mappedProfile: BusinessProfile = {
          userName: rawProfile.user_name || 'Store',
          email: rawProfile.email || '',
          currencySymbol: rawProfile.currency_symbol || '₦',
          predefinedProducts: rawProfile.predefined_products || [],
          paymentDetails: rawProfile.payment_details || '',
          notifications: rawProfile.notifications ?? true,
          logoUrl: rawProfile.logo_url || undefined,
          isStorefrontPublished: rawProfile.is_storefront_published ?? false,
          storefrontContactLink: rawProfile.storefront_contact_link || undefined,
          receiptDesign: rawProfile.receipt_design,
        };

        if (!mappedProfile.isStorefrontPublished) {
           setError('OFFLINE');
           setProfile(mappedProfile); // keep profile for name
           setLoading(false);
           return;
        }

        if (catalogueRes.data) {
          const mappedCat = catalogueRes.data.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category,
            description: p.description,
            imageUrl: p.image_url,
            createdAt: p.created_at,
          }));
          setCatalogue(mappedCat);
        }
        
        setProfile(mappedProfile);
      } catch (err: any) {
        setError(err.message || 'Store not found');
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, [storeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error === 'OFFLINE') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-amber-600 text-4xl">store_off</span>
        </div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{profile?.userName || 'Store'} is currently Offline</h1>
        <p className="text-slate-500 mt-2 text-sm max-w-sm leading-relaxed">
          The business owner hasn't published their digital storefront yet. Please check back later or contact them directly.
        </p>
        <div className="mt-10 px-4 py-2 bg-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
           Whatsbook Powered
        </div>
      </div>
    );
  }

  if (error && error !== 'OFFLINE') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <span className="material-symbols-outlined text-black/20 text-6xl mb-4">store_off</span>
        <h1 className="text-xl font-bold text-slate-800">Store Not Found</h1>
        <p className="text-slate-500 mt-2 text-sm max-w-sm">This store link may be invalid or the business owner hasn't published it yet.</p>
        <div className="mt-4 p-2 bg-red-100 rounded text-[10px] text-red-600 font-mono">
          {error}
        </div>
      </div>
    );
  }

  // --- Rendering same stylistic layout as StorefrontPreview, minus the wrapper controls ---
  const themeId = profile.receiptDesign?.themeId || RECEIPT_THEMES[0].id;
  const customBg = profile.receiptDesign?.customBgColor || '#ffffff';
  const customText = profile.receiptDesign?.customTextColor || '#1e293b';
  const customAccent = profile.receiptDesign?.customAccentColor || '#006d2f';
  const fontId = profile.receiptDesign?.fontId || 'sans';

  let theme = RECEIPT_THEMES.find(t => t.id === themeId) || RECEIPT_THEMES[0];
  if (themeId === 'custom') {
    theme = {
      ...theme,
      cardLg: customBg,
      topBar: customAccent,
      logoBg: customAccent,
      primaryText: customAccent,
      secondaryText: customText,
      valueText: customText,
    };
  }

  const fontFamilyMap: Record<string, string> = {
    sans: "'Inter', 'Segoe UI', system-ui, sans-serif",
    serif: "'Georgia', 'Times New Roman', serif",
    mono: "'Courier New', Courier, monospace",
    rounded: "'Nunito', 'Quicksand', 'Comic Sans MS', sans-serif",
    elegant: "'Playfair Display', 'Didot', serif",
    handwriting: "'Brush Script MT', 'Lucida Handwriting', cursive",
    typewriter: "'American Typewriter', Courier, mono",
    blocky: "'Impact', 'Arial Black', sans-serif",
  };
  
  const fontFam = fontFamilyMap[fontId] || fontFamilyMap['sans'];
  const businessName = profile.userName || 'Your Shop';
  const currency = profile.currencySymbol || '₦';

  const defaultUnsplashImages = [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    'https://images.unsplash.com/photo-1599643478524-fb66f4568ddf?w=500&q=80',
    'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500&q=80',
    'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&q=80',
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: theme.cardLg, fontFamily: fontFam, color: theme.valueText }}>
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-down { animation: fadeInDown 0.8s ease-out forwards; }
        .animate-fade-up { animation: fadeInUp 0.8s ease-out forwards; }
      `}</style>
      {/* Hero Section */}
      <div className="pt-16 pb-10 px-6 flex flex-col items-center text-center relative z-10 animate-fade-down">
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: theme.logoBg, color: '#fff', fontSize: 36, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 24px rgba(0,0,0,0.1)', marginBottom: 16 }}>
          {profile.logoUrl ? (
            <img src={profile.logoUrl} alt="Logo" className="w-full h-full rounded-full object-cover" />
          ) : (
             businessName.charAt(0).toUpperCase()
          )}
        </div>
        <h1 style={{ color: theme.primaryText, fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>{businessName}</h1>
        <p style={{ color: theme.secondaryText, fontSize: 13, marginTop: 4, maxWidth: 280, fontWeight: 500 }}>Welcome to our digital storefront. Browse our available products below.</p>
        
        <div className="mt-6 flex justify-center w-full">
          {profile.storefrontContactLink ? (
             <a 
               href={profile.storefrontContactLink.startsWith('http') ? profile.storefrontContactLink : `https://${profile.storefrontContactLink}`} 
               target="_blank" rel="noopener noreferrer"
               className="px-6 py-2.5 rounded-full text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-2 hover:opacity-90" 
               style={{ background: theme.primaryText, color: theme.cardLg }}
             >
               <span className="material-symbols-outlined text-[16px]">touch_app</span>
               Contact to Order
             </a>
          ) : (
             <div className="px-6 py-2.5 rounded-full text-xs font-bold opacity-60" style={{ background: theme.primaryText, color: theme.cardLg }}>
               Ordering Unavailable
             </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 pb-24 relative z-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
          {catalogue.length === 0 ? (
            <div className="col-span-2 text-center py-10 opacity-60 font-medium">Currently out of stock.</div>
          ) : (
            catalogue.map((product, idx) => (
              <div key={product.id} className="rounded-2xl overflow-hidden shadow-sm hover:scale-[1.02] transition-transform" style={{ backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: `1px solid ${theme.primaryText}40` }}>
                <img 
                  src={product.imageUrl || defaultUnsplashImages[idx % defaultUnsplashImages.length]} 
                  alt={product.name} 
                  className="w-full aspect-square object-cover" 
                />
                <div className="p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent absolute bottom-0 left-0 right-0">
                  <h3 className="text-white text-xs font-bold line-clamp-1 drop-shadow-md">{product.name}</h3>
                  <p className="text-white/90 text-sm font-black drop-shadow-md">{currency}{product.price.toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Brand Footer */}
      <div className="absolute bottom-6 left-0 w-full text-center z-10">
        <p style={{ color: theme.secondaryText, fontSize: 10, opacity: 0.6 }}>Powered by Whatsbook</p>
      </div>
    </div>
  );
}
