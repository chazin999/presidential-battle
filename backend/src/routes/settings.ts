import { Router } from 'express';
import { db } from '../db/db.js';

export const settingsRouter = Router();

settingsRouter.get('/', (_req, res) => {
  res.json(db.prepare(`SELECT * FROM scoring_config WHERE id = 1`).get());
});

settingsRouter.patch('/', (req, res) => {
  const { targetScore, autoReset } = req.body as { targetScore?: number; autoReset?: boolean };

  if (typeof targetScore === 'number') {
    db.prepare(`UPDATE scoring_config SET target_score = ? WHERE id = 1`).run(targetScore);
  }
  if (typeof autoReset === 'boolean') {
    db.prepare(`UPDATE scoring_config SET auto_reset = ? WHERE id = 1`).run(autoReset ? 1 : 0);
  }

  res.json(db.prepare(`SELECT * FROM scoring_config WHERE id = 1`).get());
});

settingsRouter.post('/reset-round', (_req, res) => {
  db.prepare(`UPDATE candidates SET score = 0`).run();
  db.prepare(`UPDATE scoring_config SET round = round + 1 WHERE id = 1`).run();
  res.json({ ok: true });
});

settingsRouter.post('/hard-reset', (_req, res) => {
  db.prepare(`UPDATE candidates SET score = 0, winners = 0`).run();
  db.prepare(`UPDATE scoring_config SET round = 1, target_score = 100, auto_reset = 1 WHERE id = 1`).run();
  db.prepare(`DELETE FROM events`).run();
  res.json({ ok: true });
});
