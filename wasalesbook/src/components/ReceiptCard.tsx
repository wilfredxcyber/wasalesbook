import { useRef, useState, useEffect } from 'react'; import html2canvas from 'html2canvas';
import { supabase } from '../lib/supabase';
import { Order, BusinessProfile } from '../store/types';

interface ReceiptCardProps {
  order: Order;
  profile: BusinessProfile;
  showToast: (msg: string) => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export const RECEIPT_THEMES = [
  {
    id: 'classic-green',
    name: 'Classic',
    cardLg: 'linear-gradient(145deg, #ffffff 0%, #f8faf9 100%)',
    topBar: 'linear-gradient(90deg, #006d2f, #25D366, #006d2f)',
    logoBg: 'linear-gradient(145deg, #006d2f, #00913e)',
    logoShadow: '0 4px 12px rgba(0,109,47,0.25)',
    primaryText: '#006d2f',
    secondaryText: '#94a3b8',
    valueText: '#1e293b',
    detailsBg: '#f1f5f3',
    detailsBorder: '#e2e8e6',
    brandColor: '#25D366',
    zigzagLine: '#e2e8e6',
    zigzagBg: '#f1f5f3'
  },
  {
    id: 'midnight',
    name: 'Midnight',
    cardLg: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
    topBar: 'linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6)',
    logoBg: 'linear-gradient(145deg, #2563eb, #3b82f6)',
    logoShadow: '0 4px 12px rgba(37,99,235,0.3)',
    primaryText: '#60a5fa',
    secondaryText: '#94a3b8',
    valueText: '#f8fafc',
    detailsBg: '#1e293b',
    detailsBorder: '#334155',
    brandColor: '#3b82f6',
    zigzagLine: '#334155',
    zigzagBg: '#1e293b'
  },
  {
    id: 'rose',
    name: 'Rose',
    cardLg: 'linear-gradient(145deg, #fff1f2 0%, #ffe4e6 100%)',
    topBar: 'linear-gradient(90deg, #e11d48, #fb7185, #e11d48)',
    logoBg: 'linear-gradient(145deg, #e11d48, #f43f5e)',
    logoShadow: '0 4px 12px rgba(225,29,72,0.25)',
    primaryText: '#e11d48',
    secondaryText: '#94a3b8',
    valueText: '#4c0519',
    detailsBg: '#ffe4e6',
    detailsBorder: '#fecdd3',
    brandColor: '#e11d48',
    zigzagLine: '#fecdd3',
    zigzagBg: '#ffe4e6'
  },
  {
    id: 'amber',
    name: 'Amber',
    cardLg: 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 100%)',
    topBar: 'linear-gradient(90deg, #d97706, #fbbf24, #d97706)',
    logoBg: 'linear-gradient(145deg, #d97706, #f59e0b)',
    logoShadow: '0 4px 12px rgba(217,119,6,0.25)',
    primaryText: '#d97706',
    secondaryText: '#b45309',
    valueText: '#451a03',
    detailsBg: '#fef3c7',
    detailsBorder: '#fde68a',
    brandColor: '#d97706',
    zigzagLine: '#fde68a',
    zigzagBg: '#fef3c7'
  },
  {
    id: 'mono',
    name: 'Dark Mono',
    cardLg: 'linear-gradient(145deg, #18181b 0%, #09090b 100%)',
    topBar: 'linear-gradient(90deg, #52525b, #a1a1aa, #52525b)',
    logoBg: 'linear-gradient(145deg, #27272a, #3f3f46)',
    logoShadow: '0 4px 12px rgba(39,39,42,0.25)',
    primaryText: '#e4e4e7',
    secondaryText: '#71717a',
    valueText: '#f4f4f5',
    detailsBg: '#27272a',
    detailsBorder: '#3f3f46',
    brandColor: '#71717a',
    zigzagLine: '#3f3f46',
    zigzagBg: '#27272a'
  },
  {
    id: 'custom',
    name: 'Custom Color',
    cardLg: '#ffffff',
    topBar: '#333333',
    logoBg: '#333333',
    logoShadow: 'none',
    primaryText: '#333333',
    secondaryText: '#666666',
    valueText: '#111111',
    detailsBg: 'rgba(0,0,0,0.03)',
    detailsBorder: 'rgba(0,0,0,0.06)',
    brandColor: '#333333',
    zigzagLine: 'rgba(0,0,0,0.08)',
    zigzagBg: '#ffffff'
  }
];

