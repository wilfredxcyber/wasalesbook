import { useEffect } from 'react';

export function Toast({ message, onClose }: { message: string, onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Determine icon based on message content
  let icon = 'info';
  let iconColor = 'text-blue-400';
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('success') || lowerMsg.includes('saved') || lowerMsg.includes('✓') || lowerMsg.includes('added')) {
    icon = 'check_circle';
    iconColor = 'text-green-400';
  } else if (lowerMsg.includes('error') || lowerMsg.includes('failed') || lowerMsg.includes('remove')) {
    icon = 'error';
    iconColor = 'text-red-400';
  } else if (lowerMsg.includes('extracting')) {
    icon = 'hourglass_empty';
    iconColor = 'text-yellow-400';
  }

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-modal-in pointer-events-none">
      <div className="bg-inverse-surface/95 backdrop-blur-md text-inverse-on-surface px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-white/10">
        <span className={`material-symbols-outlined text-lg ${iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        <span className="text-sm font-semibold tracking-wide whitespace-nowrap">{message.replace('✓ ', '')}</span>
      </div>
    </div>
  );
}
