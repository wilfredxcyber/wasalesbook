import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    return error;
  };

  const signUp = async (email: string, password: string): Promise<{ error: Error | null; userCreated: boolean }> => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) setAuthError(error.message);
    // data.user is non-null when the account was created even if email delivery failed
    return { error: error as Error | null, userCreated: !!data?.user };
  };

  const verifyOtp = async (email: string, token: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
    if (error) setAuthError(error.message);
    return error;
  };

  const resendOtp = async (email: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) setAuthError(error.message);
    return error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const requestPasswordReset = async (email: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setAuthError(error.message);
    return error;
  };

  const verifyResetOtp = async (email: string, token: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
    if (error) setAuthError(error.message);
    return error;
  };

  const updateUserPassword = async (password: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setAuthError(error.message);
    return error;
  };

  return { session, user, loading, authError, signIn, signUp, verifyOtp, resendOtp, signOut, requestPasswordReset, verifyResetOtp, updateUserPassword };
}
