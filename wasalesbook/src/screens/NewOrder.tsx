import { useState, ChangeEvent } from 'react';
import { Order, BusinessProfile, CatalogueProduct } from '../store/types';
import { supabase } from '../lib/supabase';

interface NewOrderProps {
  profile: BusinessProfile;
  catalogue: CatalogueProduct[];
  onViewChange: (view: string, orderId?: string) => void;
  showToast: (msg: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<Order>;
}

export function NewOrder({ profile, catalogue, onViewChange, showToast, addOrder }: NewOrderProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Catalogue picker state
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [catCategory, setCatCategory] = useState('All');

  const catCategories = ['All', ...Array.from(new Set(catalogue.map(p => p.category)))];

  const filteredCatalogue = catalogue.filter(p => {
    const matchCat = catCategory === 'All' || p.category === catCategory;
    const matchSearch = p.name.toLowerCase().includes(catSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const pickCatalogueItem = (p: CatalogueProduct) => {
    setProduct(prev => prev ? `${prev}, ${p.name}` : p.name);
    setAmount(String(p.price));
    setShowCatPicker(false);
    showToast(`"${p.name}" added — price auto-filled`);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [smartPasteText, setSmartPasteText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [smartPasteExpanded, setSmartPasteExpanded] = useState(false);

  const handleExtract = async () => {
    if (!smartPasteText.trim()) {
      showToast('Please paste some text first');
      return;
    }
    setIsExtracting(true);
    showToast('Extracting data with AI...');
    try {
      const { data: response, error } = await supabase.functions.invoke('openai-proxy', {
        body: {
          model: 'gemini-2.0-flash',
          contents: `Extract order details from this WhatsApp message. Return a JSON object with keys: customerName (string), product (string, what was ordered), amount (number, the total price), notes (string, any extra context). If a field is not mentioned, use an empty string or 0. Message: ${smartPasteText}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: "OBJECT",
              properties: {
                customerName: { type: "STRING" },
                product: { type: "STRING" },
                amount: { type: "NUMBER" },
                notes: { type: "STRING" },
              },
            },
          },
        }
      });
      
      if (error) throw error;
      const data = JSON.parse(response.text || '{}');
      if (data.customerName) setCustomerName(data.customerName);
      if (data.product) setProduct(data.product);
      if (data.amount) setAmount(data.amount.toString());
      if (data.notes) setNotes(data.notes);

      showToast('✓ Data extracted successfully');
    } catch (error) {
      console.error(error);
      showToast('Failed to extract — please fill in manually');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleScanExtract = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // reset input so same file can be selected again
    e.target.value = '';

    setIsExtracting(true);
    showToast('Analyzing image with AI...');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        const base64String = result.split(',')[1];
        
        try {
          const { data: response, error } = await supabase.functions.invoke('openai-proxy', {
            body: {
              model: 'gemini-2.0-flash',
              contents: [
                "Extract order details from this image of a handwritten or physical record book. Return a JSON object with keys: customerName (string), product (string, what was ordered), amount (number, the total price), notes (string, any extra context). If a field is not mentioned, use an empty string or 0.",
                {
                  inlineData: {
                    data: base64String,
                    mimeType: file.type
                  }
                }
              ],
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: "OBJECT",
                  properties: {
                    customerName: { type: "STRING" },
                    product: { type: "STRING" },
                    amount: { type: "NUMBER" },
                    notes: { type: "STRING" },
                  },
                },
              },
            }
          });
          
          if (error) throw error;
          const data = JSON.parse(response.text || '{}');
          if (data.customerName) setCustomerName(data.customerName);
          if (data.product) setProduct(data.product);
          if (data.amount) setAmount(data.amount.toString());
          if (data.notes) setNotes(data.notes);

          showToast('✓ Record scanned successfully');
        } catch (error) {
          console.error(error);
          showToast('Failed to extract from image — please fill manually');
        } finally {
          setIsExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
       console.error(error);
       setIsExtracting(false);
       showToast('Failed to process image');
    }
  };

  const handleSaveOrder = async () => {
    if (!customerName.trim()) { showToast('Customer name cannot be empty'); return; }
    if (!product.trim()) { showToast('Product description cannot be empty'); return; }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) { showToast('Enter a valid amount (0 or more)'); return; }

    setIsSaving(true);
    try {
      await addOrder({
        customerName: customerName.trim(),
        phone: phone.trim() || undefined,
        product: product.trim(),
        amount: parsedAmount,
        notes: notes.trim(),
        paymentStatus: 'Unpaid',
        deliveryStatus: 'Pending',
        imageUrl: imageUrl || undefined,
      });
      showToast('Order saved!');
      onViewChange('order_status');
    } catch {
      showToast('Failed to save order. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-background min-h-screen pb-32">
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-4 py-3 w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => onViewChange('dashboard')} className="p-2 -ml-2 rounded-full hover:bg-slate-100/50 transition-colors active:scale-95">
              <span className="material-symbols-outlined text-slate-900">arrow_back</span>
            </button>
            <h1 className="font-semibold tracking-tight text-slate-900 text-lg">New Order</h1>
          </div>
          <span className="text-[10px] bg-secondary-container text-secondary px-2 py-0.5 rounded-full font-semibold">AI POWERED</span>
        </div>
        <div className="bg-slate-100 h-[1px] w-full"></div>
      </header>

      <main className="pt-20 pb-36 px-4 max-w-2xl mx-auto space-y-6">
        {/* Smart Paste */}
        <section className="bg-surface-container-lowest p-5 rounded-2xl shadow-[0_8px_32px_rgba(12,30,38,0.06)] border border-primary/10">
          <div 
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setSmartPasteExpanded(!smartPasteExpanded)}
          >
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                AI Smart Paste
                <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">New</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Let AI fill out this form for you</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <span className={`material-symbols-outlined text-slate-500 transition-transform ${smartPasteExpanded ? 'rotate-180' : ''}`}>keyboard_arrow_down</span>
            </div>
          </div>

          {smartPasteExpanded && (
            <div className="mt-4 pt-4 border-t border-slate-100 animate-slide-up">
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                <strong className="text-slate-700">How it works:</strong> Snap a picture of your physical record book, OR paste a WhatsApp message below.
              </p>
              
              <label className={`w-full flex items-center justify-center gap-3 p-4 mb-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors ${isExtracting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}`}>
                <span className="material-symbols-outlined text-3xl text-primary">document_scanner</span>
                <div className="text-left">
                  <span className="block text-sm font-extrabold text-slate-800">Scan Physical Record</span>
                  <span className="block text-[10px] text-slate-500 font-medium mt-0.5">Take photo or upload image</span>
                </div>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScanExtract} disabled={isExtracting} />
              </label>

              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Or Paste Text</span>
                </div>
                <textarea
                  value={smartPasteText}
                  onChange={(e) => setSmartPasteText(e.target.value)}
                  className="w-full min-h-[100px] p-4 bg-surface-container-low rounded-xl border-none focus:ring-primary focus:ring-2 transition-all resize-none text-sm text-on-surface outline-none"
                  placeholder="Paste WhatsApp message here..."
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleExtract}
                    disabled={isExtracting || !smartPasteText.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isExtracting ? 'hourglass_empty' : 'auto_awesome'}
                    </span>
                    {isExtracting ? 'Extracting...' : 'Auto-Fill Form'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Manual Fields */}
        <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-[0_8px_32px_rgba(12,30,38,0.06)] space-y-6">
          <div className="space-y-1 group">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block group-focus-within:text-primary transition-colors">Customer Name *</label>
            <input
              className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary px-0 py-2 text-on-surface font-medium outline-none transition-all"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Ada Johnson"
            />
          </div>

          <div className="space-y-1 group">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block group-focus-within:text-primary transition-colors">Phone Number (Optional for WA Receipt)</label>
            <input
              className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary px-0 py-2 text-on-surface font-medium outline-none transition-all"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 2348012345678"
            />
          </div>

          <div className="space-y-1 group relative">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block group-focus-within:text-primary transition-colors">Product / Order Description *</label>
            <div className="flex items-end gap-2">
              <input
                className="flex-1 bg-transparent border-b border-outline-variant/40 focus:border-primary px-0 py-2 text-on-surface font-medium outline-none transition-all"
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g. 2 bags of rice"
              />
              {catalogue.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setShowCatPicker(true); setCatSearch(''); setCatCategory('All'); }}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-primary-container/30 text-primary text-[11px] font-bold rounded-lg hover:bg-primary-container/50 active:scale-95 transition-all whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                  Browse
                </button>
              )}
            </div>
            {profile.predefinedProducts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.predefinedProducts.map(p => (
                  <button
                    key={p}
                    onClick={() => setProduct(prev => prev ? `${prev}, ${p}` : p)}
                    className="px-3 py-1 bg-surface-container-high hover:bg-surface-container-highest text-xs font-semibold text-on-surface-variant rounded-full active:scale-95 transition-all"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1 group">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block group-focus-within:text-primary transition-colors">Amount ({profile.currencySymbol})</label>
            <input
              className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary px-0 py-2 text-on-surface font-medium outline-none transition-all"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-1 group">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block group-focus-within:text-primary transition-colors">Attach Image/File (optional)</label>
            <input
              className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary px-0 py-2 text-on-surface font-medium outline-none transition-all file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-surface-container-high file:text-on-surface-variant hover:file:bg-surface-container-highest"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imageUrl && (
              <img src={imageUrl} alt="Preview" className="h-20 w-20 object-cover mt-2 rounded-xl border border-outline-variant/20 shadow-sm" />
            )}
          </div>

          <div className="space-y-1 group">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block group-focus-within:text-primary transition-colors">Notes (optional)</label>
            <input
              className="w-full bg-transparent border-b border-outline-variant/40 focus:border-primary px-0 py-2 text-on-surface font-medium outline-none transition-all"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Deliver before 3pm, fragile package"
            />
          </div>
        </section>
      </main>

      <div className="fixed bottom-20 left-0 w-full p-4 bg-gradient-to-t from-background via-background to-transparent z-40">
        <button
          onClick={handleSaveOrder}
          disabled={isSaving}
          className="w-full max-w-2xl mx-auto block bg-primary text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isSaving ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined">save</span>
          )}
          {isSaving ? 'Saving…' : 'Save Order'}
        </button>
      </div>

      {/* Catalogue Picker Modal */}
      {showCatPicker && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCatPicker(false); }}
        >
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl animate-modal-in flex flex-col" style={{ maxHeight: '78vh' }}>
            {/* Picker Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
              <div>
                <h2 className="font-bold text-slate-900 text-lg leading-tight">Pick from Catalogue</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{catalogue.length} product{catalogue.length !== 1 ? 's' : ''} saved</p>
              </div>
              <button
                onClick={() => setShowCatPicker(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-500">close</span>
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pb-2 shrink-0">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input
                  className="w-full bg-slate-50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="Search products…"
                  value={catSearch}
                  onChange={e => setCatSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Category pills */}
            {catCategories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto px-5 pb-3 hide-scrollbar shrink-0">
                {catCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCatCategory(cat)}
                    className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                      catCategory === cat
                        ? 'bg-primary text-white shadow'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Product List */}
            <div className="overflow-y-auto px-5 pb-6 flex-1">
              {filteredCatalogue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300">inventory_2</span>
                  <p className="text-sm font-bold text-slate-400 mt-2">No products found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCatalogue.map(p => (
                    <button
                      key={p.id}
                      onClick={() => pickCatalogueItem(p)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-primary-container/20 active:scale-[0.98] transition-all text-left group"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-container/30 to-secondary-container/20 flex items-center justify-center overflow-hidden shrink-0">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-2xl text-primary-container/60">image</span>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{p.name}</p>
                        {p.description && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{p.description}</p>
                        )}
                        <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1 inline-block">{p.category}</span>
                      </div>
                      {/* Price */}
                      <div className="text-right shrink-0">
                        <p className="font-extrabold text-primary text-base">{profile.currencySymbol}{p.price.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="text-[10px] text-primary/60 font-bold group-hover:text-primary transition-colors mt-0.5">Tap to add →</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
