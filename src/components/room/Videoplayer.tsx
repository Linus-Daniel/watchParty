'use client';

import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useSocket } from '@/context/socketContext';

interface VideoPlayerProps {
  url: string;
  roomId: string;
  isHost: boolean;
  onUrlChange?: (newUrl: string) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, roomId, isHost }) => {
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();
  const [isReady, setIsReady] = useState(false);


  console.log(`${isHost?"i am the host":"i am not the host"}`);
  // Initialize socket events
  useEffect(() => {
    if (!socket) return;

    // Sync play state
    const handlePlay = () => {
      setPlaying(true);
    };

    // Sync pause state
    const handlePause = () => {
      setPlaying(false);
    };

    // Sync seek position
    const handleSeek = (fraction: number) => {
      if (playerRef.current && !isHost) {
        playerRef.current.seekTo(fraction, 'fraction');
        setPlayed(fraction);
      }
    };

    // Handle video URL changes
    const handleVideoChange = (newUrl: string) => {
      setCurrentUrl(newUrl);
      setPlaying(false);
      setPlayed(0);
    };

    const handleProgressUpdate = (fraction: number) => {
      if (!isHost && playerRef.current && Math.abs(fraction - played) > 0.01) {
        playerRef.current.seekTo(fraction, 'fraction');
        setPlayed(fraction);
      }
    };


    const handleDuration = (duration: number) => {
      setDuration(duration);
      if (isHost && socket) {
        socket.emit('duration-video', roomId, duration);
      }
    };
    // Request current state when joining
    const handleStateRequest = () => {
      if (isHost) {
        socket.emit('video-state', {
          roomId,
          isPlaying: playing,
          currentTime: played * duration,
          url: currentUrl
        });
      }
    };

    // Receive initial state from host
    const handleInitialState = (state: {
      isPlaying: boolean;
      currentTime: number;
      url: string;
    }) => {
      if (!isHost) {
        setCurrentUrl(state.url);
        setPlaying(state.isPlaying);
        if (playerRef.current && duration > 0) {
          const fraction = state.currentTime / duration;
          playerRef.current.seekTo(fraction, 'fraction');
          setPlayed(fraction);
        }
      }
    };

    // Set up event listeners
    socket.on('play-video', handlePlay);
    socket.on('pause-video', handlePause);
    socket.on('seek-video', handleSeek);
    socket.on('change-video', handleVideoChange);
    socket.on('request-state', handleStateRequest);
    socket.on('receive-state', handleInitialState);
    socket.on('progress-video', handleProgressUpdate);
    socket.on('duration-video', handleDuration);
    // Join the video room
    socket.emit('join-video-room', roomId);

    // Request current state if not host
    if (!isHost && isReady) {
      socket.emit('request-state', roomId);
    }

    // Clean up
    return () => {
      socket.off('play-video', handlePlay);
      socket.off('pause-video', handlePause);
      socket.off('seek-video', handleSeek);
      socket.off('change-video', handleVideoChange);
      socket.off('request-state', handleStateRequest);
      socket.off('receive-state', handleInitialState);
    };
  }, [socket, roomId, isHost, played, duration, isReady]);

  // Handle play/pause events
  const handlePlay = () => {
    if (isHost && socket) {
      socket.emit('play-video', roomId);
      console.log('Play event emitted');
    }
  };

  const handlePause = () => {
    if (isHost && socket) {
      socket.emit('pause-video', roomId);
    }
  };

  // Handle seeking
  const handleSeek = (seconds: number) => {
    if (!duration) return;
    
    const fraction = seconds / duration;
    setPlayed(fraction);
    
    if (isHost && socket) {
      socket.emit('seek-video', roomId, fraction);
    }
  };

  // Report progress to sync with other clients
  const handleProgress = (state: { played: number, playedSeconds: number }) => {
    setPlayed(state.played);
    
    if (isHost && playing && socket) {
      socket.emit('progress-video', roomId, state.played);
    }
  };


  // Handle duration change
  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  // Handle ready state
  const handleReady = () => {
    setIsReady(true);
    if (!isHost && socket) {
      socket.emit('request-state', roomId);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`
        relative w-full min-h-[50vh] bg-black rounded-xl overflow-hidden
        shadow-lg transition-all duration-300
        ${isFullscreen ? 'fixed inset-0 z-50' : 'relative'}
      `}
    >
      <ReactPlayer
        ref={playerRef}
        url={currentUrl}
        playing={playing}
        controls={true}
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onReady={handleReady}
        progressInterval={100}
        config={{
          youtube: {
            playerVars: {
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              enablejsapi: 1
            }
          },
          file: {
            attributes: {
              controlsList: 'nodownload'
            }
          }
        }}
      />

      {/* Custom fullscreen button */}
      <button
        onClick={toggleFullscreen}
        className={`
          absolute bottom-4 right-4 p-2 rounded-full bg-black bg-opacity-50
          hover:bg-opacity-70 transition-all z-10
        `}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default VideoPlayer;