import type { GiftEvent } from '../types/index.js';
import type { TikTokEventProvider } from './TikTokEventProvider.js';

/**
 * Provider mock do backend. Não gera eventos sozinho: expõe `emit()`,
 * chamado pela rota REST /api/demo/emit-gift, para que o modo DEMO do
 * frontend (ou um teste automatizado, ou até o Postman) consiga
 * exercitar o pipeline completo: rota -> scoreEngine -> WebSocket.
 */
export class MockTikTokEventProvider implements TikTokEventProvider {
  private active = false;
  private callback: ((event: GiftEvent) => void) | null = null;

  async start(onGift: (event: GiftEvent) => void): Promise<void> {
    this.callback = onGift;
    this.active = true;
  }

  stop(): void {
    this.active = false;
    this.callback = null;
  }

  isActive(): boolean {
    return this.active;
  }

  emit(event: GiftEvent): void {
    if (this.active && this.callback) this.callback(event);
  }
}
