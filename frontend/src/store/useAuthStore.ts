import { toast } from "react-hot-toast";
import { create } from "zustand";

import { axiosInstance } from "../lib/axios.js";

type User = {
  fullname?: string;
  email: string;
  profilePic?: string;
  password?: string;
};

type UserOrNull = User | null;

type AuthState = {
  authUser: UserOrNull;
  isSigningUp: boolean;
  isSigningIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
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

type AuthActions = {
  checkAuth: () => Promise<void>;
  signUp: (data: SignUpProps) => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (data: SignInProps) => Promise<void>;
};

type useAuthStoreProps = AuthActions & AuthState;

export const useAuthStore = create<useAuthStoreProps>((set) => ({
  authUser: null,
  isSigningUp: false,
  isSigningIn: false,
  isUpdatingProfile: false,

  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
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
    } catch (e) {
      toast.error("Failed to sign in");
    } finally {
      set({ isSigningIn: false });
    }
  },
}));
