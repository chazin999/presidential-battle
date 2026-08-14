import { useEffect, useRef } from 'react';
import { useBattleStore } from '@/state/store';
import { mockProvider } from '@/services/MockTikTokEventProvider';
import { RemoteTikTokEventProvider } from '@/services/RemoteTikTokEventProvider';
import type { TikTokEventProvider } from '@/services/TikTokEventProvider';
import type { GiftEvent } from '@/types';

/**
 * Conecta a store ao provedor de eventos ativo.
 * mode = 'demo'   -> usa MockTikTokEventProvider (sem backend necessário)
 * mode = 'live'   -> usa RemoteTikTokEventProvider (WebSocket do backend)
 */
export function useGiftEventBridge(mode: 'demo' | 'live') {
  const applyGiftEvent = useBattleStore((s) => s.applyGiftEvent);
  const providerRef = useRef<TikTokEventProvider | null>(null);

  useEffect(() => {
    const handle = (evt: GiftEvent) => applyGiftEvent(evt);

    const provider: TikTokEventProvider = mode === 'demo' ? mockProvider : new RemoteTikTokEventProvider();
    providerRef.current = provider;
    provider.onGift(handle);
    provider.connect().catch(() => {
      // em modo live, se o backend não estiver rodando, a UI segue
      // funcional (apenas sem eventos automáticos) — sem quebrar o painel.
    });

    return () => {
      provider.disconnect();
    };
  }, [mode, applyGiftEvent]);

  return providerRef;
}
