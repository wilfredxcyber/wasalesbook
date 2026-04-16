import React, { useState, useRef } from 'react';
import { CatalogueProduct } from '../store/types';

interface ProductCatalogueProps {
  catalogue: CatalogueProduct[];
  addProduct: (p: Omit<CatalogueProduct, 'id' | 'createdAt'>) => Promise<CatalogueProduct>;
  updateProduct: (id: string, patch: Partial<CatalogueProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  currencySymbol: string;
  onViewChange: (view: string) => void;
  showToast: (msg: string) => void;
}

const CATEGORIES = ['All', 'Fashion', 'Food & Drinks', 'Beauty', 'Electronics', 'Home & Living', 'Art & Crafts', 'Other'];

const emptyForm = { name: '', price: '', category: 'Other', description: '', imageUrl: '' };

export function ProductCatalogue({
  catalogue,
  addProduct,
  updateProduct,
  deleteProduct,
  currencySymbol,
  onViewChange,
  showToast,
}: ProductCatalogueProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [previewImg, setPreviewImg] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = catalogue.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openAdd = () => {
    setForm(emptyForm);
    setPreviewImg('');
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (p: CatalogueProduct) => {
    setForm({ name: p.name, price: String(p.price), category: p.category, description: p.description, imageUrl: p.imageUrl || '' });
    setPreviewImg(p.imageUrl || '');
    setEditingId(p.id);
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as string;
      setPreviewImg(result);
      setForm(f => ({ ...f, imageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { showToast('Product name is required'); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) { showToast('Enter a valid price'); return; }

    setSaving(true);
    try {
      if (editingId) {
        await updateProduct(editingId, {
          name: form.name.trim(),
          price,
          category: form.category,
          description: form.description.trim(),
          imageUrl: form.imageUrl || undefined,
        });
        showToast('Product updated!');
      } else {
        await addProduct({
          name: form.name.trim(),
          price,
          category: form.category,
          description: form.description.trim(),
          imageUrl: form.imageUrl || undefined,
        });
        showToast('Product added to catalogue!');
      }
      setShowModal(false);
    } catch {
      showToast('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setConfirmDelete(null);
      showToast('Product removed');
    } catch {
      showToast('Failed to delete product.');
    }
  };

  return (
    <div className="bg-background min-h-screen pb-28">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <div className="flex flex-col">
            <div className="flex items-center text-xs font-semibold tracking-wide text-slate-500 mb-0.5">
              <button onClick={() => onViewChange('settings')} className="hover:text-primary transition-colors flex items-center gap-1 active:scale-95">
                <span className="material-symbols-outlined text-[14px]">person</span>
                Profile
              </button>
              <span className="material-symbols-outlined mx-0.5 text-[14px] text-slate-300">chevron_right</span>
              <span className="text-slate-800">Catalogue</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{catalogue.length} item{catalogue.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl active:scale-95 transition-transform shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add
          </button>
        </div>
        <div className="bg-slate-100 h-px w-full" />
      </header>

      <main className="pt-[72px] max-w-2xl mx-auto px-4 space-y-4">
        {/* Search Bar */}
        <div className="relative mt-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input
            className="w-full bg-surface-container-low border-0 rounded-2xl pl-10 pr-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition-all"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-md scale-[1.02]'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-primary-container">inventory_2</span>
            </div>
            <p className="text-base font-bold text-on-surface">{catalogue.length === 0 ? 'No products yet' : 'No results found'}</p>
            <p className="text-sm text-on-surface-variant mt-1 max-w-[220px]">
              {catalogue.length === 0
                ? 'Tap "Add" to build your product catalogue'
                : 'Try a different search or category'}
            </p>
            {catalogue.length === 0 && (
              <button
                onClick={openAdd}
                className="mt-6 px-6 py-3 bg-primary text-white font-bold rounded-xl active:scale-95 transition-transform shadow-lg"
              >
                Add First Product
              </button>
            )}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          {filtered.map(product => (
            <div
              key={product.id}
              className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_16px_rgba(12,30,38,0.07)] overflow-hidden flex flex-col group relative"
            >
              {/* Image */}
              <div className="relative h-36 bg-gradient-to-br from-primary-container/30 to-secondary-container/20 flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-5xl text-primary-container/60">image</span>
                )}
                {/* Category badge */}
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/30 backdrop-blur-sm text-white text-[9px] font-bold rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
                {/* Action overlay - Visible on hover or always on mobile touch */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(product)}
                    className="w-7 h-7 bg-white/95 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[14px] text-slate-700">edit</span>
                  </button>
                  <button
                    onClick={() => setConfirmDelete(product.id)}
                    className="w-7 h-7 bg-white/95 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[14px] text-error">delete</span>
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col flex-1">
                <p className="font-bold text-on-surface text-sm leading-tight line-clamp-2">{product.name}</p>
                {product.description && (
                  <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
                )}
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="text-base font-extrabold text-primary">
                    {currencySymbol}{product.price.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <button
                    onClick={() => openEdit(product)}
                    className="text-[10px] font-bold text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 sticky top-0 bg-white rounded-t-3xl z-10">
              <h2 className="font-bold text-slate-900 text-lg">{editingId ? 'Edit Product' : 'New Product'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-500">close</span>
              </button>
            </div>

            <div className="px-5 pb-8 space-y-5">
              {/* Image Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative h-36 rounded-2xl bg-gradient-to-br from-primary-container/20 to-secondary-container/10 border-2 border-dashed border-primary-container/40 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-primary transition-colors"
              >
                {previewImg ? (
                  <img src={previewImg} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-primary-container">
                    <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Tap to add photo</span>
                  </div>
                )}
                {previewImg && (
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Change Photo</span>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>

              {/* Name */}
              <div className="space-y-1 group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block group-focus-within:text-primary transition-colors">
                  Product Name *
                </label>
                <input
                  className="w-full bg-transparent border-b border-slate-200 focus:border-primary px-0 py-2 text-on-surface font-medium outline-none transition-all"
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Handmade Ceramic Mug"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 group">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block group-focus-within:text-primary transition-colors">
                    Price *
                  </label>
                  <div className="flex items-center border-b border-slate-200 focus-within:border-primary transition-colors">
                    <span className="text-slate-400 text-sm pr-1">{currencySymbol}</span>
                    <input
                      className="flex-1 bg-transparent px-0 py-2 text-on-surface font-medium outline-none"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-1 group">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block group-focus-within:text-primary transition-colors">
                    Category
                  </label>
                  <select
                    className="w-full bg-transparent border-b border-slate-200 focus:border-primary py-2 text-on-surface font-medium outline-none appearance-none transition-all"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block group-focus-within:text-primary transition-colors">
                  Description
                </label>
                <textarea
                  className="w-full bg-surface-container-low border border-slate-100 focus:border-primary rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none transition-all resize-none mt-1"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Short description of this product…"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined">{editingId ? 'save' : 'add_circle'}</span>
                )}
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add to Catalogue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-error">delete_forever</span>
            </div>
            <p className="text-center font-bold text-slate-900 text-base">Remove Product?</p>
            <p className="text-center text-sm text-slate-500 mt-1">This will permanently delete this item from your catalogue.</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 bg-surface-container-high text-on-surface font-bold rounded-xl active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-3 bg-error text-white font-bold rounded-xl active:scale-95 transition-transform"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
