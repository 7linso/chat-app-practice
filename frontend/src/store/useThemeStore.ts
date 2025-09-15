import { create } from "zustand";

type useThemeStoreProps = {
  theme: string;
  setTheme: (theme: string) => void;
};

export const useThemeStore = create<useThemeStoreProps>((set) => ({
  theme: localStorage.getItem("chat-theme") || "dark",
  setTheme: (theme: string) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));
