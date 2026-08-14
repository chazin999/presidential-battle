import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBattleStore } from '@/state/store';
import catalog from '@/data/giftsCatalog.json';
import type { Candidate } from '@/types';

const GIFTS: any[] = (catalog as any).gifts;

const COLOR_MAP: Record<string, { text: string; ring: string; glow: string; bar: string }> = {
  alpha: { text: 'text-alpha', ring: 'ring-alpha', glow: 'shadow-glow-alpha', bar: 'bg-alpha' },
  beta: { text: 'text-beta', ring: 'ring-beta', glow: 'shadow-glow-beta', bar: 'bg-beta' },
  gamma: { text: 'text-gamma', ring: 'ring-gamma', glow: 'shadow-glow-gamma', bar: 'bg-gamma' },
};

interface Props {
  candidate: Candidate;
  isLeader: boolean;
  rank: number; // 1, 2, 3 — posição atual no placar
  editable: boolean;
  onEdit: () => void;
}

export function CandidateCard({ candidate, isLeader, rank, editable, onEdit }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setCandidatePhoto = useBattleStore((s) => s.setCandidatePhoto);
  const targetScore = useBattleStore((s) => s.scoring.targetScore);
  const activeFx = useBattleStore((s) => s.activeFx.filter((f) => f.candidateId === candidate.id));
  const dismissFx = useBattleStore((s) => s.dismissFx);
  const visual = useBattleStore((s) => s.visual);
  const giftSlots = useBattleStore((s) => s.giftSlots.filter((sl) => sl.candidateId === candidate.id));
  const addManualPoints = useBattleStore((s) => s.addManualPoints);

  const colors = COLOR_MAP[candidate.color];
  const progress = Math.min(100, (candidate.score / Math.max(1, targetScore)) * 100);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCandidatePhoto(candidate.id, reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <motion.div
      layout
      className={`relative flex flex-col items-center rounded-3xl glass p-4 md:p-5 overflow-hidden transition-shadow duration-500 ${
        isLeader ? `ring-2 ${colors.ring} ${colors.glow}` : 'ring-1 ring-white/5'
      } ${!candidate.active ? 'opacity-40 grayscale' : ''}`}
    >
      <div className="pointer-events-none absolute inset-0 scanlines opacity-30" />

      {/* Badge de posição no placar */}
      <div className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-mono font-bold z-10">
        #{rank}
      </div>

      {isLeader && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-display tracking-widest ${colors.text} border border-current ${colors.glow} bg-void-900/70 z-10`}
        >
          ★ LÍDER
        </motion.div>
      )}

      {/* Foto */}
      <div className="relative mt-4 mb-2">
        <div
          className={`relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden ring-2 ${colors.ring} bg-void-800 flex items-center justify-center ${
            visual.animationsEnabled ? 'animate-pulseGlow' : ''
          }`}
        >
          {candidate.photo ? (
            <img src={candidate.photo} alt={candidate.name} className="w-full h-full object-cover" />
          ) : (
            <span className={`text-4xl ${colors.text}`}>👤</span>
          )}
        </div>
        {editable && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-void-900 border ${colors.ring} flex items-center justify-center text-base hover:scale-110 transition-transform`}
            title="Alterar foto"
          >
            📷
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Nome */}
      <h3 className="font-display font-bold text-base md:text-xl tracking-wide text-center uppercase mb-3">
        {candidate.name}
      </h3>

      {/* Badges de presentes configurados (3 slots) */}
      <div className="flex gap-2 mb-4">
        {giftSlots.map((slot) => {
          const gift = GIFTS.find((g) => g.id === slot.giftId);
          return (
            <div
              key={slot.id}
              className="flex flex-col items-center gap-1 bg-white/5 rounded-xl px-2.5 py-2 min-w-[64px]"
            >
              <span className="text-xl md:text-2xl">{gift?.image ?? '🎁'}</span>
              <span className="text-[9px] text-white/50 text-center leading-tight truncate max-w-[56px]">
                {gift?.name ?? '—'}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                {slot.points} PTS
              </span>
            </div>
          );
        })}
      </div>

      {/* Pontuação */}
      <div className={`font-display font-black text-4xl md:text-6xl mb-1 ${colors.text} text-glow tabular-nums`}>
        {candidate.score.toLocaleString('pt-BR')}
      </div>
      <div className="text-[10px] md:text-xs text-white/40 mb-3 font-mono tracking-widest">PONTOS</div>

      {/* Barra de progresso */}
      <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden mb-1">
        <motion.div
          className={`h-full ${colors.bar}`}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        />
      </div>
      <div className="text-[10px] md:text-xs text-white/40 font-mono self-end mb-2">
        {candidate.score}/{targetScore} · 🏆 {candidate.winners}
      </div>

      {/* Botões manuais opcionais (desligados por padrão em Admin > Visual) */}
      {visual.showQuickButtons && editable && (
        <div className="flex gap-2 w-full mb-2">
          {[1, 10, 100].map((v) => (
            <button
              key={v}
              onClick={() => addManualPoints(candidate.id, v)}
              className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all font-mono text-sm"
            >
              +{v}
            </button>
          ))}
        </div>
      )}

      {editable && (
        <button
          onClick={onEdit}
          className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-body tracking-wide text-white/60"
        >
          ✏️ EDITAR
        </button>
      )}

      {/* Efeitos flutuantes (+pontos) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-24 flex flex-col items-center gap-1">
        <AnimatePresence>
          {activeFx.map((fx) => (
            <motion.div
              key={fx.id}
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ opacity: 1, scale: 1.1, y: -70 }}
              exit={{ opacity: 0 }}
              transition={{ duration: (visual.animationDurationMs || 2000) / 1000, ease: 'easeOut' }}
              onAnimationComplete={() => dismissFx(fx.id)}
              className={`font-display font-bold ${colors.text} text-glow flex items-center gap-1 text-xl md:text-2xl`}
            >
              <span>{fx.giftImage}</span>
              <span>+{fx.points}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
