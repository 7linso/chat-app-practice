import { Loader } from "lucide-react";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

type User = {
  fullname?: string;
  email: string;
  profilePic?: string;
  password?: string;
};

type UserOrNull = User | null;

type useAuthStoreProps = {
  authUser: UserOrNull;
  checkAuth: () => Promise<void>;
  isCheckingAuth: boolean;
};

type useThemeStoreProps = {
  theme: string;
  setTheme: (theme: string) => void;
};

export const App = () => {
  const { authUser, checkAuth, isCheckingAuth }: useAuthStoreProps =
    useAuthStore();
  const { theme }: useThemeStoreProps = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <>
      <div data-theme={theme}>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to="/signin" />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route
            path="/signin"
            element={!authUser ? <SignInPage /> : <Navigate to="/" />}
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="/profile"
            element={authUser ? <ProfilePage /> : <Navigate to="/signin" />}
          />
        </Routes>

        <Toaster />
      </div>
    </>
  );
};
