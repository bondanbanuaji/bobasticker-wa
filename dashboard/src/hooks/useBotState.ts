import { useState, useEffect } from 'react';
import { getSocket, disconnectSocket } from '../lib/socket';

export type BotStatus = 'offline' | 'connecting' | 'qr' | 'connected';

export interface BotLog {
  id: string;
  action: string;
  adminId: string;
  metadata: any;
  createdAt: string;
}

export interface BotConfig {
  prefix: string;
  maintenance: boolean;
}

export interface BotStats {
  messagesProcessed: number;
  startTime: number;
  uptime: number;
}

export interface BotState {
  status: BotStatus;
  qr: string | null;
  config?: BotConfig;
  stats?: BotStats;
}

export function useBotState() {
  const [state, setState] = useState<BotState>({
    status: 'connecting',
    qr: null,
  });
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initSocket = async () => {
      try {
        const socket = await getSocket();
        
        socket.on('connect', () => {
          if (mounted) setSocketConnected(true);
        });

        socket.on('disconnect', () => {
          if (mounted) setSocketConnected(false);
        });

        socket.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
          if (mounted) setError('Failed to connect to Bot Server');
        });

        socket.on('state', (data: BotState) => {
          if (mounted) setState(data);
        });

        socket.on('logs', (data: BotLog[]) => {
          if (mounted) setLogs(data);
        });
      } catch (err) {
        console.error('Socket init error:', err);
        if (mounted) setError('Authentication failed');
      }
    };

    initSocket();

    return () => {
      mounted = false;
      disconnectSocket();
    };
  }, []);

  const sendCommand = async (command: string, payload?: any) => {
    try {
      const socket = await getSocket();
      socket.emit(command, payload);
    } catch (err) {
      console.error(`Failed to send command ${command}:`, err);
    }
  };

  return {
    ...state,
    logs,
    error,
    socketConnected,
    logout: () => sendCommand('logout'),
    restart: () => sendCommand('restart'),
    updateConfig: (config: Partial<BotConfig>) => sendCommand('update_config', config),
    broadcast: (jid: string, message: string) => sendCommand('broadcast', { jid, message }),
  };
}
