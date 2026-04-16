import { BusinessProfile, CatalogueProduct } from '../store/types';
import { RECEIPT_THEMES } from '../components/ReceiptCard';

interface StorefrontPreviewProps {
  profile: BusinessProfile;
  catalogue: CatalogueProduct[];
  storeId: string;
  updateProfile: (patch: Partial<BusinessProfile>) => void;
  onViewChange: (view: string) => void;
}

export function StorefrontPreview({ profile, catalogue, storeId, updateProfile, onViewChange }: StorefrontPreviewProps) {
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
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', // Shoes
    'https://images.unsplash.com/photo-1599643478524-fb66f4568ddf?w=500&q=80', // Watch
    'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500&q=80', // Bag
    'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&q=80', // Ceramics
  ];

  const handleShare = async () => {
    const storeUrl = `${window.location.origin}${window.location.pathname}#/store/${storeId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${businessName} Storefront`,
          text: `Shop our latest products at ${businessName}!`,
          url: storeUrl,
        });
      } catch (err) {
        // user cancelled share
      }
    } else {
      navigator.clipboard.writeText(storeUrl);
      alert('Store link copied to clipboard!');
    }
  };

  const displayCatalogue = catalogue.length > 0 ? catalogue : [
    { id: 'd1', name: 'Premium Leather Bag', price: 45000, category: 'Accessories', description: '', imageUrl: defaultUnsplashImages[2] },
    { id: 'd2', name: 'Classic Chronograph', price: 120000, category: 'Accessories', description: '', imageUrl: defaultUnsplashImages[1] },
    { id: 'd3', name: 'Minimalist Sneakers', price: 55000, category: 'Shoes', description: '', imageUrl: defaultUnsplashImages[0] },
    { id: 'd4', name: 'Handcrafted Ceramic', price: 18000, category: 'Home', description: '', imageUrl: defaultUnsplashImages[3] },
  ] as unknown as CatalogueProduct[];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: theme.cardLg, fontFamily: fontFam, color: theme.valueText }}>
      {/* Top Nav actions */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
        <button 
          onClick={() => onViewChange('settings')} 
          className="flex items-center gap-1 px-3 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-xs font-bold active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
          Exit Preview
        </button>

        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${profile.isStorefrontPublished ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {profile.isStorefrontPublished ? 'Live' : 'Draft'}
          </div>
          
          <button 
            onClick={() => updateProfile({ isStorefrontPublished: !profile.isStorefrontPublished })}
            className={`px-4 py-2 rounded-full text-xs font-bold active:scale-95 transition-all shadow-lg ${profile.isStorefrontPublished ? 'bg-error/20 text-error border border-error/50' : 'bg-primary text-white'}`}
          >
            {profile.isStorefrontPublished ? 'Unpublish' : 'Publish Store'}
          </button>

          <button 
            onClick={handleShare} 
            className="flex items-center gap-1 px-3 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            Share Link
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="pt-20 pb-10 px-6 flex flex-col items-center text-center relative z-10">
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
          <a 
            href={profile.storefrontContactLink ? (profile.storefrontContactLink.startsWith('http') ? profile.storefrontContactLink : `https://${profile.storefrontContactLink}`) : '#'} 
            target="_blank" rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-full text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-2" 
            style={{ background: theme.primaryText, color: theme.cardLg }}
          >
            <span className="material-symbols-outlined text-[16px]">touch_app</span>
            {profile.storefrontContactLink ? 'Contact to Order' : 'Setup Link in Settings'}
          </a>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 pb-24 relative z-10">
        <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
          {displayCatalogue.map((product, idx) => (
            <div key={product.id} className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: `1px solid ${theme.primaryText}40` }}>
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
          ))}
        </div>
      </div>
      
      {/* Brand Footer */}
      <div className="absolute bottom-6 left-0 w-full text-center z-10">
        <p style={{ color: theme.secondaryText, fontSize: 10, opacity: 0.6 }}>Powered by Whatsbook</p>
      </div>
    </div>
  );
}
