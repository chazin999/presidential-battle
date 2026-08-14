import { Router } from 'express';

/**
 * Fluxo OAuth oficial do TikTok Login Kit.
 *
 * Este módulo NUNCA lida com senha do usuário. O fluxo é:
 *  1. Frontend chama GET /api/auth/tiktok/login-url
 *  2. Backend monta a URL de autorização oficial do TikTok e devolve
 *  3. Frontend redireciona o navegador para essa URL (tela é do TikTok)
 *  4. TikTok redireciona de volta para TIKTOK_REDIRECT_URI com um "code"
 *  5. Backend troca o code por um access_token (server-to-server) e
 *     busca os dados básicos do perfil (nome/username)
 *
 * Requer credenciais de um app aprovado em https://developers.tiktok.com/
 * configuradas em backend/.env (TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET).
 * Sem essas credenciais, este endpoint responde com aviso claro em vez
 * de fingir uma conexão real.
 */
export const authRouter = Router();

const TIKTOK_AUTH_BASE = 'https://www.tiktok.com/v2/auth/authorize/';
const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';

authRouter.get('/tiktok/login-url', (_req, res) => {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !redirectUri) {
    return res.status(200).json({
      url: null,
      error:
        'TIKTOK_CLIENT_KEY / TIKTOK_REDIRECT_URI não configurados no backend/.env. Cadastre um app em developers.tiktok.com para habilitar esta conexão.',
    });
  }

  const state = Math.random().toString(36).slice(2);
  const params = new URLSearchParams({
    client_key: clientKey,
    scope: 'user.info.basic',
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
  });

  res.json({ url: `${TIKTOK_AUTH_BASE}?${params.toString()}` });
});

authRouter.get('/tiktok/callback', async (req, res) => {
  const { code } = req.query as { code?: string };
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;
  const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

  if (!code || !clientKey || !clientSecret || !redirectUri) {
    return res.redirect(`${frontendOrigin}?tiktok_error=missing_config`);
  }

  try {
    const tokenRes = await fetch(TIKTOK_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.redirect(`${frontendOrigin}?tiktok_error=token_exchange_failed`);
    }

    // Aqui buscaríamos o perfil via /v2/user/info/ com o access_token
    // e então redirecionaríamos de volta ao frontend com os dados
    // públicos (nome/username), nunca com o token em si na URL.
    res.redirect(`${frontendOrigin}?tiktok_connected=1`);
  } catch {
    res.redirect(`${frontendOrigin}?tiktok_error=network`);
  }
});
