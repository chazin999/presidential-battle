import { Router } from 'express';
import { db } from '../db/db.js';

export const candidatesRouter = Router();

candidatesRouter.get('/', (_req, res) => {
  res.json(db.prepare(`SELECT * FROM candidates`).all());
});

candidatesRouter.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { name, active } = req.body as { name?: string; active?: boolean };

  const existing = db.prepare(`SELECT * FROM candidates WHERE id = ?`).get(id);
  if (!existing) return res.status(404).json({ error: 'Candidato não encontrado' });

  if (typeof name === 'string') db.prepare(`UPDATE candidates SET name = ? WHERE id = ?`).run(name, id);
  if (typeof active === 'boolean') db.prepare(`UPDATE candidates SET active = ? WHERE id = ?`).run(active ? 1 : 0, id);

  res.json(db.prepare(`SELECT * FROM candidates WHERE id = ?`).get(id));
});
