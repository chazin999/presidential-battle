import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Candidate,
  CandidateId,
  GiftSlot,
  HistoryEvent,
  ScoringSettings,
  VisualSettings,
  Stats,
  TikTokConnection,
  GiftEvent,
  WinnerResult,
} from '@/types';

const CANDIDATE_IDS: CandidateId[] = ['alpha', 'beta', 'gamma'];

function defaultCandidates(): Record<CandidateId, Candidate> {
  return {
    alpha: { id: 'alpha', name: 'Presidente Alpha', photo: null, score: 0, winners: 0, color: 'alpha', active: true },
    beta: { id: 'beta', name: 'Presidente Beta', photo: null, score: 0, winners: 0, color: 'beta', active: true },
    gamma: { id: 'gamma', name: 'Presidente Gamma', photo: null, score: 0, winners: 0, color: 'gamma', active: true },
  };
}

function defaultGiftSlots(): GiftSlot[] {
  const slots: GiftSlot[] = [];
  const defaults = [
    { giftId: 'rose', points: 1 },
    { giftId: 'heart', points: 5 },
    { giftId: 'trophy', points: 10 },
  ];
  for (const c of CANDIDATE_IDS) {
    defaults.forEach((d, i) => {
      slots.push({
        id: `${c}-slot-${i + 1}`,
        candidateId: c,
        slotIndex: i as 0 | 1 | 2,
        giftId: d.giftId,
        points: d.points,
      });
    });
  }
  return slots;
}

interface FloatingScoreFx {
  id: string;
  candidateId: CandidateId;
  points: number;
  giftName: string;
  giftImage: string;
}

interface BattleState {
  candidates: Record<CandidateId, Candidate>;
  giftSlots: GiftSlot[];
  scoring: ScoringSettings;
  visual: VisualSettings;
  stats: Stats;
  history: HistoryEvent[];
  tiktok: TikTokConnection;
  lastWinner: WinnerResult | null;
  activeFx: FloatingScoreFx[]; // efeitos flutuantes em tela

  // ações de configuração
  setCandidateName: (id: CandidateId, name: string) => void;
  setCandidatePhoto: (id: CandidateId, dataUrl: string | null) => void;
  toggleCandidateActive: (id: CandidateId) => void;
  setGiftSlot: (slotId: string, giftId: string | null) => void;
  setGiftSlotPoints: (slotId: string, points: number) => void;
  setTargetScore: (value: number) => void;
  setAutoReset: (value: boolean) => void;
  setVisualSettings: (partial: Partial<VisualSettings>) => void;
  setTikTokConnection: (conn: TikTokConnection) => void;

  // motor de pontuação
  applyGiftEvent: (evt: GiftEvent) => void;
  /** Atalho para os botões manuais +1/+10/+100 (opcionais, ver Visual). */
  addManualPoints: (id: CandidateId, points: number) => void;
  dismissFx: (id: string) => void;
  clearLastWinner: () => void;
  resetRound: () => void;
  hardResetAll: () => void;
}