export const FONTS = [
  { id: 'sans', name: 'Modern', value: "'Inter', 'Segoe UI', system-ui, sans-serif" },
  { id: 'serif', name: 'Classic', value: "'Georgia', 'Times New Roman', serif" },
  { id: 'mono', name: 'Code', value: "'Courier New', Courier, monospace" },
  { id: 'rounded', name: 'Playful', value: "'Nunito', 'Quicksand', 'Comic Sans MS', sans-serif" },
  { id: 'elegant', name: 'Elegant', value: "'Playfair Display', 'Didot', serif" },
  { id: 'handwriting', name: 'Handwritten', value: "'Brush Script MT', 'Lucida Handwriting', cursive" },
  { id: 'typewriter', name: 'Typewriter', value: "'American Typewriter', Courier, mono" },
  { id: 'blocky', name: 'Impact', value: "'Impact', 'Arial Black', sans-serif" },
];

export function ReceiptCard({ order, profile, showToast }: ReceiptCardProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ url: string, waUrl?: string } | null>(null);
  const [base64Logo, setBase64Logo] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  // Pre-fetch logo to base64 to prevent Safari "insecure operation" canvas tainting
  useEffect(() => {
    if (!profile.logoUrl) return;
    setLogoError(false);
    setBase64Logo(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    fetch(profile.logoUrl, { 
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit'
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setBase64Logo(reader.result as string);
          } else {
            setLogoError(true);
          }
        };
        reader.onerror = () => {
          console.error('FileReader error');
          setLogoError(true);
        };
        reader.readAsDataURL(blob);
      })
      .catch(err => {
        console.warn('Logo fetch failed - will render fallback:', err.message);
        setLogoError(true);
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [profile.logoUrl]);

  const isLogoLoading = profile.logoUrl && !base64Logo && !logoError;

  const themeId = profile.receiptDesign?.themeId || RECEIPT_THEMES[0].id;
  const fontId = profile.receiptDesign?.fontId || FONTS[0].id;
  const customBg = profile.receiptDesign?.customBgColor || '#ffffff';
  const customText = profile.receiptDesign?.customTextColor || '#1e293b';
  const customAccent = profile.receiptDesign?.customAccentColor || '#006d2f';

  let theme = RECEIPT_THEMES.find(t => t.id === themeId) || RECEIPT_THEMES[0];
  if (themeId === 'custom') {
    theme = {
      ...theme,
      cardLg: customBg,
      topBar: customAccent,
      logoBg: customAccent,
      primaryText: customAccent,
      secondaryText: customText,
      valueText: customText,
      zigzagBg: customBg,
      zigzagLine: customAccent,
    };
  }

  const font = FONTS.find(f => f.id === fontId) || FONTS[0];
  const businessName = profile.userName || 'Whatsbook';
  const currency = profile.currencySymbol || '₦';
  const formattedAmount = `${currency}${order.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const dateStr = formatDate(order.createdAt);
  const filename = `receipt_${order.id}.png`;

  // ── Save / Share Image ──
  // Ultra-basic implementation: No native share APIs, no programmatic downloads.
  // We simply generate the image and display it in the full-screen modal.
  // The user manually long-presses to save or uses the WhatsApp button.
  const handleAction = async () => {
    try {
      setGenerating(true);
      
      // Send to server-side Edge Function to avoid canvas tainting issues
      const response = await supabase.functions.invoke('generate-receipt', {
        body: {
          order,
          profile,
          theme,
          font,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate receipt');
      }

      // Handle the SVG response
      let dataUrl: string;
      
      if (response.data instanceof Uint8Array) {
        const svgString = new TextDecoder().decode(response.data);
        dataUrl = 'data:image/svg+xml;base64,' + btoa(svgString);
      } else if (typeof response.data === 'string') {
        dataUrl = response.data.startsWith('data:') 
          ? response.data 
          : 'data:image/svg+xml;base64,' + btoa(response.data);
      } else {
        // Try as blob
        const blob = new Blob([response.data], { type: 'image/svg+xml' });
        dataUrl = URL.createObjectURL(blob);
      }
      
      const text = `Hi ${order.customerName},\n\nOrder Confirmed ✅\nProduct: ${order.product}\nAmount: ${formattedAmount}\nRef: ${order.id}`;
      let waUrl = '';
      if (order.phone) {
        const cleanPhone = order.phone.replace(/\D/g, '');
        waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text + '\n\n📎 Please attach the saved image.')}`;
      }

      setModalConfig({ url: dataUrl, waUrl });
    } catch (err: any) {
      console.error('Generation error:', err);
      showToast(err.message || 'Could not generate receipt. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = handleAction;
  const handleShare = handleAction;

  const isDark = theme.id === 'midnight' || theme.id === 'mono';

  const logoShape = profile.receiptDesign?.logoShape || 'circle';
  const dividerStyle = profile.receiptDesign?.dividerStyle || 'zigzag';
  const footerMessage = profile.receiptDesign?.footerMessage?.trim() || 'Thank you for your purchase ❤️';
  const watermark = profile.receiptDesign?.watermark || 'none';

  const renderZigzag = () => (
    <div style={{ margin: '0 -24px', height: 12, display: 'flex', overflow: 'hidden' }}>
      {Array.from({ length: 24 }).map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="24" height="12" style={{ flexShrink: 0 }}>
          <path d="M0 12 L12 0 L24 12" fill={theme.zigzagBg} stroke={theme.zigzagLine} strokeWidth="1"/>
        </svg>
      ))}
    </div>
  );

  const renderWavy = () => (
    <div style={{ margin: '0 -24px', height: 12, display: 'flex', overflow: 'hidden' }}>
      {Array.from({ length: 24 }).map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" width="24" height="12" style={{ flexShrink: 0 }}>
          <path d="M0 12 Q6 0 12 12 T24 12" fill={theme.zigzagBg} stroke={theme.zigzagLine} strokeWidth="1"/>
        </svg>
      ))}
    </div>
  );

  const getLogoBorderRadius = () => {
    if (logoShape === 'square') return '4px';
    if (logoShape === 'squircle') return '16px';
    return '50%'; // circle
  };

  return (
    <div className="space-y-6">
      {/* ── The visual receipt ── */}
      <div ref={receiptRef} style={{ width: 360 }} className="mx-auto">
        <div style={{
          background: theme.cardLg,
          borderRadius: 20,
          padding: '32px 24px 24px',
          fontFamily: font.value,
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          border: `1px solid ${theme.detailsBorder}`,
          position: 'relative',
          overflow: 'hidden',
          color: theme.valueText,
        }}>
          {/* Decorative top bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: theme.topBar,
          }} />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56,
              borderRadius: getLogoBorderRadius(),
              background: theme.logoBg,
              margin: '0 auto 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: theme.logoShadow,
              overflow: 'hidden'
            }}>
              {base64Logo ? (
                <img src={base64Logo} alt="Logo" style={{ width: '100%', height: '100%', borderRadius: getLogoBorderRadius(), objectFit: 'cover' }} />
              ) : isLogoLoading ? (
                <span style={{ color: theme.secondaryText, fontSize: 10, fontWeight: 600 }}>...</span>
              ) : (
                <span style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>{businessName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, color: theme.primaryText, letterSpacing: -0.5, margin: 0 }}>{businessName}</p>
            <p style={{ fontSize: 10, color: theme.secondaryText, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>Payment Receipt</p>
          </div>

          {/* Separator */}
          {dividerStyle === 'zigzag' && renderZigzag()}
          {dividerStyle === 'wavy' && renderWavy()}
          {dividerStyle === 'dashed' && (
            <div style={{ margin: '16px 0', borderTop: `2px dashed ${theme.zigzagLine}` }} />
          )}
          {dividerStyle === 'solid' && (
            <div style={{ margin: '16px 0', borderTop: `2px solid ${theme.zigzagLine}` }} />
          )}

          {/* Amount */}
          <div style={{ textAlign: 'center', padding: '20px 0 16px' }}>
            <p style={{ fontSize: 10, color: theme.secondaryText, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Total Amount</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: theme.primaryText, letterSpacing: -1, margin: 0 }}>{formattedAmount}</p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: order.paymentStatus === 'Paid' ? (isDark ? '#064e3b' : '#dcfce7') : (isDark ? '#7f1d1d' : '#fef2f2'),
              color: order.paymentStatus === 'Paid' ? (isDark ? '#34d399' : '#166534') : (isDark ? '#fca5a5' : '#991b1b'),
              padding: '4px 12px', borderRadius: 20,
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1,
              marginTop: 8,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: order.paymentStatus === 'Paid' ? '#22c55e' : '#ef4444' }} />
              {order.paymentStatus}
            </div>
          </div>

          {/* Details */}
          <div style={{ background: theme.detailsBg, borderRadius: 14, padding: 16, marginBottom: 16, position: 'relative' }}>
            {/* Watermark/Stamp */}
            {watermark !== 'none' && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-15deg)',
                fontSize: 48, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 4,
                color: theme.brandColor, opacity: 0.12, pointerEvents: 'none',
                border: `6px solid ${theme.brandColor}`, borderRadius: 12, padding: '8px 24px',
                zIndex: 10, whiteSpace: 'nowrap'
              }}>
                {watermark.replace('_', ' ')}
              </div>
            )}

            {[
              { label: 'Customer', value: order.customerName },
              { label: 'Product', value: order.product },
              { label: 'Date', value: dateStr },
              { label: 'Delivery', value: order.deliveryStatus },
              { label: 'Reference', value: order.id },
              ...(order.phone ? [{ label: 'Phone', value: order.phone }] : []),
              ...(order.notes ? [{ label: 'Notes', value: order.notes }] : []),
            ].map((item, i, arr) => (
              <div key={item.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '10px 0',
                borderBottom: i < arr.length - 1 ? `1px solid ${theme.detailsBorder}` : 'none',
              }}>
                <span style={{ fontSize: 11, color: theme.secondaryText, fontWeight: 600, flexShrink: 0 }}>{item.label}</span>
                <span style={{ fontSize: 12, color: theme.valueText, fontWeight: 700, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' as const }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Payment Info */}
          {profile.paymentDetails && order.paymentStatus === 'Unpaid' && (
            <div style={{
              background: isDark ? 'linear-gradient(145deg, #422006, #2e1437)' : 'linear-gradient(145deg, #fffbeb, #fef3c7)',
              borderRadius: 12, padding: 14,
              border: `1px solid ${isDark ? '#78350f' : '#fde68a'}`,
              marginBottom: 16,
            }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: isDark ? '#fbbf24' : '#92400e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>💳 Payment Details</p>
              <p style={{ fontSize: 12, color: isDark ? '#fef3c7' : '#78350f', fontWeight: 600, lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' as const }}>{profile.paymentDetails}</p>
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <p style={{ fontSize: 9, color: theme.secondaryText, fontWeight: 600, margin: 0 }}>{footerMessage}</p>
            <p style={{ fontSize: 8, color: isDark ? '#475569' : '#cbd5e1', marginTop: 4 }}>Powered by Whatsbook</p>
          </div>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex gap-3 max-w-sm mx-auto">
        <button
          onClick={handleSave}
          disabled={generating || isLogoLoading}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-surface-container-high text-on-surface font-bold rounded-xl active:scale-95 transition-transform disabled:opacity-50"
        >
          {generating ? (
            <span className="w-4 h-4 border-2 border-slate-400/40 border-t-slate-500 rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-[18px]">download</span>
          )}
          Save Image
        </button>
        <button
          onClick={handleShare}
          disabled={generating || isLogoLoading}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#25D366] text-white font-bold rounded-xl active:scale-95 transition-transform shadow-lg disabled:opacity-50"
        >
          {generating ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-[18px]">share</span>
          )}
          Share
        </button>
      </div>

      {/* ── In-page image preview modal (mobile save / share fallback) ── */}
      {modalConfig && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setModalConfig(null)}
        >
          {/* Prevent click-through on inner content */}
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 400 }}>
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 12, fontWeight: 600 }}>
              📲 Long-press the image below → <strong style={{ color: '#fff' }}>Save to Photos</strong>
            </p>
            <img
              src={modalConfig.url}
              alt="Receipt"
              style={{ width: '100%', borderRadius: 16, display: 'block', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}
            />
            
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                onClick={() => setModalConfig(null)}
                style={{
                  flex: 1, padding: '14px 0',
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}
              >
                Close
              </button>
              
              {modalConfig.waUrl && (
                <a
                  href={modalConfig.waUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setModalConfig(null)}
                  style={{
                    flex: 1, padding: '14px 0', textAlign: 'center',
                    background: '#25D366', border: 'none', textDecoration: 'none',
                    borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

