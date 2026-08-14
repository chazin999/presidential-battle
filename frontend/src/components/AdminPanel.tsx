import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattleStore, CANDIDATE_ORDER } from '@/state/store';
import { GiftModal } from './GiftModal';
import { TikTokConnect } from './TikTokConnect';
import catalog from '@/data/giftsCatalog.json';
import type { CandidateId } from '@/types';

const GIFTS: any[] = (catalog as any).gifts;
const TABS = ['Candidatos', 'Presentes', 'Pontuação', 'Visual', 'TikTok'] as const;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AdminPanel({ open, onClose }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Candidatos');
  const [modalSlot, setModalSlot] = useState<string | null>(null);

  const candidates = useBattleStore((s) => s.candidates);
  const toggleCandidateActive = useBattleStore((s) => s.toggleCandidateActive);
  const giftSlots = useBattleStore((s) => s.giftSlots);
  const setGiftSlot = useBattleStore((s) => s.setGiftSlot);
  const setGiftSlotPoints = useBattleStore((s) => s.setGiftSlotPoints);
  const scoring = useBattleStore((s) => s.scoring);
  const setTargetScore = useBattleStore((s) => s.setTargetScore);
  const setAutoReset = useBattleStore((s) => s.setAutoReset);
  const visual = useBattleStore((s) => s.visual);
  const setVisualSettings = useBattleStore((s) => s.setVisualSettings);
  const hardResetAll = useBattleStore((s) => s.hardResetAll);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex justify-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full glass border-l border-white/10 flex flex-col"
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-display text-lg tracking-widest">PAINEL ADMIN</h2>
              <button onClick={onClose} className="text-white/50 hover:text-white text-xl">✕</button>
            </div>

            <div className="flex overflow-x-auto border-b border-white/10 shrink-0">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-3 text-sm font-body whitespace-nowrap border-b-2 transition-colors ${
                    tab === t ? 'border-white text-white' : 'border-transparent text-white/40 hover:text-white/70'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {tab === 'Candidatos' &&
                CANDIDATE_ORDER.map((id) => (
                  <CandidateAdminRow key={id} id={id} />
                ))}

              {tab === 'Presentes' && (
                <>
                  <p className="text-xs text-white/40 font-mono">
                    Cada candidato tem 3 slots de presentes. Defina o presente e os pontos concedidos.
                  </p>
                  {CANDIDATE_ORDER.map((id) => (
                    <div key={id} className="space-y-2">
                      <h4 className="font-display text-sm text-white/70">{candidates[id].name}</h4>
                      {giftSlots
                        .filter((s) => s.candidateId === id)
                        .map((slot) => {
                          const gift = GIFTS.find((g) => g.id === slot.giftId);
                          return (
                            <div key={slot.id} className="flex items-center gap-2 bg-white/5 rounded-xl p-2">
                              <button
                                onClick={() => setModalSlot(slot.id)}
                                className="flex items-center gap-2 flex-1 hover:bg-white/10 rounded-lg px-2 py-1"
                              >
                                <span className="text-xl">{gift?.image ?? '❓'}</span>
                                <span className="text-sm font-body">{gift?.name ?? 'Selecionar...'}</span>
                              </button>
                              <input
                                type="number"
                                value={slot.points}
                                onChange={(e) => setGiftSlotPoints(slot.id, Number(e.target.value))}
                                className="w-16 bg-white/10 rounded-lg px-2 py-1 text-sm text-center font-mono outline-none"
                              />
                              <span className="text-xs text-white/40">pts</span>
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </>
              )}

              {tab === 'Pontuação' && (
                <>
                  <div className="bg-white/5 rounded-xl p-4">
                    <label className="text-xs font-mono text-white/50 uppercase tracking-wider">Meta para Vitória</label>
                    <input
                      type="number"
                      value={scoring.targetScore}
                      onChange={(e) => setTargetScore(Number(e.target.value))}
                      className="w-full mt-1 bg-white/10 rounded-lg px-3 py-2 font-mono outline-none"
                    />
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {[50, 100, 250, 500, 1000, 5000].map((v) => (
                        <button
                          key={v}
                          onClick={() => setTargetScore(v)}
                          className="px-2.5 py-1 rounded-lg bg-white/10 text-xs hover:bg-white/20"
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                    <span className="text-sm font-body">Ativar reset automático</span>
                    <input
                      type="checkbox"
                      checked={scoring.autoReset}
                      onChange={(e) => setAutoReset(e.target.checked)}
                      className="w-5 h-5"
                    />
                  </label>

                  <button
                    onClick={() => {
                      if (confirm('Isso vai zerar tudo (pontos, winners, histórico, estatísticas). Confirmar?')) hardResetAll();
                    }}
                    className="w-full py-2.5 rounded-xl bg-red-500/20 text-red-300 text-sm hover:bg-red-500/30"
                  >
                    RESETAR TUDO (fábrica)
                  </button>
                </>
              )}

              {tab === 'Visual' && (
                <>
                  <div className="bg-white/5 rounded-xl p-4">
                    <label className="text-xs font-mono text-white/50 uppercase tracking-wider">Intensidade dos Efeitos</label>
                    <div className="flex gap-2 mt-2">
                      {(['low', 'medium', 'high'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setVisualSettings({ effectsIntensity: lvl })}
                          className={`flex-1 py-1.5 rounded-lg text-xs capitalize ${
                            visual.effectsIntensity === lvl ? 'bg-white/25 ring-1 ring-white/40' : 'bg-white/10'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                    <span className="text-sm font-body">Animações</span>
                    <input
                      type="checkbox"
                      checked={visual.animationsEnabled}
                      onChange={(e) => setVisualSettings({ animationsEnabled: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                    <span className="text-sm font-body">Histórico visível</span>
                    <input
                      type="checkbox"
                      checked={visual.historyEnabled}
                      onChange={(e) => setVisualSettings({ historyEnabled: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                    <span className="text-sm font-body">Som</span>
                    <input
                      type="checkbox"
                      checked={visual.soundEnabled}
                      onChange={(e) => setVisualSettings({ soundEnabled: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                    <div>
                      <span className="text-sm font-body block">Botões manuais +1/+10/+100</span>
                      <span className="text-[11px] text-white/40 font-mono">desligado por padrão — pontuação deve vir dos presentes</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={visual.showQuickButtons}
                      onChange={(e) => setVisualSettings({ showQuickButtons: e.target.checked })}
                      className="w-5 h-5 shrink-0"
                    />
                  </label>

                  <div className="bg-white/5 rounded-xl p-4">
                    <label className="text-xs font-mono text-white/50 uppercase tracking-wider">Volume</label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={visual.volume}
                      onChange={(e) => setVisualSettings({ volume: Number(e.target.value) })}
                      className="w-full mt-2"
                    />
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <label className="text-xs font-mono text-white/50 uppercase tracking-wider">
                      Duração das Animações ({visual.animationDurationMs}ms)
                    </label>
                    <input
                      type="range"
                      min={800}
                      max={4000}
                      step={100}
                      value={visual.animationDurationMs}
                      onChange={(e) => setVisualSettings({ animationDurationMs: Number(e.target.value) })}
                      className="w-full mt-2"
                    />
                  </div>
                </>
              )}

              {tab === 'TikTok' && <TikTokConnect />}
            </div>
          </motion.div>
        </motion.div>
      )}

      {modalSlot && (
        <GiftModal
          open
          currentGiftId={giftSlots.find((s) => s.id === modalSlot)?.giftId ?? null}
          onClose={() => setModalSlot(null)}
          onSelect={(giftId) => setGiftSlot(modalSlot, giftId)}
        />
      )}
    </AnimatePresence>
  );
}

function CandidateAdminRow({ id }: { id: CandidateId }) {
  const candidate = useBattleStore((s) => s.candidates[id]);
  const setCandidateName = useBattleStore((s) => s.setCandidateName);
  const toggleCandidateActive = useBattleStore((s) => s.toggleCandidateActive);

  return (
    <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
        {candidate.photo ? <img src={candidate.photo} className="w-full h-full object-cover" /> : '👤'}
      </div>
      <input
        value={candidate.name}
        onChange={(e) => setCandidateName(id, e.target.value)}
        className="flex-1 bg-white/10 rounded-lg px-2 py-1.5 text-sm outline-none"
      />
      <label className="flex items-center gap-1.5 text-xs text-white/50">
        <input type="checkbox" checked={candidate.active} onChange={() => toggleCandidateActive(id)} />
        ativo
      </label>
    </div>
  );
}
