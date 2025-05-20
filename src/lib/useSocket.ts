"use client";
// lib/useRoomSocket.ts
import { useEffect } from 'react';
import { useSocket } from '@/context/socketContext';

export const useRoomSocket = (roomId: string) => {
  const { socket, isConnected } = useSocket();

  // Join room when connected
  useEffect(() => {
    if (!isConnected || !socket || !roomId) return;

    socket.emit('joinRoom', roomId);

    return () => {
      socket.emit('leaveRoom', roomId);
    };
  }, [socket, isConnected, roomId]);

  // Subscribe to room events
  const on = (event: string, callback: (...args: any[]) => void) => {
    if (!socket) return () => {};

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  };

  // Emit room events
  const emit = (event: string, ...args: any[]) => {
    if (!socket) return;
    socket.emit(event, roomId, ...args);
  };

  return {
    socket,
    isConnected,
    on,
    emit,
  };
};