import { useBattleStore } from '@/state/store';

const LABEL: Record<string, string> = { alpha: 'ALPHA', beta: 'BETA', gamma: 'GAMMA' };

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR');
}

export function EventHistory() {
  const history = useBattleStore((s) => s.history);
  const visible = useBattleStore((s) => s.visual.historyEnabled);

  if (!visible) return null;

  return (
    <div className="glass rounded-2xl p-4 h-full flex flex-col">
      <h4 className="font-display text-sm tracking-widest text-white/60 mb-3">ÚLTIMOS LANÇAMENTOS</h4>
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {history.length === 0 && <p className="text-white/30 text-sm font-body">Nenhum evento ainda.</p>}
        {history.map((e, i) => (
          <div key={e.id} className="flex flex-wrap items-center gap-1.5 text-xs md:text-sm font-body bg-white/5 rounded-lg px-3 py-1.5">
            <span className="text-white/40 font-mono">{history.length - i}x</span>
            <span>{e.giftImage}</span>
            <span className="text-white/70">{e.giftName}</span>
            <span className="text-white/40">→</span>
            <span className="font-semibold">{LABEL[e.candidateId]}</span>
            <span className="text-white/40">=</span>
            <span className="text-emerald-400 font-mono">+{e.points} {e.giftName}</span>
            <span className="text-white/30 ml-auto font-mono text-[11px]">
              @{e.sender} {formatTime(e.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
