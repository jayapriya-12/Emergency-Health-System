import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Socket connection URL (dynamic for production deployment or dev)
    const socketServerUrl = import.meta.env.VITE_SOCKET_URL ||
      (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);

    const newSocket = io(socketServerUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('⚡ Connected to Emergency Socket.IO server:', newSocket.id);
      setConnected(true);

      if (user) {
        newSocket.emit('join_room', { userId: user.id, role: user.role });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket server');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && connected && user) {
      socket.emit('join_room', { userId: user.id, role: user.role });
    }
  }, [user, connected, socket]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
