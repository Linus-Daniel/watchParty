'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import { useSocket } from '@/context/socketContext';

interface VideoPlayerProps {
  url: string;
  roomId: string;
  isHost: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, roomId, isHost }) => {
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const playHandler = () => setPlaying(true);
    const pauseHandler = () => setPlaying(false);
    const seekHandler = (time: number) => {
      if (playerRef.current) {
        playerRef.current.seekTo(time, 'fraction');
        setPlayed(time);
      }
    };

    socket.on('play', playHandler);
    socket.on('pause', pauseHandler);
    socket.on('seek', seekHandler);

    return () => {
      socket.off('play', playHandler);
      socket.off('pause', pauseHandler);
      socket.off('seek', seekHandler);
    };
  }, [socket]);

  const handlePlay = () => isHost && socket?.emit('play');
  const handlePause = () => isHost && socket?.emit('pause');
  const handleSeek = (seconds: number) => isHost && socket?.emit('seek', seconds);
  const handleProgress = (state: { played: number }) => {
    setPlayed(state.played);
    if (isHost) socket?.emit('progress', state.played);
  };

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
        url={url}
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
        config={{
          youtube: {
            playerVars: {
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
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

      {/* Custom play/pause indicator */}
      {/* <AnimatePresence>
        {playing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-black bg-opacity-50 rounded-full p-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-black bg-opacity-50 rounded-full p-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </div>
  );
};

export default VideoPlayer;