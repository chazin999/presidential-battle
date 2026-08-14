import { useState } from 'react';
import { useBattleStore, CANDIDATE_ORDER } from '@/state/store';
import { mockProvider } from '@/services/MockTikTokEventProvider';
import catalog from '@/data/giftsCatalog.json';
import type { CandidateId } from '@/types';

const GIFTS: any[] = (catalog as any).gifts;
const LABEL: Record<CandidateId, string> = { alpha: 'Alpha', beta: 'Beta', gamma: 'Gamma' };

/**
 * Painel apenas para testes locais (desenvolvimento). Dispara eventos de
 * presente através do MockTikTokEventProvider, exercitando exatamente o
 * mesmo caminho que um evento real de LIVE percorreria.
 */
export function DemoPanel() {
  const [selected, setSelected] = useState<CandidateId>('alpha');
  const giftSlots = useBattleStore((s) => s.giftSlots);
  const slotsForSelected = giftSlots.filter((s) => s.candidateId === selected);

  function fire(giftId: string | null, points: number) {
    const gift = GIFTS.find((g) => g.id === giftId);
    mockProvider.emitGift({
      giftId: giftId ?? 'unknown',
      giftName: gift?.name ?? 'Presente',
      giftImage: gift?.image ?? '🎁',
      candidateId: selected,
      points,
    });
  }

  return (
    <div className="glass rounded-2xl p-4">
      <h4 className="font-display text-sm tracking-widest text-white/60 mb-3">MODO DEMO · SIMULAR PRESENTES</h4>

      <div className="flex gap-2 mb-3">
        {CANDIDATE_ORDER.map((id) => (
          <button
            key={id}
            onClick={() => setSelected(id)}
            className={`px-3 py-1.5 rounded-full text-xs font-body transition-colors ${
              selected === id ? 'bg-white/20 ring-1 ring-white/40' : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            {LABEL[id]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {slotsForSelected.map((slot) => {
          const gift = GIFTS.find((g) => g.id === slot.giftId);
          return (
            <button
              key={slot.id}
              onClick={() => fire(slot.giftId, slot.points)}
              className="flex flex-col items-center gap-1 bg-white/5 hover:bg-white/15 active:scale-95 rounded-xl p-3 transition-all"
            >
              <span className="text-2xl">{gift?.image ?? '🎁'}</span>
              <span className="text-[11px] text-white/60 text-center">{gift?.name ?? 'Presente'}</span>
              <span className="text-emerald-400 font-mono text-xs">+{slot.points}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
