import type { GiftEvent } from '../types/index.js';

/**
 * Contrato para qualquer fonte de eventos de presente de LIVE.
 *
 * Estado atual (verificado antes da implementação, ver README seção
 * "TikTok — o que é real e o que é mock"): o TikTok não oferece, para
 * desenvolvedores comuns, uma API pública de webhooks/streaming que
 * entregue eventos de presentes de uma LIVE em tempo real. O que existe
 * oficialmente é o TikTok for Developers (Login Kit, Display API, etc.),
 * sem um endpoint público de "live gifting events" para aplicações de
 * terceiros no momento em que este projeto foi criado.
 *
 * Por isso este backend só inclui:
 *  - MockTikTokEventProvider: gera eventos localmente para teste/demo.
 *  - Este contrato (TikTokEventProvider), pronto para receber uma
 *    implementação real (`LiveTikTokEventProvider`) assim que uma
 *    parceria/API oficial autorizada estiver disponível para a conta
 *    em questão. Essa implementação deve apenas consumir a API oficial
 *    e converter os eventos recebidos para o formato GiftEvent abaixo,
 *    sem precisar tocar em nenhuma outra parte do sistema.
 */
export interface TikTokEventProvider {
  start(onGift: (event: GiftEvent) => void): Promise<void>;
  stop(): void;
  isActive(): boolean;
}
