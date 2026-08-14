import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useBattleStore } from '@/state/store';

const COLOR_MAP: Record<string, { text: string; glow: string; hex: string[] }> = {
  alpha: { text: 'text-alpha', glow: 'shadow-glow-alpha', hex: ['#00E5FF', '#0891A8', '#ffffff'] },
  beta: { text: 'text-beta', glow: 'shadow-glow-beta', hex: ['#FF2E93', '#A8135C', '#ffffff'] },
  gamma: { text: 'text-gamma', glow: 'shadow-glow-gamma', hex: ['#FFC93C', '#B8890A', '#ffffff'] },
};

export function WinnerAnimation() {
  const lastWinner = useBattleStore((s) => s.lastWinner);
  const candidates = useBattleStore((s) => s.candidates);
  const clearLastWinner = useBattleStore((s) => s.clearLastWinner);
  const resetRound = useBattleStore((s) => s.resetRound);
  const visual = useBattleStore((s) => s.visual);

  useEffect(() => {
    if (!lastWinner) return;
    const colors = COLOR_MAP[candidates[lastWinner.candidateId].color].hex;

    if (visual.animationsEnabled) {
      const duration = 3200;
      const end = Date.now() + duration;
      (function frame() {
        confetti({ particleCount: 6, angle: 60, spread: 65, origin: { x: 0 }, colors });
        confetti({ particleCount: 6, angle: 120, spread: 65, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors, startVelocity: 45 });
    }

    const timer = setTimeout(() => {
      resetRound();
      clearLastWinner();
    }, 4200);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastWinner]);

  if (!lastWinner) return null;
  const winner = candidates[lastWinner.candidateId];
  const colors = COLOR_MAP[winner.color];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.4, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 140, damping: 12 }}
          className="flex flex-col items-center"
        >
          <div className="text-6xl md:text-8xl mb-2 animate-pulseGlow">🏆</div>
          <div className={`font-display text-3xl md:text-6xl tracking-[0.2em] ${colors.text} text-glow mb-4`}>
            WINNER!
          </div>

          <div className={`w-32 h-32 md:w-48 md:h-48 rounded-3xl overflow-hidden ring-4 ${colors.glow} bg-void-800 flex items-center justify-center mb-4`}>
            {winner.photo ? (
              <img src={winner.photo} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl">👤</span>
            )}
          </div>

          <div className="font-display text-xl md:text-3xl mb-2">{winner.name}</div>
          <div className={`font-mono text-sm md:text-base ${colors.text}`}>+1 WIN · TOTAL {winner.winners}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
