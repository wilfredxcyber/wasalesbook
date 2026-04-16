import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing environment variables. Check your .env file or Vercel Environment Variables.');
}

// Provide a dummy URL to prevent `createClient` from throwing a fatal Error on module load.
export const supabase = createClient(
  supabaseUrl || 'https://dummy.supabase.co',
  supabaseAnonKey || 'dummy-key'
);

// -- Database row types matching Supabase tables --

export interface DbOrder {
  id: string;
  user_id: string;
  customer_name: string;
  product: string;
  amount: number;
  payment_status: 'Unpaid' | 'Paid';
  delivery_status: 'Pending' | 'Delivered';
  notes: string;
  phone: string | null;
  image_url: string | null;
  created_at: string;
}

export interface DbProduct {
  id: string;
  user_id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image_url: string | null;
  created_at: string;
}

export interface DbProfile {
  id: string;                  // same as auth user id
  user_name: string;
  email: string;
  currency_symbol: string;
  predefined_products: string[];
  payment_details: string;
  notifications: boolean;
  logo_url: string | null;
  is_storefront_published: boolean;
  storefront_contact_link: string | null;
  receipt_design: any | null;
}
