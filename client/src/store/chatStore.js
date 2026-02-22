import { create } from "zustand";
import API from "../api";

const useChatStore = create((set, get) => ({
  chats: [],
  selectedChat: null,
  messages: [],
  notification: [],
  onlineUsers: [],
  
  setChats: (chats) => set({ chats }),
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  setMessages: (messages) => set({ messages }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  fetchChats: async () => {
    try {
      const { data } = await API.get("/chat");
      set({ chats: data });
    } catch (error) {
      console.error("Error fetching chats", error);
    }
  },
  
  fetchMessages: async (chatId) => {
    try {
      const { data } = await API.get(`/message/${chatId}`);
      set({ messages: data });
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  }
}));

export default useChatStore;
