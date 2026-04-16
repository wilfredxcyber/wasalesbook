import { useState, useEffect } from 'react';
import { Order, DailySummary, BusinessProfile, CatalogueProduct } from './types';

const STORAGE_KEY = 'salesbook_orders';
const PROFILE_KEY = 'salesbook_profile';

const DEFAULT_PROFILE: BusinessProfile = {
  userName: '',
  email: '',
  currencySymbol: '₦',
  predefinedProducts: [],
  paymentDetails: '',
  notifications: true,
};

function loadProfile(): BusinessProfile {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

function saveProfile(profile: BusinessProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function useProfile() {
  const [profile, setProfile] = useState<BusinessProfile>(loadProfile);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  const updateProfile = (patch: Partial<BusinessProfile>) => {
    setProfile(prev => ({ ...prev, ...patch }));
  };

  return { profile, updateProfile };
}

function loadOrders(): Order[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(loadOrders);

  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  const addOrder = (order: Omit<Order, 'id' | 'createdAt'>): Order => {
    const newOrder: Order = {
      ...order,
      id: `ORD-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrder = (id: string, patch: Partial<Order>): void => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, ...patch } : o))
    );
  };

  const deleteOrder = (id: string): void => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const getDailySummary = (): DailySummary => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(
      o => new Date(o.createdAt).toDateString() === today
    );
    const totalRevenue = todayOrders.reduce((sum, o) => sum + o.amount, 0);
    const totalCollected = todayOrders
      .filter(o => o.paymentStatus === 'Paid')
      .reduce((sum, o) => sum + o.amount, 0);

    return {
      totalOrders: todayOrders.length,
      totalRevenue,
      totalCollected,
      totalOwed: totalRevenue - totalCollected,
      pendingDelivery: todayOrders.filter(o => o.deliveryStatus === 'Pending').length,
      delivered: todayOrders.filter(o => o.deliveryStatus === 'Delivered').length,
    };
  };

  return { orders, addOrder, updateOrder, deleteOrder, getDailySummary };
}

const CATALOGUE_KEY = 'salesbook_catalogue';

function loadCatalogue(): CatalogueProduct[] {
  try {
    const data = localStorage.getItem(CATALOGUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCatalogue(products: CatalogueProduct[]): void {
  localStorage.setItem(CATALOGUE_KEY, JSON.stringify(products));
}

export function useCatalogue() {
  const [catalogue, setCatalogue] = useState<CatalogueProduct[]>(loadCatalogue);

  useEffect(() => {
    saveCatalogue(catalogue);
  }, [catalogue]);

  const addProduct = (product: Omit<CatalogueProduct, 'id' | 'createdAt'>): CatalogueProduct => {
    const newProduct: CatalogueProduct = {
      ...product,
      id: `PROD-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCatalogue(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, patch: Partial<CatalogueProduct>): void => {
    setCatalogue(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
  };

  const deleteProduct = (id: string): void => {
    setCatalogue(prev => prev.filter(p => p.id !== id));
  };

  return { catalogue, addProduct, updateProduct, deleteProduct };
}
