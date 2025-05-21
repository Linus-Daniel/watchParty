"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiX, FiVideo, FiMic, FiMicOff, FiVideoOff, FiPhone, FiSend } from "react-icons/fi";
import { FaYoutube, FaFacebook, FaTiktok } from "react-icons/fa";
import { SiNetflix } from "react-icons/si";
import Header from "@/components/Header";
import Chat from "@/components/room/Chat";
import { useAuth } from "@/context/AuthContext";
import CopyText from "@/components/room/CopyId";
import api from "@/lib/api";
import { Room, User } from "@/types";
import { useSocket } from "@/context/socketContext";
import VideoChatRoom from "@/components/room/VideoChatRoom";

const VideoPlayer = dynamic(() => import("@/components/room/Videoplayer"), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading player...</div>
    </div>
  ),
});

interface VideoSource {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  source: "youtube" | "facebook" | "tiktok" | "netflix" | "fmovies" | "other";
  url: string;
}

const RoomPage: React.FC = () => {
  const params = useParams();
  const roomId = params.id as string;
  const { user } = useAuth();
  const [videoUrl, setVideoUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<VideoSource[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const {socket} = useSocket()
  const [activeSource, setActiveSource] = useState<
    "youtube" | "facebook" | "tiktok" | "netflix" | "fmovies"
  >("youtube");
  const [room, setRoom] = useState<Room>();
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  const mockSession = {
    user: {
      id: "123",
      username: user?.name || "Guest",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      email: "johndoe@example.com",
    },
  };


  // useEffect(() => {
  //   if (!isConnected || !socket || !roomId) return;

  //   socket.emit('joinRoom', roomId);

  //   return () => {
  //     socket.emit('leaveRoom', roomId);
  //   };
  // }, [socket, isConnected, roomId]);


  const mockRoom = {
    username: "Linux Watch Party",
    host: { id: "123" },
    currentVideo: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
  };


  useEffect(() => {
    const fetchRoomData = async () => {
      // Fetch room data from API
      const response = await api.get(`/rooms/${roomId}`);
      setRoom(response.data.room);
    };

    fetchRoomData();
  },[roomId,socket]);



  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      // Mock search results would be replaced with actual API call
      const mockResults: VideoSource[] = [
        {
          id: "LXb3EKWsInQ",
          title: "Linux in 100 Seconds",
          thumbnail: "https://i.ytimg.com/vi/LXb3EKWsInQ/hqdefault.jpg",
          duration: "2:43",
          source: "youtube",
          url: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
        },
        // ... other mock results
      ];

      setSearchResults(mockResults);
    } catch (error) {
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectVideo = (url: string) => {
    setVideoUrl(url);
    setSearchQuery("");
    setSearchResults([]);
  };
  const toggleCall = () => setIsCallActive(!isCallActive);
  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOff(!isVideoOff);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "youtube": return <FaYoutube className="text-red-500" />;
      case "facebook": return <FaFacebook className="text-blue-600" />;
      case "tiktok": return <FaTiktok className="text-black dark:text-white" />;
      case "netflix": return <SiNetflix className="text-red-600" />;
      default: return <FiVideo className="text-gray-400" />;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setVideoUrl(mockRoom.currentVideo);
  }, []);

  return (
    <>
      <Head>
        <title>{mockRoom.username} - WatchParty</title>
      </Head>

      <div className="flex flex-col h-screen bg-gray-900 text-white">
        
        <div className="flex flex-1 overflow-hidden">
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6 h-full">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                {/* Video and Controls - Takes 3/4 on large screens */}
                <div className="lg:col-span-3 flex flex-col h-full space-y-4">
                  {/* Video Player */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative aspect-video bg-gray-800 rounded-xl h-fit overflow-hidden shadow-2xl"
                  >
                    <VideoPlayer
                      url={room?.videoUrl as string}
                      roomId={roomId}
                      isHost={room?.creator._id === user?._id}
                    />

                    {/* Call Controls */}
                    {isCallActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute bottom-4 left-0 right-0 flex justify-center gap-3"
                      >
                        <button
                          onClick={toggleMute}
                          className={`p-3 rounded-full ${
                            isMuted ? "bg-red-500" : "bg-gray-700/90"
                          } backdrop-blur-sm hover:bg-opacity-80 transition-all`}
                        >
                          {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
                        </button>
                        <button
                          onClick={toggleVideo}
                          className={`p-3 rounded-full ${
                            isVideoOff ? "bg-red-500" : "bg-gray-700/90"
                          } backdrop-blur-sm hover:bg-opacity-80 transition-all`}
                        >
                          {isVideoOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
                        </button>
                        <button
                          onClick={toggleCall}
                          className="p-3 rounded-full bg-red-500/90 backdrop-blur-sm hover:bg-red-600 transition-all"
                        >
                          <FiPhone size={20} />
                        </button>
                      </motion.div>


                    )}

                    {/* <Controls  /> */}
                  </motion.div>

                  {/* Room Sharing */}
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
                    <p className="text-gray-300">Share this room with friends:</p>
                    <CopyText text={roomId} />
                  </div>

                  {/* Video Source Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {["youtube", "facebook", "tiktok", "netflix", "fmovies"].map((source) => (
                      <button
                        key={source}
                        onClick={() => setActiveSource(source as any)}
                        className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                          activeSource === source
                            ? "bg-blue-600 shadow-lg"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                      >
                        {getSourceIcon(source)}
                        <span className="ml-2 capitalize">{source}</span>
                      </button>
                    ))}
                  </div>

                  {/* Search Bar */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg"
                  >
                    <div className="relative" ref={searchRef}>
                      <form onSubmit={handleSearch} className="flex">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {getSourceIcon(activeSource)}
                          </div>
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search ${activeSource} videos...`}
                            className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSearching}
                          className={`px-4 py-3 rounded-r-lg transition-all ${
                            isSearching
                              ? "bg-blue-700 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          {isSearching ? "Searching..." : "Search"}
                        </button>
                      </form>

                      <AnimatePresence>
                        {searchResults.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-10 mt-2 w-full bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden"
                          >
                            <div className="max-h-96 overflow-y-auto">
                              {searchResults.map((video) => (
                                <div
                                  key={`${video.source}-${video.id}`}
                                  onClick={() => handleSelectVideo(video.url)}
                                  className="flex p-3 hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0"
                                >
                                  <div className="relative flex-shrink-0">
                                    <img
                                      src={video.thumbnail}
                                      alt={video.title}
                                      className="w-24 h-16 object-cover rounded"
                                    />
                                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                                      {video.duration}
                                    </div>
                                  </div>
                                  <div className="ml-3 overflow-hidden">
                                    <h3 className="text-sm font-medium truncate">
                                      {video.title}
                                    </h3>
                                    <div className="flex items-center mt-1">
                                      {getSourceIcon(video.source)}
                                      <p className="text-xs text-gray-400 ml-1 capitalize">
                                        {video.source}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>

                {/* Chat Section - Takes 1/4 on large screens */}
                <div className="lg:flex flex-col hidden h-full">
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg h-full flex flex-col">
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <FiMessageSquare /> Room Chat
                      </h3>
                    </div>
                    
                    {/* Chat container with fixed height that doesn't scroll */}
                    <div className="flex-1 min-h-0"> {/* Key change here */}
                      <VideoChatRoom roomId={roomId} userId={user?._id as string}  />
                      <Chat 
                        roomId={roomId} 
                        userData={user as User}
                        userId={user?._id as string}
                        className="h-1/2" 
                      />

                    </div>

                    {/* <div className="p-4 border-t border-gray-700">
                      <VideoChatModal roomId={roomId} userId={user?._id as string} key={Math.random()} />
                      <button
                        onClick={toggleCall}
                        className={`w-full py-3 rounded-lg flex items-center justify-center transition-all ${
                          isCallActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {isCallActive ? (
                          <>
                            <FiPhone className="mr-2" />
                            End Call
                          </>
                        ) : (
                          <>
                            <FiVideo className="mr-2" />
                            Start Video Call
                          </>
                        )}
                      </button>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Mobile Chat Toggle */}
        <button
          onClick={() => setMobileChatOpen(!mobileChatOpen)}
          className={`lg:hidden fixed bottom-6 right-6 z-10 p-4 rounded-full shadow-xl ${
            mobileChatOpen ? "bg-red-600" : "bg-blue-600"
          } text-white transition-all hover:scale-105`}
        >
          {mobileChatOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
        </button>

        {/* Mobile Chat Panel */}
        <AnimatePresence>
          {mobileChatOpen && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="lg:hidden fixed inset-0 z-20 bg-gray-800 pt-16"
            >
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Room Chat</h3>
                  <button
                    onClick={() => setMobileChatOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-700"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <div className="flex-1 min-h-0">
                  <Chat 
                    roomId={roomId} 
                    userId={user?._id as string}
                    userData={user as User}
                    className="h-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

    
      </div>
    </>
  );
};

export default RoomPage;