import { useBattleStore, CANDIDATE_ORDER } from '@/state/store';

const DOT_COLOR: Record<string, string> = {
  alpha: 'bg-alpha',
  beta: 'bg-beta',
  gamma: 'bg-gamma',
};

interface Props {
  onToggleFullscreen: () => void;
  onHardReset: () => void;
}

export function ScoreHUD({ onToggleFullscreen, onHardReset }: Props) {
  const candidates = useBattleStore((s) => s.candidates);
  const scoring = useBattleStore((s) => s.scoring);

  return (
    <div className="w-full glass rounded-2xl px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl md:text-3xl">🏆</span>
        <div>
          <div className="font-display text-base md:text-2xl tracking-[0.15em]">PRESIDENTIAL BATTLE</div>
          <div className="text-[10px] md:text-xs font-mono text-white/50">
            RODADA {String(scoring.round).padStart(2, '0')} · META {scoring.targetScore}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-8 font-mono">
        {CANDIDATE_ORDER.map((id) => {
          const c = candidates[id];
          return (
            <div key={id} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${DOT_COLOR[id]}`} />
              <span className="text-xs md:text-sm text-white/60 uppercase tracking-wider">{id}</span>
              <span className="text-sm md:text-lg font-semibold tabular-nums">{c.score}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleFullscreen}
          className="px-3 py-1.5 rounded-full text-xs font-mono bg-white/10 hover:bg-white/20"
        >
          📺 PLACAR LIVE
        </button>
        <button
          onClick={onHardReset}
          className="px-3 py-1.5 rounded-full text-xs font-mono bg-red-500/20 text-red-300 hover:bg-red-500/30"
        >
          ZERAR
        </button>
      </div>
    </div>
  );
}
