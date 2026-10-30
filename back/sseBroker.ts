export interface SseClient {
  write: (chunk: string) => void;
  close?: () => void;
}

const MAX_SSE_CLIENTS = 100;
const HEARTBEAT_INTERVAL_MS = 25_000;

const sseClients = new Set<SseClient>();
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

function ensureHeartbeat(): void {
  if (heartbeatTimer !== null) return;
  heartbeatTimer = setInterval(() => {
    if (sseClients.size === 0) {
      if (heartbeatTimer !== null) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
      return;
    }
    sseClients.forEach((client) => {
      try {
        client.write(': keepalive\n\n');
      } catch {
        sseClients.delete(client);
      }
    });
  }, HEARTBEAT_INTERVAL_MS);

  const timerObj = heartbeatTimer as unknown as { unref?: () => void };
  timerObj?.unref?.();
}

export function addSseClient(client: SseClient): () => void {
  if (sseClients.size >= MAX_SSE_CLIENTS) {
    const oldest = sseClients.values().next().value;
    if (oldest) {
      sseClients.delete(oldest);
      try {
        oldest.close?.();
      } catch {}
    }
  }

  sseClients.add(client);
  ensureHeartbeat();

  return () => {
    sseClients.delete(client);
  };
}

export function broadcastSsePayload(payload: unknown): void {
  const message = `data: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  });
}
