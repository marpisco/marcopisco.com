import type { LanyardPresence, PresenceState } from './lanyard';

const LANYARD_USER_ID = '1060304285457448970';
const LANYARD_REST_ENDPOINT = `https://api.lanyard.rest/v1/users/${LANYARD_USER_ID}`;
const LANYARD_SOCKET_ENDPOINT = 'wss://api.lanyard.rest/socket';

type Publish = (state: PresenceState) => void;

type LanyardRestResponse = {
  success: boolean;
  data?: LanyardPresence;
};

type LanyardSocketMessage = {
  op: number;
  t?: string;
  d?: unknown;
};

function isLanyardPresence(value: unknown): value is LanyardPresence {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<LanyardPresence>;
  return typeof candidate.discord_status === 'string' && Array.isArray(candidate.activities);
}

function findPresence(value: unknown): LanyardPresence | null {
  if (isLanyardPresence(value)) {
    return value;
  }

  if (value && typeof value === 'object') {
    const presence = (value as Record<string, unknown>)[LANYARD_USER_ID];
    if (isLanyardPresence(presence)) {
      return presence;
    }
  }

  return null;
}

async function loadLanyardPresence(publish: Publish): Promise<void> {
  try {
    const response = await fetch(LANYARD_REST_ENDPOINT);
    if (!response.ok) {
      throw new Error('Lanyard REST request failed');
    }

    const payload = (await response.json()) as LanyardRestResponse;
    if (!payload.success || !isLanyardPresence(payload.data)) {
      throw new Error('Lanyard returned no presence');
    }

    publish({ kind: 'ready', presence: payload.data });
  } catch {
    publish({ kind: 'unavailable' });
  }
}

export function startPresence(publish: Publish): void {
  let socket: WebSocket | null = null;
  let heartbeatId: number | null = null;
  let reconnectId: number | null = null;
  let stopped = false;

  const clearHeartbeat = (): void => {
    if (heartbeatId !== null) {
      window.clearInterval(heartbeatId);
      heartbeatId = null;
    }
  };

  const scheduleReconnect = (): void => {
    if (stopped || reconnectId !== null) {
      return;
    }

    reconnectId = window.setTimeout(() => {
      reconnectId = null;
      connect();
    }, 15_000);
  };

  function connect(): void {
    if (stopped || typeof WebSocket === 'undefined') {
      return;
    }

    socket = new WebSocket(LANYARD_SOCKET_ENDPOINT);
    socket.addEventListener('open', () => {
      socket?.send(JSON.stringify({ op: 2, d: { subscribe_to_id: LANYARD_USER_ID } }));
    });
    socket.addEventListener('message', (event: MessageEvent<string>) => {
      let message: LanyardSocketMessage;
      try {
        message = JSON.parse(event.data) as LanyardSocketMessage;
      } catch {
        return;
      }

      if (message.op === 1 && message.d && typeof message.d === 'object') {
        const heartbeatInterval = (message.d as { heartbeat_interval?: unknown }).heartbeat_interval;
        if (typeof heartbeatInterval === 'number' && heartbeatInterval > 0) {
          clearHeartbeat();
          heartbeatId = window.setInterval(() => {
            socket?.send(JSON.stringify({ op: 3, d: null }));
          }, heartbeatInterval);
        }
        return;
      }

      if (message.op === 0 && (message.t === 'INIT_STATE' || message.t === 'PRESENCE_UPDATE')) {
        const presence = findPresence(message.d);
        if (presence) {
          publish({ kind: 'ready', presence });
        }
      }
    });
    socket.addEventListener('close', () => {
      clearHeartbeat();
      scheduleReconnect();
    });
    socket.addEventListener('error', () => {
      socket?.close();
    });
  }

  window.addEventListener('beforeunload', () => {
    stopped = true;
    clearHeartbeat();
    if (reconnectId !== null) {
      window.clearTimeout(reconnectId);
    }
    socket?.close();
  });

  void loadLanyardPresence(publish);
  connect();
}
