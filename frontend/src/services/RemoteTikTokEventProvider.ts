import type { GiftEvent } from '@/types';
import type { TikTokEventProvider } from './TikTokEventProvider';

/**
 * Provider "real" do ponto de vista do frontend: conecta ao backend via
 * WebSocket e repassa eventos já normalizados. O backend é quem concentra
 * a integração oficial do TikTok (quando disponível) ou o próprio mock,
 * conforme configurado em backend/.env — o frontend não sabe (nem precisa
 * saber) qual é a fonte original do evento.
 */
export class RemoteTikTokEventProvider implements TikTokEventProvider {
  private ws: WebSocket | null = null;
  private connected = false;
  private callbacks: Array<(event: GiftEvent) => void> = [];
  private url: string;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(url: string = (import.meta.env.VITE_WS_URL as string) || 'ws://localhost:4000/ws') {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
      } catch (e) {
        reject(e);
        return;
      }

      this.ws.onopen = () => {
        this.connected = true;
        resolve();
      };

      this.ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          if (data.type === 'gift_event') {
            this.callbacks.forEach((cb) => cb(data.payload as GiftEvent));
          }
        } catch {
          // ignora mensagens malformadas
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        // tenta reconectar automaticamente (útil durante a LIVE)
        this.reconnectTimer = setTimeout(() => this.connect().catch(() => {}), 3000);
      };

      this.ws.onerror = () => {
        this.connected = false;
      };
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.connected = false;
  }

  onGift(callback: (event: GiftEvent) => void): void {
    this.callbacks.push(callback);
  }

  isConnected(): boolean {
    return this.connected;
  }
}
