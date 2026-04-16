import { useEffect, useState } from 'react';

export function Confetti({ colors }: { colors: string[] }) {
  const [pieces, setPieces] = useState<any[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      rotate: Math.random() * 360,
    }));
    setPieces(newPieces);
  }, [colors]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden flex justify-center">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute w-3 h-3 rounded-sm opacity-90 shadow-sm"
          style={{
            left: `${p.x}vw`,
            background: p.color,
            top: '-5vh',
            animation: `confetti-fall ${p.duration}s ${p.delay}s linear forwards`,
            transform: `rotate(${p.rotate}deg)`
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
