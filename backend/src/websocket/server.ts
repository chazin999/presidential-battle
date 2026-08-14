import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'node:http';
import { getPublicState } from '../services/scoreEngine.js';

export function createWebSocketServer(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (socket) => {
    // envia o estado atual assim que o cliente conectar
    socket.send(JSON.stringify({ type: 'score_update', payload: getPublicState() }));
  });

  function broadcast(message: unknown) {
    const data = JSON.stringify(message);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(data);
    });
  }

  return { wss, broadcast };
}
