import { Order, BusinessProfile } from '../store/types';
import { ReceiptCard } from '../components/ReceiptCard';

interface OrderStatusProps {
  order: Order | null;
  profile: BusinessProfile;
  onViewChange: (view: string) => void;
  showToast: (msg: string) => void;
}

export function OrderStatus({ order, profile, onViewChange, showToast }: OrderStatusProps) {
  if (!order) {
    onViewChange('dashboard');
    return null;
  }

  return (
    <div className="bg-background min-h-screen pb-32">
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-4 py-3 w-full">
          <h1 className="font-semibold tracking-tight text-slate-900 text-lg">Order Saved</h1>
        </div>
        <div className="bg-slate-100 h-[1px] w-full"></div>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto space-y-6">
        {/* Success icon */}
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-3 shadow-[0_0_40px_rgba(0,109,47,0.2)]">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h2 className="text-xl font-extrabold text-on-surface tracking-tight">Order Logged!</h2>
          <p className="text-on-surface-variant text-sm mt-1">Your receipt is ready to share</p>
        </div>

        {/* Visual Receipt */}
        <ReceiptCard order={order} profile={profile} showToast={showToast} />
      </main>

      <div className="fixed bottom-20 left-0 w-full p-4 bg-gradient-to-t from-background via-background to-transparent z-40">
        <button
          onClick={() => onViewChange('dashboard')}
          className="w-full max-w-2xl mx-auto block bg-surface-container-high text-on-surface font-bold py-4 rounded-xl active:scale-95 transition-transform flex items-center justify-center"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
