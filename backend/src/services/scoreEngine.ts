import { db } from '../db/db.js';
import type { CandidateId, GiftEvent } from '../types/index.js';

type Broadcaster = (message: unknown) => void;

const CANDIDATE_IDS: CandidateId[] = ['alpha', 'beta', 'gamma'];

/**
 * Aplica um evento de presente já normalizado:
 *  1. grava o histórico
 *  2. soma pontos ao candidato
 *  3. transmite a atualização via WebSocket
 *  4. verifica se a meta foi atingida (respeitando a ORDEM de chegada
 *     do evento, o que resolve empates de forma determinística: quem
 *     processar primeiro vence)
 *  5. se houver vencedor e reset automático estiver ligado, comemora
 *     e reseta a rodada
 */
export function applyGiftEvent(evt: GiftEvent, broadcast: Broadcaster) {
  const candidate = db.prepare(`SELECT * FROM candidates WHERE id = ?`).get(evt.candidateId) as any;
  if (!candidate || !candidate.active) return;

  db.prepare(
    `INSERT INTO events (timestamp, sender, gift_id, gift_name, candidate_id, points) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(evt.timestamp, evt.sender, evt.giftId, evt.giftName, evt.candidateId, evt.points);

  const newScore = candidate.score + evt.points;
  db.prepare(`UPDATE candidates SET score = ? WHERE id = ?`).run(newScore, evt.candidateId);

  broadcast({ type: 'gift_event', payload: evt });
  broadcast({ type: 'score_update', payload: getPublicState() });

  const scoring = db.prepare(`SELECT * FROM scoring_config WHERE id = 1`).get() as any;

  if (scoring.auto_reset && newScore >= scoring.target_score) {
    db.prepare(`UPDATE candidates SET winners = winners + 1 WHERE id = ?`).run(evt.candidateId);

    const finalScores = Object.fromEntries(
      CANDIDATE_IDS.map((id) => {
        const c = db.prepare(`SELECT score FROM candidates WHERE id = ?`).get(id) as any;
        return [id, c.score];
      })
    );

    broadcast({
      type: 'winner',
      payload: { candidateId: evt.candidateId, round: scoring.round, finalScores, timestamp: Date.now() },
    });

    // reseta a rodada após a transmissão do evento de vitória
    db.prepare(`UPDATE candidates SET score = 0`).run();
    db.prepare(`UPDATE scoring_config SET round = round + 1 WHERE id = 1`).run();

    broadcast({ type: 'score_update', payload: getPublicState() });
  }
}

export function getPublicState() {
  const candidates = db.prepare(`SELECT * FROM candidates`).all();
  const scoring = db.prepare(`SELECT * FROM scoring_config WHERE id = 1`).get();
  const giftSlots = db.prepare(`SELECT * FROM gift_slots`).all();
  return { candidates, scoring, giftSlots };
}
