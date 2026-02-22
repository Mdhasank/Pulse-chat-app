import React, { useState } from "react";
import { X, Search, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import toast from "react-hot-toast";
import useChatStore from "../store/chatStore";

const GroupChatModal = ({ isOpen, onClose, socket }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const { fetchChats } = useChatStore();

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

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      toast.error("User already added");
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post("/chat/group", {
        name: groupChatName,
        users: JSON.stringify(selectedUsers.map((u) => u._id)),
      });
      socket?.emit("new group", data);
      fetchChats();
      onClose();
      toast.success("New Group Chat Created!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to Create the Chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100"
          >
            <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-50">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Group Chat</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="size-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">Group Name</label>
                <input
                  type="text"
                  placeholder="The Pulse Squad"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-4 outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all text-slate-900 font-medium"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">Add Users</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary-500 focus:bg-white transition-all text-slate-900 font-medium"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Selected Users */}
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((u) => (
                  <div key={u._id} className="bg-primary-50 text-primary-700 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold border border-primary-100 uppercase tracking-wide">
                    {u.name}
                    <button onClick={() => handleDelete(u)}><X className="size-3" /></button>
                  </div>
                ))}
              </div>

              {/* Search Result */}
              <div className="max-h-40 overflow-y-auto space-y-2 scrollbar-hide">
                {searchResult?.slice(0, 4).map((u) => (
                  <button
                    key={u._id}
                    onClick={() => handleGroup(u)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} className="size-9 rounded-lg" alt="" />
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    <UserPlus className="size-4 text-primary-600" />
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || selectedUsers.length < 2}
                className="btn-primary w-full py-4 text-lg mt-4 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Group Chat"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GroupChatModal;
