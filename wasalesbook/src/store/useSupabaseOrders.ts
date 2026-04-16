import { useState, useEffect, useCallback } from 'react';
import { supabase, DbOrder } from '../lib/supabase';
import { Order, DailySummary } from './types';

function toAppOrder(row: DbOrder): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    product: row.product,
    amount: row.amount,
    paymentStatus: row.payment_status,
    deliveryStatus: row.delivery_status,
    notes: row.notes,
    phone: row.phone ?? undefined,
    imageUrl: row.image_url ?? undefined,
    createdAt: row.created_at,
  };
}

export function useSupabaseOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) setOrders(data.map(toAppOrder));
      else if (error) console.error('[Orders] fetch error:', error.message);
    } catch (err) {
      console.error('[Orders] unexpected fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    if (!userId) throw new Error('Not authenticated');
    const row = {
      user_id: userId,
      customer_name: order.customerName,
      product: order.product,
      amount: order.amount,
      payment_status: order.paymentStatus,
      delivery_status: order.deliveryStatus,
      notes: order.notes,
      phone: order.phone ?? null,
      image_url: order.imageUrl ?? null,
    };
    const { data, error } = await supabase.from('orders').insert([row]).select().single();
    if (error || !data) throw new Error(error?.message ?? 'Failed to create order');
    const newOrder = toAppOrder(data as DbOrder);
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrder = async (id: string, patch: Partial<Order>) => {
    if (!userId) return;
    const dbPatch: Partial<DbOrder> = {};
    if (patch.customerName !== undefined) dbPatch.customer_name = patch.customerName;
    if (patch.product !== undefined) dbPatch.product = patch.product;
    if (patch.amount !== undefined) dbPatch.amount = patch.amount;
    if (patch.paymentStatus !== undefined) dbPatch.payment_status = patch.paymentStatus;
    if (patch.deliveryStatus !== undefined) dbPatch.delivery_status = patch.deliveryStatus;
    if (patch.notes !== undefined) dbPatch.notes = patch.notes;
    if (patch.phone !== undefined) dbPatch.phone = patch.phone ?? null;
    if (patch.imageUrl !== undefined) dbPatch.image_url = patch.imageUrl ?? null;

    // Optimistic update first, then persist
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, ...patch } : o)));
    const { error } = await supabase.from('orders').update(dbPatch).eq('id', id).eq('user_id', userId);
    if (error) console.error('[Orders] update error:', error.message);
  };

  const deleteOrder = async (id: string) => {
    if (!userId) return;
    // Optimistic delete
    setOrders(prev => prev.filter(o => o.id !== id));
    const { error } = await supabase.from('orders').delete().eq('id', id).eq('user_id', userId);
    if (error) {
      console.error('[Orders] delete error:', error.message);
      // Re-fetch to restore correct state on failure
      fetchOrders();
    }
  };

  const getDailySummary = (): DailySummary => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
    const totalRevenue = todayOrders.reduce((s, o) => s + o.amount, 0);
    const totalCollected = todayOrders.filter(o => o.paymentStatus === 'Paid').reduce((s, o) => s + o.amount, 0);
    return {
      totalOrders: todayOrders.length,
      totalRevenue,
      totalCollected,
      totalOwed: totalRevenue - totalCollected,
      pendingDelivery: todayOrders.filter(o => o.deliveryStatus === 'Pending').length,
      delivered: todayOrders.filter(o => o.deliveryStatus === 'Delivered').length,
    };
  };

  return { orders, loading, addOrder, updateOrder, deleteOrder, getDailySummary };
}
