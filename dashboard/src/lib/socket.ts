import { io, Socket } from 'socket.io-client';
import { supabase } from './supabase';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export const getSocket = async () => {
  if (socket) return socket;

  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: session.access_token
    },
    withCredentials: true
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
