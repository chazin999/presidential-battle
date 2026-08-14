import { Router } from 'express';
import { db } from '../db/db.js';

export const giftsRouter = Router();

giftsRouter.get('/slots', (_req, res) => {
  res.json(db.prepare(`SELECT * FROM gift_slots`).all());
});

giftsRouter.patch('/slots/:id', (req, res) => {
  const { id } = req.params;
  const { giftId, points } = req.body as { giftId?: string | null; points?: number };

  const existing = db.prepare(`SELECT * FROM gift_slots WHERE id = ?`).get(id);
  if (!existing) return res.status(404).json({ error: 'Slot não encontrado' });

  if (giftId !== undefined) db.prepare(`UPDATE gift_slots SET gift_id = ? WHERE id = ?`).run(giftId, id);
  if (typeof points === 'number') db.prepare(`UPDATE gift_slots SET points = ? WHERE id = ?`).run(points, id);

  res.json(db.prepare(`SELECT * FROM gift_slots WHERE id = ?`).get(id));
});
