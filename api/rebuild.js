/**
 * Vercel Cron: vuelve a publicar la carta una vez por día.
 *
 * ¿Para qué? Los clientes ven siempre los precios en vivo (Supabase), pero la versión
 * que leen Google y los agentes de IA (HTML estático, JSON-LD, carta.md) se arma en
 * cada build. Este endpoint dispara un Deploy Hook para que esa versión no quede vieja.
 *
 * Variables de entorno en Vercel (Settings → Environment Variables):
 *   - DEPLOY_HOOK_URL: la URL del Deploy Hook (Settings → Git → Deploy Hooks).
 *   - CRON_SECRET: un texto largo al azar. Vercel lo manda solo en el header
 *     Authorization de las llamadas del Cron; así nadie más puede disparar builds.
 */
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('No autorizado', { status: 401 });
  }

  const hookUrl = process.env.DEPLOY_HOOK_URL;
  if (!hookUrl) {
    return new Response('Falta la variable DEPLOY_HOOK_URL', { status: 500 });
  }

  try {
    const res = await fetch(hookUrl, { method: 'POST' });
    return Response.json({ ok: res.ok, status: res.status }, { status: res.ok ? 200 : 502 });
  } catch {
    // Vercel no reintenta el cron: el 502 queda en los logs para revisarlo.
    return Response.json({ ok: false, error: 'No se pudo llamar al Deploy Hook' }, { status: 502 });
  }
}
