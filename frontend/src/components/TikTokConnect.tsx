import { useState } from 'react';
import { useBattleStore } from '@/state/store';

/**
 * Seção "Conexão com TikTok".
 * Nunca solicita senha. O botão apenas inicia o fluxo OAuth oficial
 * (Login Kit) contra o backend, que troca o código de autorização
 * pelo token — o token nunca fica exposto no frontend além do necessário.
 */
export function TikTokConnect() {
  const tiktok = useBattleStore((s) => s.tiktok);
  const setTikTokConnection = useBattleStore((s) => s.setTikTokConnection);
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    setLoading(true);
    try {
      // Fluxo real: redireciona para /api/auth/tiktok/login no backend,
      // que por sua vez redireciona para o endpoint oficial de autorização
      // do TikTok Login Kit. Aqui deixamos a chamada pronta; se o backend
      // não estiver rodando, orientamos o usuário.
      const res = await fetch('/api/auth/tiktok/login-url').then((r) => r.json());
      if (res?.url) {
        window.location.href = res.url;
      } else {
        alert('Backend não respondeu. Inicie o backend para conectar com o TikTok (veja o README).');
      }
    } catch {
      alert('Não foi possível iniciar a conexão. Verifique se o backend está rodando (README.md).');
    } finally {
      setLoading(false);
    }
  }

  function handleDisconnect() {
    setTikTokConnection({ connected: false, displayName: null, username: null });
  }

  return (
    <div className="glass rounded-2xl p-4">
      <h4 className="font-display text-sm tracking-widest text-white/60 mb-3">CONEXÃO COM TIKTOK</h4>

      {tiktok.connected ? (
        <div className="flex items-center justify-between">
          <div>
            <div className="font-body font-semibold">{tiktok.displayName}</div>
            <div className="text-white/50 text-sm font-mono">@{tiktok.username}</div>
            <div className="text-emerald-400 text-xs font-mono mt-1">● CONECTADO</div>
          </div>
          <button onClick={handleDisconnect} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 text-sm hover:bg-red-500/30">
            DESCONECTAR
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-alpha via-beta to-gamma text-void-950 font-display font-bold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'CONECTANDO...' : 'CONECTAR TIKTOK'}
          </button>
          <p className="text-[11px] text-white/40 mt-2 font-mono">
            Autenticação via OAuth oficial do TikTok. Nenhuma senha é solicitada neste site.
          </p>
        </div>
      )}
    </div>
  );
}
