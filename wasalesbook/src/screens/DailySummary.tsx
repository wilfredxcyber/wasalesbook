import { useState } from 'react';
import { DailySummary as DSType, Order } from '../store/types';
import { supabase } from '../lib/supabase';

interface DailySummaryProps {
  summary: DSType;
  orders: Order[];
  onViewChange: (view: string) => void;
  showToast: (msg: string) => void;
}

function formatCurrency(amount: number) {
  return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

export function DailySummary({ summary, orders, onViewChange, showToast }: DailySummaryProps) {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setAiSummary('');
    showToast('Generating summary...');
    try {
      const orderLines = todayOrders.map(o =>
        `- ${o.customerName}: ${o.product}, ${formatCurrency(o.amount)}, Payment: ${o.paymentStatus}, Delivery: ${o.deliveryStatus}`
      ).join('\n') || 'No orders today.';

      const { data, error } = await supabase.functions.invoke('openai-proxy', {
        body: {
          contents: `You are a helpful assistant for a small WhatsApp seller. Write a short, friendly, plain-English daily sales summary based on these stats:

Orders today: ${summary.totalOrders}
Total revenue expected: ${formatCurrency(summary.totalRevenue)}
Collected so far: ${formatCurrency(summary.totalCollected)}
Still owed: ${formatCurrency(summary.totalOwed)}
Pending delivery: ${summary.pendingDelivery}
Delivered: ${summary.delivered}

Order details:
${orderLines}

Write a short summary (3-5 sentences) that helps the seller understand: how their day went, what money they still need to collect, and what deliveries are still pending. Use a friendly, practical tone. Do not use markdown.`
        }
      });
      
      if (error) throw error;
      setAiSummary(data.text || '');
    } catch (error) {
      console.error(error);
      showToast('Failed to generate summary');
      setAiSummary('Could not generate summary. Check your API key and connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-background min-h-screen pb-24">
      <header className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-4 py-3 w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => onViewChange('dashboard')} className="p-2 -ml-2 rounded-full hover:bg-slate-100/50 transition-colors active:scale-95">
              <span className="material-symbols-outlined text-slate-900">arrow_back</span>
            </button>
            <div>
              <h1 className="font-semibold tracking-tight text-slate-900 text-lg">Daily Summary</h1>
              <p className="text-xs text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <span className="text-[10px] bg-secondary-container text-secondary px-2 py-0.5 rounded-full font-semibold">AI POWERED</span>
        </div>
        <div className="bg-slate-100 h-[1px] w-full"></div>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Orders Today</p>
            <p className="text-3xl font-extrabold text-on-surface">{summary.totalOrders}</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Total Revenue</p>
            <p className="text-xl font-extrabold text-primary truncate">{formatCurrency(summary.totalRevenue)}</p>
          </div>
          <div className="bg-secondary-container p-4 rounded-2xl shadow-sm">
            <p className="text-[10px] font-bold text-secondary/70 uppercase tracking-widest mb-1.5">Collected</p>
            <p className="text-xl font-extrabold text-secondary truncate">{formatCurrency(summary.totalCollected)}</p>
          </div>
          <div className={`p-4 rounded-2xl shadow-sm ${summary.totalOwed > 0 ? 'bg-error-container' : 'bg-surface-container-lowest border border-outline-variant/10'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${summary.totalOwed > 0 ? 'text-on-error-container/70' : 'text-slate-400'}`}>Still Owed</p>
            <p className={`text-xl font-extrabold truncate ${summary.totalOwed > 0 ? 'text-on-error-container' : 'text-on-surface'}`}>{formatCurrency(summary.totalOwed)}</p>
          </div>
        </div>

        {/* Delivery Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/10 flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-outline text-xl">local_shipping</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending</p>
              <p className="text-xl font-extrabold text-on-surface">{summary.pendingDelivery}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/10 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivered</p>
              <p className="text-xl font-extrabold text-on-surface">{summary.delivered}</p>
            </div>
          </div>
        </div>

        {/* AI Summary Card */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              AI Business Summary
            </h2>
          </div>

          {aiSummary ? (
            <div className="text-sm text-on-surface leading-relaxed">{aiSummary}</div>
          ) : (
            <p className="text-sm text-on-surface-variant">
              {summary.totalOrders === 0
                ? 'No orders logged today yet. Start by adding an order from the dashboard.'
                : 'Tap Generate to get an AI-written summary of your day.'}
            </p>
          )}

          <button
            onClick={handleGenerateSummary}
            disabled={isGenerating || summary.totalOrders === 0}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
          >
            <span className="material-symbols-outlined text-sm">
              {isGenerating ? 'hourglass_empty' : 'summarize'}
            </span>
            {isGenerating ? 'Generating...' : 'Generate Summary'}
          </button>

          {aiSummary && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(aiSummary).then(() => showToast('Summary copied!'));
              }}
              className="w-full bg-surface-container-high text-on-surface font-semibold py-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              Copy to Share
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
