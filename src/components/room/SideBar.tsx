"use client";
import React, { useEffect, useRef, useState } from "react";
import Button from "../Buttton";
import {
  FiClock,
  FiCompass,
  FiHelpCircle,
  FiHome,
  FiMenu,
  FiSettings,
  FiVideo,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CreateRoomModal from "./Modal";
import api from "@/lib/api";
import { Room } from "@/types";
import Link from "next/link";

function SideBar() {
  const params = useParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [createRoom, setCreateRoom] = useState<boolean>(false);
    const [joinRoom, setJoinRoom] = useState<boolean>(false);
  const [rooms, setRooms] = useState<Room[]>();


  const { user } = useAuth();
  const userId = user?._id;

  useEffect(() => {
    const fetchRooms = async () => {
      const response = await api.get(`rooms/user/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const roomData = response.data.rooms;
      setRooms(roomData);

      console.log(response.data.rooms, "rooms");
    };
    fetchRooms();
  }, [user?._id]);

  console.log(userId, "user Id");

  return (
    <div>
      <motion.div
        initial={{ width: isSidebarCollapsed ? 80 : 240 }}
        animate={{ width: isSidebarCollapsed ? 80 : 240 }}
        transition={{ duration: 0.3 }}
        className={`hidden static left-0 h-full md:flex flex-col bg-gray-800 border-r border-gray-700`}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <h2 className="text-xl font-bold">WatchParty</h2>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FiMenu size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            <li>
              <a
                href="#"
                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiHome size={20} />
                {!isSidebarCollapsed && <span className="ml-3">Home</span>}
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-3 rounded-lg bg-gray-700"
              >
                <FiVideo size={20} />
                {!isSidebarCollapsed && (
                  <span className="ml-3">Current Room</span>
                )}
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiCompass size={20} />
                {!isSidebarCollapsed && <span className="ml-3">Discover</span>}
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiClock size={20} />
                {!isSidebarCollapsed && <span className="ml-3">History</span>}
              </a>
            </li>
          </ul>

          {!isSidebarCollapsed && (
            <div className="px-4 py-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">
                YOUR ROOMS
              </h3>
              <ul className="space-y-1">
                {rooms?.map((room, index) => (
                  <li>
                    <Link
                      href={`/room/${room.roomId}`}
                      className="flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        L
                      </div>
                      <span className="ml-3">{room.roomName}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div>
                <Button className="mb-2" onClick={() => setJoinRoom(true)}>Join Room</Button>
                <Button onClick={() => setCreateRoom(true)}>Create Room</Button>

                <CreateRoomModal
                  isOpen={createRoom}
                  initialRoomId=""
                  mode="create"
                  onClose={() => setCreateRoom(false)}
                />

                <CreateRoomModal
                  isOpen={joinRoom}
                  initialRoomId=""
                  mode="join"
                  onClose={() => setJoinRoom(false)} />
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <a
            href="#"
            className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FiSettings size={20} />
            {!isSidebarCollapsed && <span className="ml-3">Settings</span>}
          </a>
          <a
            href="#"
            className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FiHelpCircle size={20} />
            {!isSidebarCollapsed && <span className="ml-3">Help</span>}
          </a>
        </div>
      </motion.div>
    </div>
  );
}

export default SideBar;
