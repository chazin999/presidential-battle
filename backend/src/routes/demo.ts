import { Router } from 'express';
import { MockTikTokEventProvider } from '../services/MockTikTokEventProvider.js';
import { applyGiftEvent } from '../services/scoreEngine.js';
import type { CandidateId, GiftEvent } from '../types/index.js';

export function createDemoRouter(mockProvider: MockTikTokEventProvider, broadcast: (m: unknown) => void) {
  const router = Router();

  router.post('/emit-gift', (req, res) => {
    const { sender, giftId, giftName, giftImage, candidateId, points } = req.body as Partial<GiftEvent>;

    if (!candidateId || !giftId || typeof points !== 'number') {
      return res.status(400).json({ error: 'candidateId, giftId e points são obrigatórios' });
    }

    const event: GiftEvent = {
      sender: sender || 'demo_user',
      giftId,
      giftName: giftName || giftId,
      giftImage: giftImage || '🎁',
      candidateId: candidateId as CandidateId,
      points,
      timestamp: Date.now(),
    };

    mockProvider.emit(event);
    applyGiftEvent(event, broadcast);
    res.json({ ok: true, event });
  });

  return router;
}
