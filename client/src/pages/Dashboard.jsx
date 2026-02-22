import React, { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import useChatStore from "../store/chatStore";
import useAuthStore from "../store/authStore";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const ENDPOINT = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const { user } = useAuthStore();
  const { fetchChats, selectedChat, setSelectedChat, fetchMessages, addMessage } = useChatStore();
  const [socketConnected, setSocketConnected] = useState(false);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io(ENDPOINT);
    socket.current.emit("setup", user);
    socket.current.on("connected", () => setSocketConnected(true));

    return () => {
      socket.current?.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!socket.current) return;

    const handleMessageReceived = (newMessageReceived) => {
      const currentSelectedChat = useChatStore.getState().selectedChat;
      if (!currentSelectedChat || currentSelectedChat._id !== newMessageReceived.chat._id) {
        // Handle notification
      } else {
        addMessage(newMessageReceived);
      }
    };

    const handleGroupCreated = () => {
      fetchChats();
    };

    const handleKicked = (chatId) => {
      const currentSelectedChat = useChatStore.getState().selectedChat;
      if (currentSelectedChat && currentSelectedChat._id === chatId) {
        setSelectedChat(null);
        toast.error("You have been removed from the group", { id: "kicked-toast" }); // Unique ID to avoid duplicates
      }
      fetchChats();
    };

    const handleOnlineUsers = (users) => {
      useChatStore.getState().setOnlineUsers(users);
    };

    socket.current.on("message received", handleMessageReceived);
    socket.current.on("group created", handleGroupCreated);
    socket.current.on("group updated", handleGroupCreated);
    socket.current.on("kicked from group", handleKicked);
    socket.current.on("get-online-users", handleOnlineUsers);

    return () => {
      socket.current?.off("message received", handleMessageReceived);
      socket.current?.off("group created", handleGroupCreated);
      socket.current?.off("group updated", handleGroupCreated);
      socket.current?.off("kicked from group", handleKicked);
      socket.current?.off("get-online-users", handleOnlineUsers);
    };
  }, [addMessage, fetchChats]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (selectedChat && socket.current) {
      fetchMessages(selectedChat._id);
      socket.current.emit("join chat", selectedChat._id);
    }
  }, [selectedChat, fetchMessages]);

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden relative">
      {/* Sidebar Shell - Hidden on mobile when a chat is selected */}
      <aside className={`w-full md:w-80 lg:w-96 border-r border-slate-200/60 transition-all duration-300 ${selectedChat ? "hidden md:flex" : "flex"}`}>
        <Sidebar socket={socket.current} />
      </aside>

      {/* Main Chat Area - Hidden on mobile when no chat is selected */}
      <main className={`flex-1 flex flex-col bg-white relative transition-all duration-300 ${selectedChat ? "flex" : "hidden md:flex"}`}>
        <AnimatePresence mode="wait">
          {selectedChat ? (
            <motion.div
              key={selectedChat._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col"
            >
              <ChatWindow socket={socket.current} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8"
            >
              <div className="size-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
                <div className="size-12 bg-slate-200 rounded-2xl animate-pulse-subtle" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Select a conversation</h2>
              <p className="max-w-xs text-center leading-relaxed">
                Connect with your friends instantly. Pick a contact from the sidebar to start chatting.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
