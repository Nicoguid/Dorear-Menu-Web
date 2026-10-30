import type { Plugin } from 'vite';
import { validateSharedStatePayload } from '../db/stateValidation';
import {
  applyBaristaStateUpdate,
  getSharedState,
  updateSharedState,
} from './stateStore';
import { addSseClient, broadcastSsePayload } from './sseBroker';

const MAX_BODY_BYTES = 512_000;
const textEncoder = new TextEncoder();

const env =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env || {};
const ADMIN_PIN = env.DOREAR_ADMIN_PIN || '8888';
const BARISTA_PIN = env.DOREAR_BARISTA_PIN || '1234';

function safePinEquals(input: string, expected: string): boolean {
  const a = textEncoder.encode(input);
  const b = textEncoder.encode(expected);
  if (a.byteLength !== b.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < a.byteLength; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

function resolveStaffRole(pinHeader: unknown): 'admin' | 'barista' | null {
  if (typeof pinHeader !== 'string' || !pinHeader.trim()) return null;
  const trimmed = pinHeader.trim();
  if (safePinEquals(trimmed, ADMIN_PIN)) return 'admin';
  if (safePinEquals(trimmed, BARISTA_PIN)) return 'barista';
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function attachRealtimeMiddleware(middlewares: any): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  middlewares.use(async (req: any, res: any, next: () => void) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    const url: string = req.url || '';

    if (url === '/' || url.startsWith('/?') || url.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }

    if (url.startsWith('/api/menu-stream') && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      res.write(': connected\n\n');

      const state = await getSharedState();
      if (state) {
        res.write(`data: ${JSON.stringify(state)}\n\n`);
      }

      const removeClient = addSseClient({
        write: (chunk: string) => res.write(chunk),
        close: () => res.end(),
      });
      req.on('close', removeClient);
      return;
    }

    if (url.startsWith('/api/menu-state')) {
      if (req.method === 'GET') {
        const state = await getSharedState();
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache, no-store',
        });
        res.end(JSON.stringify({ ok: true, state }));
        return;
      }

      if (req.method === 'POST') {
        const staffPin = req.headers?.['x-dorear-pin'];
        const role = resolveStaffRole(staffPin);
        if (!role) {
          res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: false, error: 'Unauthorized: valid staff PIN required' }));
          return;
        }

        let body = '';
        let byteCount = 0;
        let aborted = false;

        req.on('data', (chunk: unknown) => {
          if (aborted) return;
          const chunkStr = String(chunk);
          byteCount += textEncoder.encode(chunkStr).byteLength;
          if (byteCount > MAX_BODY_BYTES) {
            aborted = true;
            if (!res.headersSent) {
              res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ ok: false, error: 'Payload too large' }));
            }
            req.destroy();
            return;
          }
          body += chunkStr;
        });

        req.on('end', async () => {
          if (aborted || res.writableEnded) return;
          try {
            const parsed = JSON.parse(body);

            if (parsed && parsed.reset === true) {
              if (role !== 'admin') {
                res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ ok: false, error: 'Forbidden: admin role required to reset' }));
                return;
              }
              await updateSharedState(null);
              broadcastSsePayload({ reset: true });
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ ok: true }));
              return;
            }

            const validatedState = validateSharedStatePayload(parsed);
            if (!validatedState) {
              res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ ok: false, error: 'Invalid menu state schema' }));
              return;
            }

            if (role === 'barista') {
              const savedBaristaState = await applyBaristaStateUpdate(validatedState.items);
              broadcastSsePayload(savedBaristaState);
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ ok: true, state: savedBaristaState }));
              return;
            }

            const savedAdminState = await updateSharedState(validatedState);
            if (savedAdminState) {
              broadcastSsePayload(savedAdminState);
            }
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ ok: true, state: savedAdminState }));
          } catch {
            if (!res.headersSent) {
              res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ ok: false, error: 'Invalid JSON payload' }));
            }
          }
        });
        return;
      }

      res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
      return;
    }

    next();
  });
}

export function dorearRealtimeSyncPlugin(): Plugin {
  return {
    name: 'dorear-realtime-sync',
    configureServer(server) {
      attachRealtimeMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachRealtimeMiddleware(server.middlewares);
    },
  };
}
