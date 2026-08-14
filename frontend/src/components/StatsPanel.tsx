import { useBattleStore, CANDIDATE_ORDER } from '@/state/store';
import catalog from '@/data/giftsCatalog.json';

export function StatsPanel() {
  const stats = useBattleStore((s) => s.stats);
  const candidates = useBattleStore((s) => s.candidates);

  const topGiftId = Object.entries(stats.giftCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topGift = (catalog as any).gifts.find((g: any) => g.id === topGiftId);

  const topCandidateId = CANDIDATE_ORDER.reduce((best, id) =>
    candidates[id].winners > candidates[best].winners ? id : best, CANDIDATE_ORDER[0]);

  const items = [
    { label: 'Total de Pontos', value: stats.totalPoints.toLocaleString('pt-BR') },
    { label: 'Total de Presentes', value: stats.totalGifts.toLocaleString('pt-BR') },
    { label: 'Total de Winners', value: stats.totalWinners.toLocaleString('pt-BR') },
    { label: 'Rodadas Disputadas', value: stats.roundsPlayed.toLocaleString('pt-BR') },
    { label: 'Presente Mais Recebido', value: topGift ? `${topGift.image} ${topGift.name}` : '—' },
    { label: 'Líder em Vitórias', value: stats.totalWinners > 0 ? candidates[topCandidateId].name : '—' },
  ];

  return (
    <div className="glass rounded-2xl p-4 grid grid-cols-2 gap-3">
      {items.map((it) => (
        <div key={it.label} className="bg-white/5 rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wider text-white/40 font-mono">{it.label}</div>
          <div className="font-display text-base md:text-lg mt-1">{it.value}</div>
        </div>
      ))}
    </div>
  );
}