export const useBattleStore = create<BattleState>()(
  persist(
    (set, get) => ({
      candidates: defaultCandidates(),
      giftSlots: defaultGiftSlots(),
      scoring: { targetScore: 100, autoReset: true, round: 1 },
      visual: {
        effectsIntensity: 'high',
        animationsEnabled: true,
        soundEnabled: false,
        volume: 0.6,
        animationDurationMs: 2400,
        historyEnabled: true,
        showQuickButtons: false,
      },
      stats: { totalPoints: 0, totalGifts: 0, totalWinners: 0, roundsPlayed: 0, giftCounts: {} },
      history: [],
      tiktok: { connected: false, displayName: null, username: null },
      lastWinner: null,
      activeFx: [],

      setCandidateName: (id, name) =>
        set((s) => ({ candidates: { ...s.candidates, [id]: { ...s.candidates[id], name } } })),

      setCandidatePhoto: (id, dataUrl) =>
        set((s) => ({ candidates: { ...s.candidates, [id]: { ...s.candidates[id], photo: dataUrl } } })),

      toggleCandidateActive: (id) =>
        set((s) => ({ candidates: { ...s.candidates, [id]: { ...s.candidates[id], active: !s.candidates[id].active } } })),

      setGiftSlot: (slotId, giftId) =>
        set((s) => ({ giftSlots: s.giftSlots.map((sl) => (sl.id === slotId ? { ...sl, giftId } : sl)) })),

      setGiftSlotPoints: (slotId, points) =>
        set((s) => ({ giftSlots: s.giftSlots.map((sl) => (sl.id === slotId ? { ...sl, points } : sl)) })),

      setTargetScore: (value) => set((s) => ({ scoring: { ...s.scoring, targetScore: value } })),
      setAutoReset: (value) => set((s) => ({ scoring: { ...s.scoring, autoReset: value } })),
      setVisualSettings: (partial) => set((s) => ({ visual: { ...s.visual, ...partial } })),
      setTikTokConnection: (conn) => set({ tiktok: conn }),

      applyGiftEvent: (evt) => {
        const s = get();
        const candidate = s.candidates[evt.candidateId];
        if (!candidate || !candidate.active) return;

        const newScore = candidate.score + evt.points;
        const fxId = `fx-${evt.timestamp}-${Math.random().toString(36).slice(2, 8)}`;

        const historyEntry: HistoryEvent = {
          id: fxId,
          timestamp: evt.timestamp,
          sender: evt.sender,
          giftName: evt.giftName,
          giftImage: evt.giftImage,
          candidateId: evt.candidateId,
          points: evt.points,
        };

        set((st) => ({
          candidates: {
            ...st.candidates,
            [evt.candidateId]: { ...candidate, score: newScore },
          },
          history: st.visual.historyEnabled ? [historyEntry, ...st.history].slice(0, 50) : st.history,
          stats: {
            ...st.stats,
            totalPoints: st.stats.totalPoints + evt.points,
            totalGifts: st.stats.totalGifts + 1,
            giftCounts: {
              ...st.stats.giftCounts,
              [evt.giftId]: (st.stats.giftCounts[evt.giftId] ?? 0) + 1,
            },
          },
          activeFx: [...st.activeFx, { id: fxId, candidateId: evt.candidateId, points: evt.points, giftName: evt.giftName, giftImage: evt.giftImage }],
        }));

        // Checa vitória (com base na ordem de chegada do evento — trata empates
        // usando a ordem de processamento, conforme especificado).
        const { scoring } = get();
        if (scoring.autoReset && newScore >= scoring.targetScore) {
          const finalScores = Object.fromEntries(
            CANDIDATE_IDS.map((id) => [id, id === evt.candidateId ? newScore : get().candidates[id].score])
          ) as Record<CandidateId, number>;

          const result: WinnerResult = {
            candidateId: evt.candidateId,
            round: scoring.round,
            finalScores,
            timestamp: Date.now(),
          };

          set((st) => ({
            lastWinner: result,
            candidates: {
              ...st.candidates,
              [evt.candidateId]: { ...st.candidates[evt.candidateId], winners: st.candidates[evt.candidateId].winners + 1 },
            },
            stats: { ...st.stats, totalWinners: st.stats.totalWinners + 1 },
          }));
        }
      },

      addManualPoints: (id, points) => {
        get().applyGiftEvent({
          sender: 'admin',
          giftId: 'manual',
          giftName: 'Ajuste manual',
          giftImage: '➕',
          candidateId: id,
          points,
          timestamp: Date.now(),
        });
      },

      dismissFx: (id) => set((s) => ({ activeFx: s.activeFx.filter((f) => f.id !== id) })),

      clearLastWinner: () => set({ lastWinner: null }),

      resetRound: () =>
        set((s) => ({
          candidates: Object.fromEntries(
            CANDIDATE_IDS.map((id) => [id, { ...s.candidates[id], score: 0 }])
          ) as Record<CandidateId, Candidate>,
          scoring: { ...s.scoring, round: s.scoring.round + 1 },
          stats: { ...s.stats, roundsPlayed: s.stats.roundsPlayed + 1 },
        })),

      hardResetAll: () =>
        set({
          candidates: defaultCandidates(),
          giftSlots: defaultGiftSlots(),
          scoring: { targetScore: 100, autoReset: true, round: 1 },
          stats: { totalPoints: 0, totalGifts: 0, totalWinners: 0, roundsPlayed: 0, giftCounts: {} },
          history: [],
          lastWinner: null,
          activeFx: [],
        }),
    }),
    {
      name: 'presidential-battle-storage',
      partialize: (s) => ({
        candidates: s.candidates,
        giftSlots: s.giftSlots,
        scoring: s.scoring,
        visual: s.visual,
        stats: s.stats,
        history: s.history,
        tiktok: s.tiktok,
      }),
    }
  )
);

export const CANDIDATE_ORDER = CANDIDATE_IDS;
