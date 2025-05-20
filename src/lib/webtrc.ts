// lib/webrtc.ts
import Peer from 'peerjs';

export const startCall = async (roomId: string, userId: string) => {
  const peer = new Peer(userId);
  const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

  peer.on('call', (call) => {
    call.answer(localStream);
    call.on('stream', (remoteStream) => {
      // Handle remote stream (display video)
    });
  });

  return {
    peer,
    localStream,
    callUser: (targetUserId: string) => {
      const call = peer.call(targetUserId, localStream);
      call.on('stream', (remoteStream) => {
        // Handle remote stream
      });
      return call;
    }
  };
};