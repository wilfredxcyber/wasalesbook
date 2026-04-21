import { useState, useEffect, Component, ReactNode } from 'react';
import { BottomNav } from './components/BottomNav';

// ── Global Error Boundary ─────────────────────────────────────────────────────
export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h1>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            An unexpected error occurred. Your data is safe. Try refreshing the page.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            className="px-6 py-3 bg-[#21A354] text-white font-bold rounded-xl shadow active:scale-95 transition-transform"
          >
            Reload App
          </button>
          {this.state.error && (
            <details className="mt-4 text-left max-w-sm w-full">
              <summary className="text-xs text-slate-400 cursor-pointer">Technical details</summary>
              <pre className="text-[10px] text-red-500 bg-red-50 p-3 rounded-lg mt-2 overflow-auto">{this.state.error.message}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

import { Toast } from './components/Toast';
import { Dashboard } from './screens/Dashboard';
import { OrdersList } from './screens/OrdersList';
import { Directory } from './screens/Directory';
import { Settings } from './screens/Settings';
import { NewOrder } from './screens/NewOrder';
import { OrderDetails } from './screens/OrderDetails';
import { OrderStatus } from './screens/OrderStatus';
import { DailySummary } from './screens/DailySummary';
import { Landing } from './screens/Landing';
import { Login } from './screens/Login';
import { ProductCatalogue } from './screens/ProductCatalogue';
import { ReceiptDesignScreen } from './screens/ReceiptDesignScreen';
import { StorefrontPreview } from './screens/StorefrontPreview';
import { PublicStore } from './screens/PublicStore';
import { useAuth } from './store/useAuth';
import { useSupabaseOrders } from './store/useSupabaseOrders';
import { useSupabaseCatalogue } from './store/useSupabaseCatalogue';
import { useSupabaseProfile } from './store/useSupabaseProfile';
import { Order } from './store/types';

export type View = 'dashboard' | 'directory' | 'settings' | 'orders' | 'new_order' | 'order_details' | 'order_status' | 'daily_summary' | 'product_catalogue' | 'receipt_design' | 'storefront_preview';

export default function App() {
  const { user, loading: authLoading, signIn, signUp, verifyOtp, resendOtp, signOut, requestPasswordReset, verifyResetOtp, updateUserPassword } = useAuth();

  // Force light mode by removing dark class and clearing storage
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [publicStoreId, setPublicStoreId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [initialSearch, setInitialSearch] = useState<string>('');
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);

  const userId = user?.id;
  const userEmail = user?.email;

  const { orders, addOrder, updateOrder, deleteOrder, getDailySummary } = useSupabaseOrders(userId);
  const { profile, updateProfile } = useSupabaseProfile(userId, userEmail);
  const { catalogue, addProduct, updateProduct, deleteProduct } = useSupabaseCatalogue(userId);

  const handleViewChange = (view: string, idOrQuery?: string) => {
    setCurrentView(view as View);
    if (view === 'orders' && idOrQuery) {
      setInitialSearch(idOrQuery);
    } else if (idOrQuery) {
      setSelectedOrderId(idOrQuery);
    } else {
      setInitialSearch('');
    }
  };

  const handleLogin = async (email: string, password: string, isSignUp: boolean): Promise<string | null> => {
    if (!isSignUp) {
      const error = await signIn(email, password);
      return error ? error.message : null;
    }
    const { error, userCreated, sessionActive } = await signUp(email, password);
    
    // If there is no error and the session is active, auto-login was successful
    if (!error && sessionActive) return null; 
    
    // If there is no error but no session, Supabase is waiting for email confirmation
    if (!error && !sessionActive) return '__REQUIRE_OTP__';

    // Signup failed with an error, but user account might've been created if SMTP failed
    if (userCreated) {
      return `__SMTP_WARN__${error?.message || 'Email delivery failed'}`;
    }
    
    // Standard error
    return error?.message || 'Signup failed';
  };

  const handleVerifyOtp = async (email: string, token: string): Promise<string | null> => {
    const error = await verifyOtp(email, token);
    return error ? error.message : null;
  };

  const handleResendOtp = async (email: string): Promise<string | null> => {
    const error = await resendOtp(email);
    return error ? error.message : null;
  };

  const handleRequestPasswordReset = async (email: string): Promise<string | null> => {
    const error = await requestPasswordReset(email);
    return error ? error.message : null;
  };

  const handleVerifyResetOtp = async (email: string, token: string): Promise<string | null> => {
    const error = await verifyResetOtp(email, token);
    return error ? error.message : null;
  };

  const handleUpdatePassword = async (password: string): Promise<string | null> => {
    const error = await updateUserPassword(password);
    return error ? error.message : null;
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentView('dashboard');
  };

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const [showLanding, setShowLanding] = useState(true);

  const selectedOrder = orders.find(o => o.id === selectedOrderId) ?? null;

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/store/')) {
        const sid = hash.replace('#/store/', '');
        if (sid) setPublicStoreId(sid);
      } else {
        setPublicStoreId(null);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (publicStoreId) {
    return <PublicStore storeId={publicStoreId} />;
  }

  // Show spinner while Supabase session is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-medium text-on-surface-variant">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showLanding) {
      return <Landing onGetStarted={() => setShowLanding(false)} />;
    }

    return (
      <Login 
        onLogin={handleLogin} 
        onVerifyOtp={handleVerifyOtp} 
        onResendOtp={handleResendOtp}
        onRequestPasswordReset={handleRequestPasswordReset}
        onVerifyResetOtp={handleVerifyResetOtp}
        onUpdatePassword={handleUpdatePassword}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'dashboard' && (
        <Dashboard
          orders={orders}
          profile={profile}
          onViewChange={handleViewChange}
          showToast={showToast}
          updateOrder={updateOrder}
        />
      )}
      {currentView === 'directory' && (
        <Directory orders={orders} onViewChange={handleViewChange} showToast={showToast} />
      )}
      {currentView === 'settings' && (
        <Settings profile={profile} updateProfile={updateProfile} onViewChange={handleViewChange} showToast={showToast} onSignOut={handleSignOut} />
      )}
      {currentView === 'orders' && (
        <OrdersList orders={orders} profile={profile} updateOrder={updateOrder} onViewChange={handleViewChange} showToast={showToast} initialSearch={initialSearch} />
      )}
      {currentView === 'new_order' && (
        <NewOrder
          profile={profile}
          catalogue={catalogue}
          onViewChange={handleViewChange}
          showToast={showToast}
          addOrder={async (order) => {
            const created = await addOrder(order);
            setLastCreatedOrder(created);
            return created;
          }}
        />
      )}
      {currentView === 'order_details' && selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          profile={profile}
          updateOrder={updateOrder}
          deleteOrder={async (id) => { await deleteOrder(id); handleViewChange('dashboard'); }}
          onViewChange={handleViewChange}
          showToast={showToast}
        />
      )}
      {currentView === 'order_status' && (
        <OrderStatus order={lastCreatedOrder} profile={profile} onViewChange={handleViewChange} showToast={showToast} />
      )}
      {currentView === 'daily_summary' && (
        <DailySummary summary={getDailySummary()} orders={orders} onViewChange={handleViewChange} showToast={showToast} />
      )}
      {currentView === 'product_catalogue' && (
        <ProductCatalogue
          catalogue={catalogue}
          addProduct={addProduct}
          updateProduct={updateProduct}
          deleteProduct={deleteProduct}
          currencySymbol={profile.currencySymbol}
          onViewChange={handleViewChange}
          showToast={showToast}
        />
      )}
      {currentView === 'receipt_design' && (
        <ReceiptDesignScreen
          profile={profile}
          updateProfile={updateProfile}
          onViewChange={handleViewChange}
          showToast={showToast}
        />
      )}

      {currentView === 'storefront_preview' && (
        <StorefrontPreview 
          profile={profile} 
          catalogue={catalogue} 
          storeId={user.id}
          updateProfile={updateProfile}
          onViewChange={handleViewChange} 
        />
      )}

      {['dashboard', 'directory', 'settings', 'orders', 'new_order', 'order_details', 'order_status', 'daily_summary', 'product_catalogue', 'receipt_design'].includes(currentView) && (
        <BottomNav activeTab={currentView} onTabChange={handleViewChange} />
      )}

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}
