import { useMemo, useState } from 'react';
import { useBattleStore, CANDIDATE_ORDER } from '@/state/store';
import { CandidateCard } from '@/components/CandidateCard';
import { ScoreHUD } from '@/components/ScoreHUD';
import { EventHistory } from '@/components/EventHistory';
import { StatsPanel } from '@/components/StatsPanel';
import { DemoPanel } from '@/components/DemoPanel';
import { AdminPanel } from '@/components/AdminPanel';
import { WinnerAnimation } from '@/components/WinnerAnimation';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useGiftEventBridge } from '@/hooks/useGiftEventBridge';

export default function App() {
  const [eventMode, setEventMode] = useState<'demo' | 'live'>('demo');
  const [adminOpen, setAdminOpen] = useState(false);
  const { isFullscreen, toggle } = useFullscreen();
  const candidates = useBattleStore((s) => s.candidates);
  const hardResetAll = useBattleStore((s) => s.hardResetAll);

  useGiftEventBridge(eventMode);

  // Ranking (posição #1/#2/#3) com base na pontuação atual.
  const ranked = useMemo(
    () => [...CANDIDATE_ORDER].sort((a, b) => candidates[b].score - candidates[a].score),
    [candidates]
  );
  const rankOf = useMemo(() => {
    const map: Record<string, number> = {};
    ranked.forEach((id, i) => (map[id] = i + 1));
    return map;
  }, [ranked]);

  const leaderId = useMemo(() => {
    const withScore = CANDIDATE_ORDER.filter((id) => candidates[id].active);
    if (withScore.every((id) => candidates[id].score === 0)) return null;
    return withScore.reduce((best, id) => (candidates[id].score > candidates[best].score ? id : best), withScore[0]);
  }, [candidates]);

  function handleHardReset() {
    if (confirm('Isso vai zerar pontos, winners, histórico e estatísticas. Confirmar?')) hardResetAll();
  }

  return (
    <div className="min-h-screen flex flex-col p-3 md:p-6 gap-4 max-w-[1600px] mx-auto">
      <WinnerAnimation />

      {/* Barra superior de controle (some no fullscreen) */}
      {!isFullscreen && (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEventMode(eventMode === 'demo' ? 'live' : 'demo')}
              className={`px-3 py-1.5 rounded-full text-xs font-mono tracking-wide ${
                eventMode === 'demo' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {eventMode === 'demo' ? '● MODO DEMO' : '● MODO LIVE'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="px-3 py-1.5 rounded-full text-xs font-mono bg-white/10 hover:bg-white/20">
              ⛶ FULLSCREEN
            </button>
            <button
              onClick={() => setAdminOpen(true)}
              className="px-3 py-1.5 rounded-full text-xs font-mono bg-white/10 hover:bg-white/20"
            >
              ⚙ ADMIN
            </button>
          </div>
        </div>
      )}

      <ScoreHUD onToggleFullscreen={toggle} onHardReset={handleHardReset} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        {CANDIDATE_ORDER.map((id) => (
          <CandidateCard
            key={id}
            candidate={candidates[id]}
            isLeader={leaderId === id}
            rank={rankOf[id]}
            editable={!isFullscreen}
            onEdit={() => setAdminOpen(true)}
          />
        ))}
      </div>

      {!isFullscreen && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <EventHistory />
          <StatsPanel />
          <DemoPanel />
        </div>
      )}

      {isFullscreen && <EventHistory />}

      <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} />

      {isFullscreen && (
        <button
          onClick={toggle}
          className="fixed bottom-4 right-4 px-3 py-1.5 rounded-full text-xs font-mono bg-white/10 hover:bg-white/20 z-50"
        >
          ⛶ SAIR DO FULLSCREEN
        </button>
      )}
    </div>
  );
}
