// Tipos centrais do painel de competição.
// Mantidos em um único módulo para servir de "contrato" entre
// UI, store, serviços de eventos (TikTok) e backend.

export type CandidateId = 'alpha' | 'beta' | 'gamma';

export interface Candidate {
  id: CandidateId;
  name: string;
  photo: string | null; // dataURL (base64) salvo localmente
  score: number;
  winners: number;
  color: string; // token tailwind (alpha | beta | gamma)
  active: boolean;
}

export interface GiftSlot {
  id: string; // ex: "alpha-slot-1"
  candidateId: CandidateId;
  slotIndex: 0 | 1 | 2;
  giftId: string | null; // referência ao catálogo (GiftCatalogItem.id)
  points: number; // totalmente editável no admin
}

/**
 * Item do catálogo de presentes.
 * IMPORTANTE: o TikTok não disponibiliza uma API pública oficial que
 * devolva a lista completa/atualizada de presentes de LIVE para
 * aplicações de terceiros. Este catálogo é um módulo de DADOS isolado
 * (ver src/data/giftsCatalog.json) para que, caso uma fonte oficial
 * autorizada seja disponibilizada no futuro, baste substituir o
 * conteúdo deste arquivo (ou apontar para uma API real) sem tocar
 * em nenhum componente de UI ou lógica de pontuação.
 */
export interface GiftCatalogItem {
  id: string;
  name: string;
  image: string; // emoji ou URL de ícone
  coins: number | null; // null = valor em moedas não confirmado oficialmente
}

export interface HistoryEvent {
  id: string;
  timestamp: number;
  sender: string;
  giftName: string;
  giftImage: string;
  candidateId: CandidateId;
  points: number;
}

export interface ScoringSettings {
  targetScore: number;
  autoReset: boolean;
  round: number;
}

export interface VisualSettings {
  effectsIntensity: 'low' | 'medium' | 'high';
  animationsEnabled: boolean;
  soundEnabled: boolean;
  volume: number; // 0-1
  animationDurationMs: number;
  historyEnabled: boolean;
  /** Mostra botões manuais +1/+10/+100 no card (desligado por padrão —
   * o sistema foi pensado para pontuar automaticamente pelos presentes). */
  showQuickButtons: boolean;
}

export interface Stats {
  totalPoints: number;
  totalGifts: number;
  totalWinners: number;
  roundsPlayed: number;
  giftCounts: Record<string, number>; // giftId -> quantidade recebida
}

export interface TikTokConnection {
  connected: boolean;
  displayName: string | null;
  username: string | null;
  // Nunca armazenar senha. Apenas metadados de sessão OAuth (mock).
}

/**
 * Evento normalizado de presente, independente da origem
 * (TikTok real, mock/demo, ou replay de histórico).
 */
export interface GiftEvent {
  sender: string;
  giftId: string;
  giftName: string;
  giftImage: string;
  candidateId: CandidateId;
  points: number;
  timestamp: number;
}

export interface WinnerResult {
  candidateId: CandidateId;
  round: number;
  finalScores: Record<CandidateId, number>;
  timestamp: number;
}
