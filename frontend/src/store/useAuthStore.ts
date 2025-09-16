import axios from "axios";
import { toast } from "react-hot-toast";
import { io, type Socket } from "socket.io-client";
import { create } from "zustand";

import { axiosInstance } from "../lib/axios.js";
import { resolveSocketURL } from "../lib/resolveSocketURL.js";

type User = {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
  password: string;
  createdAt: string;
  updatedAt: string;
};

type AuthState = {
  authUser: User | null;
  isSigningUp: boolean;
  isSigningIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: string[];
  socket: Socket<any, any> | null;
};

type SignUpProps = {
  fullName: string;
  email: string;
  password: string;
};

type SignInProps = {
  email: string;
  password: string;
};

type UpdateProfileProps = {
  profilePic: string;
};

type AuthActions = {
  checkAuth: () => Promise<void>;
  signUp: (data: SignUpProps) => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (data: SignInProps) => Promise<void>;
  updateProfile: (data: UpdateProfileProps) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
};

type useAuthStoreProps = AuthActions & AuthState;

export const useAuthStore = create<useAuthStoreProps>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isSigningIn: false,
  isUpdatingProfile: false,

  isCheckingAuth: true,
  onlineUsers: [],

  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });

      get().connectSocket();
    } catch (e) {
      console.log(`Checking auth: ${e}`);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data: SignUpProps) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      toast.success("Account created");
      set({ authUser: res.data });

      get().connectSocket();
    } catch (e) {
      toast.error("Failed to create account");
    } finally {
      set({ isSigningUp: false });
    }
  },

  signOut: async () => {
    try {
      await axiosInstance.post("/auth/signout");
      set({ authUser: null });
      toast.success("Signed out successfully");

      get().disconnectSocket();
    } catch (e) {
      toast.error("Failed to sign out");
    }
  },

  signIn: async (data: SignInProps) => {
    set({ isSigningIn: true });
    try {
      const res = await axiosInstance.post("/auth/signin", data);
      set({ authUser: res.data });
      toast.success("Welcome back!");

      get().connectSocket();
    } catch (e) {
      toast.error("Failed to sign in");
      console.log(e);
    } finally {
      set({ isSigningIn: false });
    }
  },

  updateProfile: async (data: UpdateProfileProps) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Updated profile image successfully");
    } catch (e: unknown) {
      toast.error("Failed to upload image. Try again later.");
      if (axios.isAxiosError(e)) {
        console.error("status:", e.response?.status);
        console.error("message:", e.response?.data);
      } else {
        console.error(e);
      }
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const SOCKET_URL = resolveSocketURL();

    const socket = io(SOCKET_URL, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: { userId: get().authUser?._id },
    });
    socket.connect();
    set({ socket: socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (!socket) return;
    socket.removeAllListeners();
    socket.disconnect();
    set({ socket: null, onlineUsers: [] });
  },
}));
