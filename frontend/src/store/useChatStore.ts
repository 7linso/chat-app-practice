import { toast } from "react-hot-toast";
import { create } from "zustand";

import { axiosInstance } from "../lib/axios";

import { useAuthStore } from "./useAuthStore";

type User = {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
  password: string;
  createdAt: string;
  updatedAt: string;
};

type Message = {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

type SendMessage = {
  text: string | null;
  image: string | null;
};

type useChatStoreProps = {
  messages: Message[];
  users: User[];
  selectedUser: User | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;

  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  setSelectedUser: (selectedUser: User | null) => void;
  sendMessage: (data: SendMessage) => void;
  subscribeToMessages: () => () => void;
  unsubscribeToMessages: () => void;
};

export const useChatStore = create<useChatStoreProps>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance("/message/users");
      set({ users: res.data });
    } catch (e) {
      toast.error("Cannot load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance(`/message/${userId}`);
      set({ messages: res.data });
    } catch (e) {
      toast.error("Cannot load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (data: SendMessage) => {
    const { selectedUser, messages } = get();
    console.log(data, selectedUser, messages);
    if (!selectedUser) return;
    try {
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        data,
      );
      set({ messages: [...messages, res.data] });
    } catch (e) {
      toast.error("Cannot send message");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    const selectedUser = get().selectedUser;
    if (!socket || !selectedUser) return () => {};

    const handler = (msg: Message) => {
      if (
        msg.senderId !== selectedUser._id &&
        msg.receiverId !== selectedUser._id
      )
        return;
      set((state) => ({ messages: [...state.messages, msg] }));
    };

    socket.off("newMessage", handler);
    socket.on("newMessage", handler);

    return () => {
      socket.off("newMessage", handler);
    };
  },

  unsubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser: User | null) => set({ selectedUser }),
}));
