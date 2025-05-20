import { io, Socket } from 'socket.io-client';
import Peer, { MediaConnection } from 'peerjs';

interface PeerConnection {
  call?: MediaConnection;
  stream?: MediaStream;
}

class WebRTCService {
  private peer: Peer;
  private socket: Socket;
  private localStream: MediaStream | null = null;
  private peers: Record<string, PeerConnection> = {};

  public onRemoteStreamAdded?: (userId: string, stream: MediaStream) => void;
  public onRemoteStreamRemoved?: (userId: string) => void;

  constructor(roomId: string) {
    this.peer = new Peer(undefined as any, {
      host: '/',
      port: 3001, // or your PeerJS server port
      path: '/peerjs',
    });

    this.socket = io(); // Your Socket.IO connection

    this.peer.on('open', (id: string) => {
      console.log('PeerJS ID:', id);
      this.socket.emit('join-room', roomId, id);
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('user-connected', (userId: string) => {
      console.log('User connected:', userId);
      this.connectToNewUser(userId);
    });

    this.socket.on('user-disconnected', (userId: string) => {
      console.log('User disconnected:', userId);
      if (this.peers[userId]) {
        this.peers[userId].call?.close();
        delete this.peers[userId];
      }
    });
  }

  public async startLocalStream(constraints: MediaStreamConstraints = { video: true, audio: true }): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      throw err;
    }
  }

  private connectToNewUser(userId: string) {
    if (!this.localStream) return;

    const call = this.peer.call(userId, this.localStream);
    if (!call) return;

    const peerConnection: PeerConnection = { call };

    call.on('stream', (remoteStream: MediaStream) => {
      peerConnection.stream = remoteStream;
      this.onRemoteStreamAdded?.(userId, remoteStream);
    });

    call.on('close', () => {
      this.onRemoteStreamRemoved?.(userId);
      delete this.peers[userId];
    });

    this.peers[userId] = peerConnection;
  }

  public setupPeerListeners() {
    this.peer.on('call', (call: MediaConnection) => {
      if (!this.localStream) return;

      call.answer(this.localStream);
      const userId = call.peer;

      const peerConnection: PeerConnection = { call };

      call.on('stream', (remoteStream: MediaStream) => {
        peerConnection.stream = remoteStream;
        this.onRemoteStreamAdded?.(userId, remoteStream);
      });

      call.on('close', () => {
        this.onRemoteStreamRemoved?.(userId);
        delete this.peers[userId];
      });

      this.peers[userId] = peerConnection;
    });
  }

  public cleanup() {
    this.peer.destroy();
    Object.values(this.peers).forEach(({ call }) => call?.close());
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.socket.off('user-connected');
    this.socket.off('user-disconnected');
  }
}

export default WebRTCService;