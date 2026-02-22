import React, { useState } from "react";
import { X, Search, UserPlus, UserMinus, Edit2, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import toast from "react-hot-toast";
import useChatStore from "../store/chatStore";
import useAuthStore from "../store/authStore";

const GroupSettingsModal = ({ isOpen, onClose, chat, socket }) => {
  const [groupChatName, setGroupChatName] = useState(chat.chatName);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { fetchChats, setSelectedChat } = useChatStore();

  const isAdmin = chat.groupAdmin?._id === user._id;

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
      return;
    }
    try {
      const { data } = await API.get(`/user?search=${query}`);
      setSearchResult(data);
    } catch (error) {
      console.error("Search error", error);
    }
  };

  const handleRename = async () => {
    if (!groupChatName) return;
    try {
      setLoading(true);
      const { data } = await API.put("/chat/rename", {
        chatId: chat._id,
        chatName: groupChatName,
      });
      setSelectedChat(data);
      fetchChats();
      socket?.emit("update group", data);
      toast.success("Group renamed!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to rename");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userToAdd) => {
    if (chat.users.find((u) => u._id === userToAdd._id)) {
      toast.error("User already in group");
      return;
    }
    try {
      setLoading(true);
      const { data } = await API.put("/chat/groupadd", {
        chatId: chat._id,
        userId: userToAdd._id,
      });
      setSelectedChat(data);
      fetchChats();
      socket?.emit("update group", data);
      toast.success("User added!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userToRemove) => {
    try {
      setLoading(true);
      const { data } = await API.put("/chat/groupremove", {
        chatId: chat._id,
        userId: userToRemove._id,
      });
      setSelectedChat(data);
      fetchChats();
      socket?.emit("update group", data);
      socket?.emit("user kicked", { chatId: chat._id, userId: userToRemove._id });
      toast.success("User removed!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove user");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      try {
        setLoading(true);
        const { data } = await API.put("/chat/leave", { chatId: chat._id });
        socket?.emit("update group", chat); // Notify others with old chat data so they find room
        setSelectedChat(null);
        fetchChats();
        onClose();
        toast.success("You left the group");
      } catch (error) {
        toast.error("Failed to leave group");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100"
          >
            <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-50">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Group Settings</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="size-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
              {/* Rename Section */}
              {isAdmin ? (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Group Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:border-primary-500 transition-all font-medium"
                      value={groupChatName}
                      onChange={(e) => setGroupChatName(e.target.value)}
                    />
                    <button
                      onClick={handleRename}
                      disabled={loading}
                      className="size-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all"
                    >
                      <Edit2 className="size-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-slate-900">{chat.chatName}</h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Only admins can rename</p>
                </div>
              )}

              {/* Members Section */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">Members ({chat.users.length})</label>
                <div className="space-y-2">
                  {chat.users.map((u) => (
                    <div key={u._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} className="size-9 rounded-xl object-cover" alt="" />
                        <div>
                          <p className="font-bold text-sm text-slate-900">{u.name}</p>
                          {chat.groupAdmin?._id === u._id && (
                            <span className="text-[10px] font-bold text-primary-600 uppercase">Admin</span>
                          )}
                        </div>
                      </div>
                      {isAdmin && u._id !== user._id && (
                        <button
                          onClick={() => handleRemoveUser(u)}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <UserMinus className="size-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Users Section (Admin only) */}
              {isAdmin && (
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 ml-1">Add New Members</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary-500 focus:bg-white transition-all text-slate-900 font-medium"
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {searchResult.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => handleAddUser(u)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-all text-left"
                      >
                        <div className="flex items-center gap-3">
                          <img src={u.avatar} className="size-8 rounded-lg" alt="" />
                          <p className="font-bold text-sm text-slate-900">{u.name}</p>
                        </div>
                        <UserPlus className="size-4 text-primary-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Leave Group Button */}
              <button
                onClick={handleLeaveGroup}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-[1.5rem] bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-all mt-4 border border-red-100"
              >
                <LogOut className="size-5" /> Leave Group
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GroupSettingsModal;
