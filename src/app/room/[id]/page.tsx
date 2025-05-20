"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiX,
  FiUsers,
  FiMessageSquare,
  FiYoutube,
  FiHome,
  FiCompass,
  FiClock,
  FiSettings,
  FiHelpCircle,
  FiMenu,
  FiVideo,
  FiMic,
  FiMicOff,
  FiVideoOff,
  FiPhone,
} from "react-icons/fi";
import { FaYoutube, FaFacebook, FaTiktok } from "react-icons/fa";
import { SiNetflix } from "react-icons/si";
import Header from "@/components/Header";
import Button from "@/components/Buttton";
import Modal from "@/components/Modal";
import SideBar from "@/components/room/SideBar";
import CreateRoomModal from "@/components/room/Modal";
import Chat from "@/components/room/Chat";
import { useAuth } from "@/context/AuthContext";
import CopyText from "@/components/room/CopyId";

const VideoPlayer = dynamic(
  () => import("../../../components/room/Videoplayer"),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading player...</div>
      </div>
    ),
  }
);

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
  const [activeSource, setActiveSource] = useState<
    "youtube" | "facebook" | "tiktok" | "netflix" | "fmovies"
  >("youtube");
  const [createRoom, setCreateRoom] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const mockSession = {
    user: {
      id: "123",
      username: user?.username || "Guest",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      email: "johndoe@example.com",
    },
  };

  const mockRoom = {
    username: "Linux Watch Party",
    host: { id: "123" },
    currentVideo: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      // Mock search results
      const mockResults: VideoSource[] = [
        {
          id: "LXb3EKWsInQ",
          title: "Linux in 100 Seconds",
          thumbnail: "https://i.ytimg.com/vi/LXb3EKWsInQ/hqdefault.jpg",
          duration: "2:43",
          source: "youtube",
          url: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
        },
        {
          id: "facebook123",
          title: "Linux Tutorial for Beginners",
          thumbnail: "https://via.placeholder.com/150",
          duration: "10:15",
          source: "facebook",
          url: "https://facebook.com/watch/?v=123456",
        },
        {
          id: "tiktok123",
          title: "Quick Linux Tips",
          thumbnail: "https://via.placeholder.com/150",
          duration: "0:45",
          source: "tiktok",
          url: "https://tiktok.com/@user/video/123456",
        },
        {
          id: "netflix123",
          title: "Abstract: The Art of Design",
          thumbnail: "https://via.placeholder.com/150",
          duration: "45:00",
          source: "netflix",
          url: "https://netflix.com/watch/123456",
        },
        {
          id: "fmovies123",
          title: "The Social Dilemma",
          thumbnail: "https://via.placeholder.com/150",
          duration: "1:34:00",
          source: "fmovies",
          url: "https://fmovies.to/movie/the-social-dilemma-12345",
        },
      ];

      setSearchResults(
        mockResults.filter((result) =>
          activeSource === "youtube" ? result.source === "youtube" : true
        )
      );
    } catch (error) {
      console.error("Search error:", error);
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
      case "youtube":
        return <FaYoutube className="text-red-500" />;
      case "facebook":
        return <FaFacebook className="text-blue-600" />;
      case "tiktok":
        return <FaTiktok className="text-black dark:text-white" />;
      case "netflix":
        return <SiNetflix className="text-red-600" />;
      default:
        return <FiVideo className="text-gray-400" />;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
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
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6 h-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Video and Controls - Takes 2/3 on large screens */}
                <div className="lg:col-span-2 flex flex-col h-full">
                  {/* Video Player */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-2xl"
                  >
                    <VideoPlayer
                      url={videoUrl}
                      roomId={roomId}
                      isHost={mockSession.user?.id === mockRoom.host.id}
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
                          {isMuted ? (
                            <FiMicOff size={20} />
                          ) : (
                            <FiMic size={20} />
                          )}
                        </button>
                        <button
                          onClick={toggleVideo}
                          className={`p-3 rounded-full ${
                            isVideoOff ? "bg-red-500" : "bg-gray-700/90"
                          } backdrop-blur-sm hover:bg-opacity-80 transition-all`}
                        >
                          {isVideoOff ? (
                            <FiVideoOff size={20} />
                          ) : (
                            <FiVideo size={20} />
                          )}
                        </button>
                        <button
                          onClick={toggleCall}
                          className="p-3 rounded-full bg-red-500/90 backdrop-blur-sm hover:bg-red-600 transition-all"
                        >
                          <FiPhone size={20} />
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                  <div className="bg-white/10  gap-3 my-3 rounded-sm flex items-center p-3">
                    <p>Share this room with your friends:
                    </p>
                  <CopyText text={` ${roomId}`} />
                  </div>

                  {/* Video Source Tabs */}
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                      "youtube",
                      "facebook",
                      "tiktok",
                      "netflix",
                      "fmovies",
                    ].map((source) => (
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
                    className="mt-4 bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg"
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

                {/* Chat Section - Takes 1/3 on large screens */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="hidden lg:flex flex-col h-full"
                >
                  <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg h-full flex flex-col">
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <FiMessageSquare /> Room Chat
                      </h3>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <Chat roomId={roomId} userId={mockSession.user?.id} />
                    </div>

                    {/* Call Controls */}
                    <div className="p-4 border-t border-gray-700">
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
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </main>
        </div>

        {/* Mobile Chat Toggle */}
        <div className="lg:hidden fixed bottom-6 right-6 z-10">
          <button
            onClick={() => setIsCallActive(!isCallActive)}
            className={`p-4 rounded-full shadow-xl ${
              isCallActive ? "bg-red-600" : "bg-blue-600"
            } text-white transition-all hover:scale-105`}
          >
            {isCallActive ? <FiX size={24} /> : <FiMessageSquare size={24} />}
          </button>
        </div>

        {/* Mobile Chat Panel */}
        <AnimatePresence>
          {isCallActive && (
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
                    onClick={() => setIsCallActive(false)}
                    className="p-2 rounded-full hover:bg-gray-700"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Chat roomId={roomId} userId={mockSession.user?.id} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Room Modal */}
        <CreateRoomModal
          isOpen={createRoom}
          onClose={() => setCreateRoom(false)}
          userId={user?.id as string}
        />
      </div>
    </>
  );
};

export default RoomPage;
