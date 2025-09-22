import axios from "axios";
import { toast } from "react-hot-toast";
import { io, type Socket } from "socket.io-client";
import { create } from "zustand";
export type ISODate = string;

import { axiosInstance } from "../lib/axios.js";
import { resolveSocketURL } from "../lib/resolveSocketURL.js";

// type profilePicProps = {
//   imageUrl: string | null;
//   postedAt: string;
// };

type User = {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  bio: string | null;
  profilePic: string | null;
  profilePicPostedAt: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
};

type AuthState = {
  authUser: User | null;
  isSigningUp: boolean;
  isSigningIn: boolean;
  isUpdatingProfilePic: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: string[];
  socket: Socket<any, any> | null;
};

type SignUpProps = {
  fullName: string;
  username: string;
  email: string;
  password: string;
};

type SignInProps = {
  identifier: string;
  password: string;
};

type UpdateProfilePicProps = {
  profilePic: string;
};

type UpdateProfileProps = Partial<{
  fullName: string;
  username: string;
  email: string;
  bio: string;
}>;

type AuthActions = {
  checkAuth: () => Promise<void>;
  signUp: (data: SignUpProps) => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (data: SignInProps) => Promise<void>;
  updateProfilePic: (data: UpdateProfilePicProps) => Promise<void>;
  updateProfile: (data: UpdateProfileProps) => Promise<void>;
  deleteProfile: () => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
};

type useAuthStoreProps = AuthActions & AuthState;

export const useAuthStore = create<useAuthStoreProps>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isSigningIn: false,
  isUpdatingProfilePic: false,
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
      console.log("authUser.profilePic", res.data.profilePic);

      get().connectSocket();
    } catch (e) {
      toast.error("Failed to sign in");
      console.log(e);
    } finally {
      set({ isSigningIn: false });
    }
  },

  updateProfilePic: async (data: UpdateProfilePicProps) => {
    set({ isUpdatingProfilePic: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile-pic", data);
      set((s) => ({
        authUser: {
          ...s.authUser!,
          profilePic: res.data.profilePic,
          profilePicPostedAt: res.data.profilePicPostedAt,
        },
      }));
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
      set({ isUpdatingProfilePic: false });
    }
  },

  updateProfile: async (data: UpdateProfileProps) => {
    set({ isUpdatingProfile: true });
    try {
      const payload: UpdateProfileProps = {
        ...(data.fullName?.trim() ? { fullName: data.fullName.trim() } : {}),
        ...(data.username?.trim() ? { username: data.username.trim() } : {}),
        ...(data.email?.trim() ? { email: data.email.trim() } : {}),
        ...(data.bio?.trim() ? { bio: data.bio.trim() } : {}),
      };
      const res = await axiosInstance.put("/auth/update-profile", payload);
      toast.success("Account updated");
      set({ authUser: res.data });

      get().connectSocket();
    } catch (e) {
      toast.error("Failed to update account");
      try {
        await get().checkAuth();
      } catch (e) {
        console.log(e);
      }
      console.log(e);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  deleteProfile: async () => {
    try {
      console.log("deleting....");
      await axiosInstance.delete("/auth/delete-profile");
      set({ authUser: null });
      get().disconnectSocket();
    } catch (e) {
      toast.error("Failed to delete account");
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
    set({ socket });

    socket.on("onlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (!socket) return;
    socket.removeAllListeners();
    socket.disconnect();
    set({ socket: null, onlineUsers: [] });
  },
}));
