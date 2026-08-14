import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = process.env.DATABASE_PATH || './data/battle.db';

// garante que o diretório do banco exista
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  winners INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS gift_slots (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  slot_index INTEGER NOT NULL,
  gift_id TEXT,
  points INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS scoring_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  target_score INTEGER NOT NULL DEFAULT 100,
  auto_reset INTEGER NOT NULL DEFAULT 1,
  round INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL,
  sender TEXT NOT NULL,
  gift_id TEXT NOT NULL,
  gift_name TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  points INTEGER NOT NULL
);
`);

// seed inicial (idempotente)
const seedCandidates = db.prepare(
  `INSERT OR IGNORE INTO candidates (id, name, score, winners, active) VALUES (?, ?, 0, 0, 1)`
);
seedCandidates.run('alpha', 'Presidente Alpha');
seedCandidates.run('beta', 'Presidente Beta');
seedCandidates.run('gamma', 'Presidente Gamma');

const seedSlots = db.prepare(
  `INSERT OR IGNORE INTO gift_slots (id, candidate_id, slot_index, gift_id, points) VALUES (?, ?, ?, ?, ?)`
);
const defaultSlots: Array<[string, number, number]> = [
  ['rose', 0, 1],
  ['heart', 1, 5],
  ['trophy', 2, 10],
];
for (const c of ['alpha', 'beta', 'gamma']) {
  defaultSlots.forEach(([giftId, idx, points]) => {
    seedSlots.run(`${c}-slot-${idx + 1}`, c, idx, giftId, points);
  });
}

db.prepare(`INSERT OR IGNORE INTO scoring_config (id, target_score, auto_reset, round) VALUES (1, 100, 1, 1)`).run();
