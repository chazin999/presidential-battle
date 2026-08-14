import type { GiftEvent } from '@/types';
import type { TikTokEventProvider } from './TikTokEventProvider';

const DEMO_SENDERS = ['joao_98', 'maria.live', 'pedro_streams', 'ana_tk', 'lucas.gg', 'bia_fan', 'rafa_vip'];

/**
 * Implementação de demonstração do TikTokEventProvider.
 * Não se conecta a nada externo — permite disparar eventos de presente
 * manualmente (painel DEMO) para testar toda a arquitetura de pontuação,
 * animações e reset sem precisar de uma LIVE real.
 */
export class MockTikTokEventProvider implements TikTokEventProvider {
  private connected = false;
  private callbacks: Array<(event: GiftEvent) => void> = [];

  async connect(): Promise<void> {
    this.connected = true;
  }

  disconnect(): void {
    this.connected = false;
  }

  onGift(callback: (event: GiftEvent) => void): void {
    this.callbacks.push(callback);
  }

  isConnected(): boolean {
    return this.connected;
  }

  /** Dispara manualmente um evento de presente (usado pelo DemoPanel). */
  emitGift(evt: Omit<GiftEvent, 'timestamp' | 'sender'> & { sender?: string }): void {
    const fullEvent: GiftEvent = {
      ...evt,
      sender: evt.sender ?? DEMO_SENDERS[Math.floor(Math.random() * DEMO_SENDERS.length)],
      timestamp: Date.now(),
    };
    this.callbacks.forEach((cb) => cb(fullEvent));
  }
}

export const mockProvider = new MockTikTokEventProvider();
