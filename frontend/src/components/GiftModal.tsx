import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import catalog from '@/data/giftsCatalog.json';
import type { GiftCatalogItem } from '@/types';

interface Props {
  open: boolean;
  currentGiftId: string | null;
  onClose: () => void;
  onSelect: (giftId: string) => void;
}

const GIFTS: GiftCatalogItem[] = (catalog as any).gifts;

export function GiftModal({ open, currentGiftId, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => GIFTS.filter((g) => g.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden ring-1 ring-white/10"
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-display text-lg tracking-wide">Selecionar Presente</h3>
              <button onClick={onClose} className="text-white/50 hover:text-white text-xl">✕</button>
            </div>

            <div className="p-4 border-b border-white/10">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar presente..."
                className="w-full bg-white/5 rounded-xl px-4 py-2 outline-none focus:ring-1 focus:ring-white/30 font-body"
              />
              <p className="text-[11px] text-white/40 mt-2 font-mono">
                Catálogo de demonstração — os valores em moedas não são exibidos porque o
                TikTok não confirma essa informação via API pública para apps de terceiros.
              </p>
            </div>

            <div className="p-4 grid grid-cols-3 sm:grid-cols-4 gap-3 overflow-y-auto">
              {filtered.map((g) => {
                const selected = g.id === currentGiftId;
                return (
                  <button
                    key={g.id}
                    onClick={() => {
                      onSelect(g.id);
                      onClose();
                    }}
                    className={`flex flex-col items-center gap-1 rounded-2xl p-3 transition-all ${
                      selected ? 'bg-white/15 ring-2 ring-white/50' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-3xl">{g.image}</span>
                    <span className="text-xs font-body text-center leading-tight">{g.name}</span>
                    <span className="text-[10px] text-white/30 font-mono">
                      {g.coins != null ? `${g.coins} moedas` : '— moedas —'}
                    </span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full text-center text-white/40 py-8 font-body">Nenhum presente encontrado.</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
