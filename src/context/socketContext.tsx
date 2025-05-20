"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user} = useAuth();

  useEffect(() => {
    if (!user) return;
    // Check if the socket is already initialized
    const token = localStorage.getItem('token');
    console.log(token)

    // Initialize socket connection
    const socketInstance = io("http://localhost:5001", {
      auth: {
        token:localStorage.getItem('token'),
      },
      autoConnect: false,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    // Connect the socket
    socketInstance.connect();

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('connect_error');
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};