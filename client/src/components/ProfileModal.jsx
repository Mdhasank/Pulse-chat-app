import React, { useState } from "react";
import { X, User, Mail, Save, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../store/authStore";
import API from "../api";
import toast from "react-hot-toast";

const AVATAR_STYLES = [
  { id: "initials", name: "Initials", label: "Abc" },
  { id: "avataaars", name: "Human", label: "👤" },
  { id: "bottts", name: "Robot", label: "🤖" },
  { id: "adventurer", name: "Adventure", label: "🧗" },
  { id: "pixel-art", name: "Pixel", label: "👾" },
  { id: "notionists", name: "Notion", label: "🖋️" },
];

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser, logout } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [loading, setLoading] = useState(false);

  // Determine current style from avatar URL
  const getInitialStyle = () => {
    if (avatar.includes("ui-avatars.com")) return "initials";
    const match = avatar.match(/dicebear\.com\/7\.x\/([^/]+)/);
    return match ? match[1] : "initials";
  };

  const [selectedStyle, setSelectedStyle] = useState(getInitialStyle());

  const generateAvatarUrl = (style, userName) => {
    const seed = encodeURIComponent(userName || "PulseUser");
    if (style === "initials") {
      return `https://ui-avatars.com/api/?name=${seed}&background=0D9488&color=fff&bold=true&size=512`;
    }
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=f8fafc`;
  };

  const handleStyleSelect = (styleId) => {
    setSelectedStyle(styleId);
    setAvatar(generateAvatarUrl(styleId, name));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");

    const finalAvatar = generateAvatarUrl(selectedStyle, name);

    try {
      setLoading(true);
      const { data } = await API.put("/user/profile", { name, avatar: finalAvatar });
      setUser(data);
      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
          >
            {/* Header - Fixed */}
            <div className="p-6 md:p-8 pb-4 flex justify-between items-center border-b border-slate-50 shrink-0">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Profile</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="size-6 text-slate-400" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
              <form onSubmit={handleUpdate} className="space-y-8">
                {/* Avatar Preview Section */}
                <div className="flex flex-col items-center gap-6">
                  <div className="size-36 rounded-[2.5rem] overflow-hidden ring-8 ring-slate-50 relative bg-slate-50 shadow-inner flex items-center justify-center">
                    <img
                      src={avatar || generateAvatarUrl(selectedStyle, name)}
                      alt="Avatar"
                      className="size-full object-contain"
                    />
                  </div>

                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avatar Style</p>
                      <p className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full uppercase">Dynamic</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {AVATAR_STYLES.map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => handleStyleSelect(style.id)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-3xl border-2 transition-all group ${selectedStyle === style.id
                              ? "bg-primary-50 border-primary-500 shadow-md shadow-primary-500/10"
                              : "bg-slate-50 border-transparent hover:bg-white hover:border-slate-200"
                            }`}
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">{style.label}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-tight ${selectedStyle === style.id ? "text-primary-700" : "text-slate-500"
                            }`}>
                            {style.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Display Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary-500 transition-all font-medium"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          // Silently update preview if it's name-dependent styles
                          setAvatar(generateAvatarUrl(selectedStyle, e.target.value));
                        }}
                        placeholder="Pulse User"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 opacity-60">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email (Read-only)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                      <input
                        type="email"
                        className="w-full bg-slate-100 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 cursor-not-allowed font-medium"
                        value={user?.email}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary-600/20 hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="size-5" />
                    {loading ? "Updating..." : "Update Profile"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-100"
                  >
                    <LogOut className="size-5" />
                    Logout
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
