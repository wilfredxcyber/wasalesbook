import { useState, useEffect, useCallback } from 'react';
import { supabase, DbProduct } from '../lib/supabase';
import { CatalogueProduct } from './types';

function toAppProduct(row: DbProduct): CatalogueProduct {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    category: row.category,
    description: row.description,
    imageUrl: row.image_url ?? undefined,
    createdAt: row.created_at,
  };
}

export function useSupabaseCatalogue(userId: string | undefined) {
  const [catalogue, setCatalogue] = useState<CatalogueProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCatalogue = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) setCatalogue(data.map(toAppProduct));
      else if (error) console.error('[Catalogue] fetch error:', error.message);
    } catch (err) {
      console.error('[Catalogue] unexpected fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCatalogue();
  }, [fetchCatalogue]);

  const addProduct = async (product: Omit<CatalogueProduct, 'id' | 'createdAt'>): Promise<CatalogueProduct> => {
    if (!userId) throw new Error('Not authenticated');
    const row = {
      user_id: userId,
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      image_url: product.imageUrl ?? null,
    };
    const { data, error } = await supabase.from('products').insert([row]).select().single();
    if (error || !data) throw new Error(error?.message ?? 'Failed to add product');
    const newProduct = toAppProduct(data as DbProduct);
    setCatalogue(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = async (id: string, patch: Partial<CatalogueProduct>) => {
    if (!userId) return;
    const dbPatch: Partial<DbProduct> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.price !== undefined) dbPatch.price = patch.price;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    if (patch.description !== undefined) dbPatch.description = patch.description;
    if (patch.imageUrl !== undefined) dbPatch.image_url = patch.imageUrl ?? null;

    setCatalogue(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
    const { error } = await supabase.from('products').update(dbPatch).eq('id', id).eq('user_id', userId);
    if (error) console.error('[Catalogue] update error:', error.message);
  };

  const deleteProduct = async (id: string) => {
    if (!userId) return;
    setCatalogue(prev => prev.filter(p => p.id !== id));
    const { error } = await supabase.from('products').delete().eq('id', id).eq('user_id', userId);
    if (error) console.error('[Catalogue] delete error:', error.message);
  };

  return { catalogue, loading, addProduct, updateProduct, deleteProduct };
}
