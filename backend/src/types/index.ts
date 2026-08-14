export type CandidateId = 'alpha' | 'beta' | 'gamma';

export interface GiftEvent {
  sender: string;
  giftId: string;
  giftName: string;
  giftImage: string;
  candidateId: CandidateId;
  points: number;
  timestamp: number;
}

export interface GiftSlotConfig {
  id: string;
  candidateId: CandidateId;
  slotIndex: 0 | 1 | 2;
  giftId: string | null;
  points: number;
}

export interface CandidateRecord {
  id: CandidateId;
  name: string;
  score: number;
  winners: number;
  active: boolean;
}

export interface ScoringConfig {
  targetScore: number;
  autoReset: boolean;
  round: number;
}
