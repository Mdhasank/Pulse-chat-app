import React, { useState, useEffect, useRef } from "react";
import { Send, Image, Smile, Paperclip, Phone, Video, Info, MoreHorizontal, Check, CheckCheck, Plus, ArrowLeft } from "lucide-react";
import useChatStore from "../store/chatStore";
import useAuthStore from "../store/authStore";
import API from "../api";
import { motion, AnimatePresence } from "framer-motion";
import GroupSettingsModal from "./GroupSettingsModal.jsx";

const ChatWindow = ({ socket }) => {
  const { user } = useAuthStore();
  const { selectedChat, setSelectedChat, messages, addMessage, fetchMessages, onlineUsers } = useChatStore();
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef();
  const emojiPickerRef = useRef();

  const emojis = ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😕", "😟", "🙁", "☹️", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️", "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🙈", "🙉", "🙊", "💋", "💌", "💘", "💝", "💖", "💗", "💓", "💞", "💕", "💟", "❣️", "💔", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "🔥", "✨", "🌟", "⭐", "🌈", "☁️", "☀️", "💧", "💦", "💨", "🌊", "🎃", "🎄", "🎆", "🎇", "🧨", "✨", "🎈", "🎉", "🎊", "🎋", "🎍", "🎎", "🎏", "🎐", "🎑", "🧧", "🎁", "🎫", "🎟️", "🏅", "🏆", "🎖️", "🎗️"];

  const handleEmojiClick = (emoji) => {
    setNewMessage((prev) => prev + emoji);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isOtherUserOnline = () => {
    if (!selectedChat || selectedChat.isGroupChat) return false;
    const otherUser = selectedChat.users.find((u) => u._id !== user._id);
    return otherUser && onlineUsers.includes(otherUser._id);
  };

  useEffect(() => {
    if (!socket || !selectedChat) return;
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    return () => {
      socket.off("typing");
      socket.off("stop typing");
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!selectedChat) return null;

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socket.emit("stop typing", selectedChat._id);
    setTyping(false);

    try {
      const { data } = await API.post("/message", {
        content: newMessage,
        chatId: selectedChat._id,
      });
      setNewMessage("");
      socket.emit("new message", data);
      addMessage(data);
    } catch (error) {
      console.error("Message send error", error);
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= 3000 && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, 3000);
  };

  const getChatName = () => {
    if (selectedChat.isGroupChat) return selectedChat.chatName;
    return selectedChat.users.find((u) => u._id !== user._id)?.name;
  };

  const getOtherUser = () => {
    return selectedChat.users.find((u) => u._id !== user._id);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Dynamic Header */}
      <header className="px-4 md:px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white/70 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setSelectedChat(null)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 -ml-2"
          >
            <ArrowLeft className="size-6" />
          </button>
          <div className="relative">
            <img
              src={selectedChat.isGroupChat ? "https://cdn-icons-png.flaticon.com/512/166/166258.png" : getOtherUser()?.avatar}
              className="size-11 rounded-2xl object-cover ring-2 ring-transparent"
              alt=""
            />
            {isOtherUserOnline() && (
              <div className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-[17px] text-slate-900 leading-tight">{getChatName()}</h3>
            <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${isTyping || isOtherUserOnline() ? "text-primary-600" : "text-slate-400"}`}>
              {isTyping ? "typing..." : isOtherUserOnline() ? "Online" : selectedChat.isGroupChat ? `${selectedChat.users.length} members` : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <HeaderAction icon={<Phone className="size-5" />} />
          <HeaderAction icon={<Video className="size-5" />} />
          <div className="w-px h-6 bg-slate-100 mx-2" />
          {selectedChat.isGroupChat && (
            <HeaderAction
              onClick={() => setIsSettingsOpen(true)}
              icon={<MoreHorizontal className="size-5" />}
            />
          )}
        </div>
      </header>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 scrollbar-hide">
        {messages.map((m, i) => {
          if (m.type === "system") {
            return (
              <div key={m._id} className="flex justify-center my-4">
                <div className="bg-slate-100/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{m.content}</p>
                </div>
              </div>
            );
          }

          const mSenderId = m.sender?._id || m.sender;
          const isOwnMessage = String(mSenderId) === String(user._id);

          const prevMessage = messages[i - 1];
          const prevSenderId = prevMessage ? (prevMessage.sender?._id || prevMessage.sender) : null;
          const showAvatar = !isOwnMessage && String(prevSenderId) !== String(mSenderId);

          return (
            <div key={m._id} className={`flex items-end gap-3 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar on left for received */}
              {!isOwnMessage && (
                <div className="size-8 rounded-lg shrink-0 overflow-hidden bg-slate-100">
                  {showAvatar ? (
                    <img src={m.sender?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} className="size-full object-cover" alt="" />
                  ) : (
                    <div className="size-full" />
                  )}
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`group relative max-w-[65%]`}
              >
                {!isOwnMessage && selectedChat.isGroupChat && showAvatar && (
                  <p className="text-[11px] font-bold text-slate-400 ml-1 mb-1 uppercase tracking-tight">{m.sender?.name || "User"}</p>
                )}

                <div className={`px-5 py-3.5 rounded-[1.75rem] text-[15px] leading-relaxed shadow-sm ${isOwnMessage
                  ? "bg-primary-600 text-white rounded-br-none shadow-primary-500/10"
                  : "bg-slate-100 text-slate-800 rounded-bl-none"
                  }`}>
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>

                  <div className={`flex items-center gap-1.5 mt-1.5 justify-end ${isOwnMessage ? 'text-white/60' : 'text-slate-400'}`}>
                    <span className="text-[10px] font-bold">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isOwnMessage && <CheckCheck className="size-3.5" />}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-slate-50 border border-slate-100" />
            <div className="bg-slate-100 px-5 py-3 rounded-2xl rounded-bl-none flex gap-1.5 items-center">
              <span className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={scrollRef} className="h-4" />
      </div>

      {/* Input Bar */}
      <div className="px-8 py-6 bg-white border-t border-slate-100">
        <form onSubmit={sendMessage} className="relative group flex items-center gap-4">
          <div className="flex-1 relative flex items-center">
            {/* Emoji Picker Overlay */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  ref={emojiPickerRef}
                  className="absolute bottom-full mb-4 left-0 w-80 bg-white shadow-2xl rounded-3xl border border-slate-100 p-4 z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Emoji</h4>
                    <button type="button" onClick={() => setShowEmojiPicker(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <Plus className="size-4 rotate-45" />
                    </button>
                  </div>
                  <div className="grid grid-cols-8 gap-2 max-h-60 overflow-y-auto scrollbar-hide p-1">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-2xl hover:scale-125 transition-transform p-1.5 hover:bg-slate-50 rounded-xl"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute left-2 flex items-center gap-1">
              <InputAction icon={<Plus className="size-5" />} />
              <InputAction icon={<Image className="size-5" />} />
            </div>

            <input
              type="text"
              placeholder="Type a message..."
              className="w-full bg-slate-100/60 border-none rounded-3xl py-4 pl-24 pr-14 outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white focus:shadow-sm transition-all text-[15px] font-medium placeholder:text-slate-400"
              value={newMessage}
              onChange={typingHandler}
            />

            <div className="absolute right-2">
              <InputAction
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                icon={<Smile className={`size-5 transition-colors ${showEmojiPicker ? 'text-primary-600' : ''}`} />}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="size-14 bg-primary-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-primary-600/20 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-95 disabled:active:scale-95"
          >
            <Send className="size-6" />
          </button>
        </form>
      </div>
      <GroupSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        chat={selectedChat}
        socket={socket}
      />
    </div>
  );
};

const HeaderAction = ({ icon, onClick }) => (
  <button onClick={onClick} className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-primary-600">
    {icon}
  </button>
);

const InputAction = ({ icon, onClick }) => (
  <button onClick={onClick} type="button" className="p-2 hover:bg-slate-200 rounded-xl transition-all text-slate-400 hover:text-slate-600">
    {icon}
  </button>
);

export default ChatWindow;
