import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '../lib/socket';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = socketService.connect();
    socketRef.current = socket;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      // We don't disconnect the socket here as it's a singleton, 
      // but we remove the listeners.
    };
  }, []);

  return { socket: socketRef.current, isConnected };
};
