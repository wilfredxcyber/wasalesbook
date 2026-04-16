import { useState, useEffect, useCallback } from 'react';
import { supabase, DbProfile } from '../lib/supabase';
import { BusinessProfile } from './types';

const DEFAULT_PROFILE: BusinessProfile = {
  userName: '',
  email: '',
  currencySymbol: '₦',
  predefinedProducts: [],
  paymentDetails: '',
  notifications: true,
};

function toAppProfile(row: DbProfile): BusinessProfile {
  return {
    userName: row.user_name,
    email: row.email,
    currencySymbol: row.currency_symbol,
    predefinedProducts: row.predefined_products,
    paymentDetails: row.payment_details,
    notifications: row.notifications,
    logoUrl: row.logo_url ?? undefined,
    isStorefrontPublished: row.is_storefront_published ?? false,
    storefrontContactLink: row.storefront_contact_link ?? undefined,
    receiptDesign: row.receipt_design ?? undefined,
  };
}

export function useSupabaseProfile(userId: string | undefined, userEmail: string | undefined) {
  const [profile, setProfile] = useState<BusinessProfile>(DEFAULT_PROFILE);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setProfile(toAppProfile(data as DbProfile));
      } else {
        // Auto-create a row the first time this user logs in
        const newRow = {
          id: userId,
          user_name: '',
          email: userEmail ?? '',
          currency_symbol: '₦',
          predefined_products: [],
          payment_details: '',
          notifications: true,
          logo_url: null,
          is_storefront_published: false,
          storefront_contact_link: null,
          receipt_design: null,
        };
        const { data: created, error: createErr } = await supabase
          .from('profiles')
          .insert([newRow])
          .select()
          .single();
        if (created) setProfile(toAppProfile(created as DbProfile));
        else if (createErr) console.error('[Profile] create error:', createErr.message);
      }
    } catch (err) {
      console.error('[Profile] unexpected fetch error:', err);
    }
  }, [userId, userEmail]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (patch: Partial<BusinessProfile>) => {
    if (!userId) return;
    const dbPatch: Partial<DbProfile> = {};
    if (patch.userName !== undefined) dbPatch.user_name = patch.userName;
    if (patch.email !== undefined) dbPatch.email = patch.email;
    if (patch.currencySymbol !== undefined) dbPatch.currency_symbol = patch.currencySymbol;
    if (patch.predefinedProducts !== undefined) dbPatch.predefined_products = patch.predefinedProducts;
    if (patch.paymentDetails !== undefined) dbPatch.payment_details = patch.paymentDetails;
    if (patch.notifications !== undefined) dbPatch.notifications = patch.notifications;
    if (patch.logoUrl !== undefined) dbPatch.logo_url = patch.logoUrl ?? null;
    if (patch.isStorefrontPublished !== undefined) dbPatch.is_storefront_published = patch.isStorefrontPublished;
    if (patch.storefrontContactLink !== undefined) dbPatch.storefront_contact_link = patch.storefrontContactLink ?? null;
    if (patch.receiptDesign !== undefined) dbPatch.receipt_design = patch.receiptDesign ?? null;

    const { error } = await supabase.from('profiles').update(dbPatch).eq('id', userId);
    if (error) {
      console.error('[Profile] update error:', error.message, error.details);
      // We still update local state for optimistic UI, but the user should know it failed
    }
    setProfile(prev => ({ ...prev, ...patch }));
  };

  return { profile, updateProfile };
}
