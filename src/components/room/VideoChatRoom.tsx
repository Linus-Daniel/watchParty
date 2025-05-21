'use client';
import { useSocket } from '@/context/socketContext';
import React, { useEffect, useRef, useState } from 'react';

type Props = {
  roomId: string;
  userId: string;
};

type Message = {
  sender: { username?: string };
  senderId: string;
  content: string;
};

const VideoChatRoom = ({ roomId, userId }: Props) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Connecting...');
  const { socket, isConnected } = useSocket();
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);


  // Initialize media and WebRTC connection
  const initializeMedia = async () => {
    try {
      setStatus('Accessing media devices...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setLocalStream(stream);
      return stream;
    } catch (err) {
      setError("Could not access camera/microphone");
      console.error("Error accessing media devices:", err);
      throw err;
    }
  };

  // Initialize WebRTC connection
  const initializePeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ],
    };

    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setStatus('Connected');
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket?.connected) {
        socket.emit('webrtc-signal', {
          roomId,
          signal: { candidate: event.candidate },
          targetUserId: null,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'disconnected') {
        setStatus('Disconnected');
      }
    };

    return pc;
  };

  // Handle incoming WebRTC signals
  const handleSignal = async ({ senderId, signal }: { senderId: string, signal: any }) => {
    if (!peerConnectionRef.current) return;
  
    try {
      if (signal.sdp) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal.sdp));
  
        // Now apply any buffered candidates
        for (const candidate of pendingCandidates.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidates.current = [];
  
        if (signal.sdp.type === 'offer') {
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          socket?.emit('webrtc-signal', {
            roomId,
            signal: { sdp: peerConnectionRef.current.localDescription },
            targetUserId: senderId,
          });
        }
      } else if (signal.candidate) {
        if (peerConnectionRef.current.remoteDescription) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
        } else {
          // Buffer the candidate
          pendingCandidates.current.push(signal.candidate);
        }
      }
    } catch (err) {
      console.error('Error handling signal:', err);
      setError("Error establishing connection");
    }
  };
  

  // Create and send offer
  const createOffer = async () => {
    try {
      if (!peerConnectionRef.current) return;
      
      setStatus('Creating offer...');
      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await peerConnectionRef.current.setLocalDescription(offer);
      
      socket?.emit('webrtc-signal', {
        roomId,
        signal: { sdp: peerConnectionRef.current.localDescription },
        targetUserId: null,
      });
    } catch (err) {
      console.error('Error creating offer:', err);
      setError("Error initiating call");
    }
  };

  // Main setup effect
  useEffect(() => {
    if (!socket) {
      setError("Socket instance not available");
      return;
    }

    if (!isConnected) {
      setStatus("Connecting to socket...");
      socket.connect();
      return;
    }

    setStatus("Setting up room...");
    socket.emit('joinRoom', roomId, userId);
    socket.emit('join-video-room', roomId);

    const setupConnection = async () => {
      try {
        const stream = await initializeMedia();
        const pc = initializePeerConnection();

        // Add tracks to peer connection
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        // Set up socket listeners
        socket.on('webrtc-signal', handleSignal);
        socket.on('new-message', (message: Message) => {
          setMessages(prev => [...prev, message]);
        });

        // Create initial offer
        await createOffer();

      } catch (err) {
        console.error("Setup error:", err);
        setError("Failed to initialize connection");
      }
    };

    setupConnection();

    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      socket.off('webrtc-signal', handleSignal);
      socket.off('new-message');
      socket.emit('leave-video-room', roomId);
    };
  }, [roomId, userId, socket, isConnected]);

  // Handle message sending
  const sendMessage = () => {
    if (messageInput.trim() && socket?.connected) {
      socket.emit('send-message', {
        roomId,
        content: messageInput,
        senderId: userId
      });
      setMessageInput('');
    }
  };

  if (error) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Room: {roomId}</h2>
      <div className="text-sm text-gray-600 mb-2">{status}</div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">You</h3>
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline
            className="w-full max-w-md bg-black rounded-lg"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Remote</h3>
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline
            className="w-full max-w-md bg-black rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default VideoChatRoom;