import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
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
  const [precomputedBlob, setPrecomputedBlob] = useState<Blob | null>(null);
  const [base64Logo, setBase64Logo] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState<{ url: string; isShare?: boolean; text?: string; phoneUrl?: string } | null>(null);

  // Convert remote logo to base64 to completely avoid Safari canvas tainting/CORS cache issues
  useEffect(() => {
    if (!profile.logoUrl) {
      setBase64Logo(null);
      return;
    }
    // Append a timestamp to heavily bypass Safari caching non-CORS images
    const fetchUrl = `${profile.logoUrl}?t=${new Date().getTime()}`;
    fetch(fetchUrl, { mode: 'cors' })
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => setBase64Logo(reader.result as string);
        reader.readAsDataURL(blob);
      })
      .catch(err => {
        console.error('Failed to convert logo to base64', err);
        setBase64Logo(profile.logoUrl); // fallback
      });
  }, [profile.logoUrl]);
  
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
      zigzagLine: customAccent, // Use accent color for the divider line
    };
  }
  
  const font = FONTS.find(f => f.id === fontId) || FONTS[0];

  const businessName = profile.userName || 'Whatsbook';
  const currency = profile.currencySymbol || '₦';
  const formattedAmount = `${currency}${order.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const dateStr = formatDate(order.createdAt);

  const captureReceipt = async (): Promise<Blob | null> => {
    if (!receiptRef.current) return null;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, 
        backgroundColor: null, 
        useCORS: true,
        allowTaint: false,
        logging: false
      });
      return new Promise<Blob | null>((resolve, reject) => {
         try {
           canvas.toBlob(blob => resolve(blob), 'image/png', 1.0);
         } catch(e) {
           console.error("Canvas taint error:", e);
           reject(e);
         }
      });
    } catch (err) {
      console.error('html2canvas error', err);
      return null;
    }
  };

  // Re-precompute when design changes 
  useEffect(() => {
    // Clear old blob when design changes to prevent sending stale images
    setPrecomputedBlob(null);
    
    const timer = setTimeout(() => {
      captureReceipt().then(blob => {
        if (blob) setPrecomputedBlob(blob);
      });
    }, 1000); // 1s delay to let everything settle
    return () => clearTimeout(timer);
  }, [
    themeId, fontId, 
    profile.receiptDesign?.dividerStyle, 
    profile.receiptDesign?.logoShape, 
    profile.receiptDesign?.footerMessage,
    profile.receiptDesign?.watermark,
    customBg, customText, customAccent,
    profile.logoUrl, profile.userName, profile.currencySymbol
  ]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 200);
  };

  const handleDownload = async () => {
    try {
      setGenerating(true);
      // Try to use precomputed blob first, capture fresh if missing
      let blob = precomputedBlob;
      if (!blob) {
        blob = await captureReceipt();
      }
      
      if (!blob) { 
        showToast('Failed to generate receipt image'); 
        return; 
      }
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // BYPASS FIX: On mobile, native share and blobs are heavily restricted or buggy.
      // We instantly show the user the rendered image full-screen so they can hold to save.
      if (isMobile) {
        const objectUrl = URL.createObjectURL(blob);
        setShowImageModal({ url: objectUrl });
        return;
      }

      // Desktop: Attempt native share if available (helps on macOS Safari/Chrome)
      if (navigator.share && window.isSecureContext) {
        try {
          const file = new File([blob], filename, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'Order Receipt' });
            showToast('Receipt saved!');
            return;
          }
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') return;
        }
      }

      // Desktop: direct download fallback

      // Desktop: direct download
      downloadBlob(blob, filename);
      showToast('Receipt saved to device!');
    } catch (err: any) {
      console.error('Download error:', err);
      showToast('Action failed: Please refresh and try again');
    } finally {
      setGenerating(false);
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      setGenerating(true);
      let blob = precomputedBlob;
      if (!blob) {
        blob = await captureReceipt();
      }
      if (!blob) {
        showToast('Failed to generate receipt image');
        return;
      }

      const filename = `receipt_${order.id}.png`;
      const text = `Hi ${order.customerName},\n\nOrder Confirmed ✅\nProduct: ${order.product}\nAmount: ${formattedAmount}\nDelivery: ${order.deliveryStatus}\nRef: ${order.id}\n\n${order.paymentStatus === 'Unpaid' && profile.paymentDetails ? `Please make payment to:\n${profile.paymentDetails}` : ''}`;

      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      let whatsappUrl = '';
      if (order.phone) {
        const cleanPhone = order.phone.replace(/\D/g, '');
        whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text + (isMobile ? '\n\n📎 *Image shown on screen — please save and attach it!*' : '\n\n📎 *Image saved! Please attach it!*'))}`;
      }

      // BYPASS FIX: Same as download, bypass flaky share sheet on mobile.
      if (isMobile) {
        const objectUrl = URL.createObjectURL(blob);
        setShowImageModal({ 
          url: objectUrl, 
          isShare: true, 
          text, 
          phoneUrl: whatsappUrl || undefined 
        });
        return;
      }

      // Desktop: Native Share
      if (navigator.share && window.isSecureContext) {
        try {
          const file = new File([blob], filename, { type: 'image/png' });
          const shareData: ShareData = { files: [file], title: 'Order Receipt', text };
          if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
            if (whatsappUrl) {
              setTimeout(() => { window.open(whatsappUrl, '_blank'); }, 500);
            }
            return;
          }
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') return;
        }
      }

      // Desktop fallback: download + WhatsApp link

      // Desktop fallback: download + WhatsApp link
      downloadBlob(blob, filename);
      if (whatsappUrl) {
        showToast('Image downloaded. Opening WhatsApp...');
        setTimeout(() => { window.open(whatsappUrl, '_blank'); }, 800);
      } else {
        showToast('Receipt downloaded!');
        try {
          if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
          }
        } catch (e) {}
      }
    } catch (err: any) {
      console.error('Share error:', err);
      showToast('Action failed: Try again or copy manually');
    } finally {
      setGenerating(false);
    }
  };

  const isDark = theme.id === 'midnight' || theme.id === 'mono';
  
  const logoShape = profile.receiptDesign?.logoShape || 'circle';
  const dividerStyle = profile.receiptDesign?.dividerStyle || 'zigzag';
  const footerMessage = profile.receiptDesign?.footerMessage?.trim() || 'Thank you for your purchase ❤️';
  const watermark = profile.receiptDesign?.watermark || 'none';

  // SVG base64 conversion to prevent Safari 'insecure operation' canvas blocking
  const getZigzagURL = () => {
    const line = theme.zigzagLine;
    const bg = theme.zigzagBg;
    const svgStr = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='12'><path d='M0 12 L12 0 L24 12' fill='${bg}' stroke='${line}' stroke-width='1'/></svg>`;
    return `url("data:image/svg+xml;base64,${btoa(svgStr)}")`;
  };

  const getWavyURL = () => {
    const line = theme.zigzagLine;
    const bg = theme.zigzagBg;
    const svgStr = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='12'><path d='M0 12 Q6 0 12 12 T24 12' fill='${bg}' stroke='${line}' stroke-width='1'/></svg>`;
    return `url("data:image/svg+xml;base64,${btoa(svgStr)}")`;
  };

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
              ) : profile.logoUrl ? (
                <span style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>...</span>
              ) : (
                <span style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>{businessName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, color: theme.primaryText, letterSpacing: -0.5, margin: 0 }}>{businessName}</p>
            <p style={{ fontSize: 10, color: theme.secondaryText, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>Payment Receipt</p>
          </div>

          {/* Separator */}
          {dividerStyle === 'zigzag' && (
            <div style={{ margin: '0 -24px', height: 12, backgroundImage: getZigzagURL(), backgroundRepeat: 'repeat-x', backgroundSize: '24px 12px' }} />
          )}
          {dividerStyle === 'wavy' && (
            <div style={{ margin: '0 -24px', height: 12, backgroundImage: getWavyURL(), backgroundRepeat: 'repeat-x', backgroundSize: '24px 12px' }} />
          )}
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
          onClick={handleDownload}
          disabled={generating}
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
          onClick={handleShareWhatsApp}
          disabled={generating}
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

      {/* MODAL BYPASS: Displays the generated image for native mobile OS sharing/saving */}
      {showImageModal && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 px-4 py-8 animate-in fade-in zoom-in duration-200">
          <div className="absolute top-0 right-0 left-0 p-4 flex justify-end">
            <button 
              onClick={() => {
                 URL.revokeObjectURL(showImageModal.url);
                 setShowImageModal(null);
              }} 
              className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-all z-10"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="flex-1 w-full flex flex-col items-center justify-center overflow-auto py-8 mt-10">
            <p className="text-white font-bold text-center mb-6 animate-pulse px-8 text-sm">
              Long-press the image below to Save!
            </p>
            
            <img 
              src={showImageModal.url} 
              alt="Final Receipt" 
              className="w-full max-w-sm h-auto rounded-xl shadow-[0_0_40px_rgba(37,211,102,0.15)] object-contain drop-shadow-2xl mb-8 border border-[#25D366]/30"
              style={{ pointerEvents: 'auto' }} // Ensure long-press works naturally
            />
            
            {showImageModal.isShare && showImageModal.phoneUrl && (
              <a 
                href={showImageModal.phoneUrl} 
                target="_blank" 
                rel="noreferrer"
                className="w-full max-w-sm flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white font-bold rounded-xl shadow-[0_8px_30px_rgba(37,211,102,0.3)] active:scale-95 transition-transform"
                onClick={() => {
                   // Clean up after they click
                   setTimeout(() => {
                     URL.revokeObjectURL(showImageModal.url);
                     setShowImageModal(null);
                   }, 1000);
                }}
              >
                <span className="material-symbols-outlined">chat</span>
                Continue to WhatsApp
              </a>
            )}
            
            {showImageModal.isShare && !showImageModal.phoneUrl && (
              <button 
                onClick={async () => {
                  try {
                    if (navigator.clipboard) await navigator.clipboard.writeText(showImageModal.text || '');
                    showToast('Details copied! Now share image manually.');
                  } catch(e) {}
                }}
                className="w-full max-w-sm flex items-center justify-center gap-2 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-xl active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">content_copy</span>
                Copy Details
              </button>
            )}
          </div>
          
          <p className="text-white/40 text-[10px] text-center mb-0 mt-auto flex items-center justify-center gap-2 pt-4 pb-safe font-medium">
            <span className="material-symbols-outlined text-[12px]">security</span>
            Bypassing browser security restrictions
          </p>
        </div>
      )}
    </div>
  );
}

