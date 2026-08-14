import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'node:http';

import './db/db.js';
import { getPublicState } from './services/scoreEngine.js';
import { createWebSocketServer } from './websocket/server.js';
import { MockTikTokEventProvider } from './services/MockTikTokEventProvider.js';
import { applyGiftEvent } from './services/scoreEngine.js';

import { candidatesRouter } from './routes/candidates.js';
import { giftsRouter } from './routes/gifts.js';
import { settingsRouter } from './routes/settings.js';
import { authRouter } from './routes/auth.js';
import { createDemoRouter } from './routes/demo.js';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

const httpServer = http.createServer(app);
const { broadcast } = createWebSocketServer(httpServer);

// Fonte de eventos ativa (mock por padrão — ver services/TikTokEventProvider.ts)
const mockProvider = new MockTikTokEventProvider();
mockProvider.start((event) => applyGiftEvent(event, broadcast));

app.get('/api/state', (_req, res) => res.json(getPublicState()));
app.use('/api/candidates', candidatesRouter);
app.use('/api/gifts', giftsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/auth', authRouter);
app.use('/api/demo', createDemoRouter(mockProvider, broadcast));

app.get('/api/health', (_req, res) => res.json({ ok: true, source: process.env.GIFT_EVENT_SOURCE || 'mock' }));

const PORT = Number(process.env.PORT) || 4000;
httpServer.listen(PORT, () => {
  console.log(`[presidential-battle] backend rodando em http://localhost:${PORT}`);
  console.log(`[presidential-battle] WebSocket disponível em ws://localhost:${PORT}/ws`);
});
