import type { GiftEvent } from '@/types';

/**
 * Camada de abstração para recebimento de eventos de presente da LIVE.
 *
 * Por que essa camada existe:
 * O TikTok não expõe, hoje, uma API pública/oficial que permita a um site
 * comum de terceiros assinar eventos de presentes de uma LIVE em tempo real.
 * Existem apenas: (a) integrações internas do próprio TikTok LIVE Studio,
 * e (b) parcerias oficiais/homologadas (TikTok for Developers) concedidas
 * caso a caso. Bibliotecas não-oficiais que fazem engenharia reversa do
 * protocolo de LIVE NÃO são utilizadas aqui, conforme solicitado.
 *
 * Portanto, este projeto define um CONTRATO estável (esta interface).
 * Qualquer fonte de eventos — mock local, ou uma futura integração real
 * homologada pelo TikTok — implementa esse contrato e é plugada no app
 * sem alterar nenhum componente de UI ou a lógica de pontuação.
 */
export interface TikTokEventProvider {
  /** Inicia a escuta de eventos (conexão com WS do backend, SDK oficial, etc). */
  connect(): Promise<void>;
  /** Encerra a escuta de eventos. */
  disconnect(): void;
  /** Registra um callback chamado a cada presente recebido. */
  onGift(callback: (event: GiftEvent) => void): void;
  /** Indica se o provider está atualmente conectado/ativo. */
  isConnected(): boolean;
}
