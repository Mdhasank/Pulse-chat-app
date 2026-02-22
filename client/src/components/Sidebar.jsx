import React, { useState } from "react";
import { Search, LogOut, Settings, MessageSquare, PlusCircle, Users } from "lucide-react";
import useAuthStore from "../store/authStore";
import useChatStore from "../store/chatStore";
import API from "../api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import GroupChatModal from "./GroupChatModal.jsx";
import NewChatModal from "./NewChatModal.jsx";
import ProfileModal from "./ProfileModal.jsx";

const Sidebar = ({ socket }) => {
  const { user, logout } = useAuthStore();
  const { chats, setSelectedChat, selectedChat, fetchChats, onlineUsers } = useChatStore();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const { data } = await API.get(`/user?search=${query}`);
      setSearchResult(data);
    } catch (error) {
      console.error("Search error", error);
    }
  };

  const accessChat = async (userId) => {
    try {
      const { data } = await API.post("/chat", { userId });
      if (!chats.find((c) => c._id === data._id)) fetchChats();
      setSelectedChat(data);
      setSearch("");
      setSearchResult([]);
      setIsSearching(false);
      toast.success("Joined conversation");
    } catch (error) {
      console.error("Error accessing chat", error);
      toast.error("Failed to access chat");
    }
  };

  const getChatName = (chat) => {
    if (chat.isGroupChat) return chat.chatName;
    const otherUser = chat.users.find((u) => u._id !== user._id);
    return otherUser ? otherUser.name : "Unknown User";
  };

  const isOnline = (chat) => {
    if (chat.isGroupChat) return false;
    const otherUser = chat.users.find((u) => u._id !== user._id);
    return otherUser && onlineUsers.includes(otherUser._id);
  };

  return (
    <>
      <div className="w-full h-full flex flex-col bg-slate-50 overflow-hidden">
        {/* App Header */}
        <div className="p-6 pb-2 flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20">
              <MessageSquare className="size-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Chats</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              title="New Chat"
              className="p-2 hover:bg-slate-200/50 rounded-xl transition-colors text-slate-600 group"
            >
              <PlusCircle className="size-6 group-hover:text-primary-600" />
            </button>
            <button
              onClick={() => setIsGroupModalOpen(true)}
              title="New Group"
              className="p-2 hover:bg-slate-200/50 rounded-xl transition-colors text-slate-600 group"
            >
              <Users className="size-6 group-hover:text-primary-600" />
            </button>
          </div>
        </div>

        {/* Profile & Search area */}
        <div className="px-6 space-y-4 mb-4">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 size-5 transition-colors" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-slate-200/40 border-none rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all text-sm font-medium"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-hide">
          <AnimatePresence mode="popLayout">
            {isSearching ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-1 p-2"
              >
                <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-2">Search Results</p>
                {searchResult.length > 0 ? (
                  searchResult.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => accessChat(u._id)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-sm transition-all text-left"
                    >
                      <img src={u.avatar} className="size-11 rounded-2xl object-cover" alt="" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-[15px]">{u.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">Click to chat</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-6 text-center">
                    <p className="text-sm font-medium text-slate-400">No users found for "{search}"</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try searching for a different name or email</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1"
              >
                {chats.length > 0 ? (
                  chats.map((chat) => (
                    <button
                      key={chat._id}
                      onClick={() => setSelectedChat(chat)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group ${selectedChat?._id === chat._id
                        ? "bg-white shadow-xl shadow-slate-200/50"
                        : "hover:bg-slate-200/30"
                        }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={chat.isGroupChat ? "https://cdn-icons-png.flaticon.com/512/166/166258.png" : chat.users.find(u => u._id !== user._id)?.avatar}
                          className="size-12 rounded-[1.25rem] object-cover ring-2 ring-transparent group-hover:ring-primary-100 transition-all"
                          alt=""
                        />
                        {isOnline(chat) && (
                          <div className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <h3 className="font-bold text-slate-900 truncate text-[15px]">
                            {getChatName(chat)}
                          </h3>
                          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
                            {chat.latestMessage ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "New"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className={`text-xs truncate font-medium ${selectedChat?._id === chat._id ? 'text-slate-600' : 'text-slate-500'}`}>
                            {chat.latestMessage ? chat.latestMessage.content : "Start a conversation"}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center bg-white/50 rounded-3xl mx-3 mt-4">
                    <div className="size-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="size-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">No chats yet</p>
                    <p className="text-xs text-slate-500 mt-1">Search for a user to start chatting or create a group.</p>
                    <div className="mt-6 space-y-2">
                      <button
                        onClick={() => setIsNewChatModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-700 transition-all"
                      >
                        <PlusCircle className="size-4" /> Start New Chat
                      </button>
                      <button
                        onClick={() => setIsGroupModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 transition-all"
                      >
                        <Users className="size-4" /> Create Group
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Footer */}
        <div className="p-4 bg-white/50 border-t border-slate-200/60 flex items-center justify-between">
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-100/80 p-1.5 rounded-2xl transition-all"
          >
            <img src={user.avatar} className="size-10 rounded-xl" alt="" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">{user.name}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <Settings className="size-5" />
            </button>
            <button onClick={logout} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500">
              <LogOut className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <GroupChatModal socket={socket} isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />
      <NewChatModal isOpen={isNewChatModalOpen} onClose={() => setIsNewChatModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
};

export default Sidebar;
