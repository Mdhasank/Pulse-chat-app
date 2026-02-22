import React, { useState } from "react";
import { X, Search, MessageSquare, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import useChatStore from "../store/chatStore";
import toast from "react-hot-toast";


const NewChatModal = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState("");
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setSelectedChat, fetchChats, chats } = useChatStore();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setResult([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.get(`/user?search=${query}`);
      setResult(data);
    } catch (error) {
      console.error("Search error", error);
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      const { data } = await API.post("/chat", { userId });
      if (!chats.find((c) => c._id === data._id)) fetchChats();
      setSelectedChat(data);
      toast.success("Joined conversation");
      onClose();
    } catch (error) {
      console.error("Error accessing chat", error);
      toast.error("Failed to join conversation");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100"
          >
            <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-50">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">New Conversation</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="size-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 pb-10 space-y-6">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 size-6" />
                <input
                  type="text"
                  placeholder="Enter name or email..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-5 pl-14 pr-4 outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all text-slate-900 font-medium text-lg"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2 min-h-[300px] max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-48 space-y-4">
                    <div className="size-10 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin" />
                    <p className="text-sm font-medium text-slate-400">Searching Pulse network...</p>
                  </div>
                ) : result.length > 0 ? (
                  result.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => accessChat(u._id)}
                      className="w-full flex items-center justify-between p-5 rounded-[2rem] hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <img src={u.avatar} className="size-14 rounded-2xl object-cover shadow-sm" alt="" />
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{u.name}</h3>
                          <p className="text-sm text-slate-500 font-medium">{u.email}</p>
                        </div>
                      </div>
                      <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-all">
                        <ArrowRight className="size-5 text-slate-400 group-hover:text-white" />
                      </div>
                    </button>
                  ))
                ) : search ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center">
                    <p className="text-slate-400 font-medium">No users found for "{search}"</p>
                    <p className="text-xs text-slate-400 mt-1">Make sure the email is spelled correctly.</p>
                  </div>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-center p-8">
                    <div className="size-16 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-4">
                      <MessageSquare className="size-8 text-slate-200" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-[10px]">Pulse Network Search</p>
                    <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                      Search for anyone on the Pulse network by their name or email address to start a private conversation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewChatModal;
