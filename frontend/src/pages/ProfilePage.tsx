import { Camera, User, Mail, Pencil, BookOpen } from "lucide-react";
import { useState } from "react";

import { readFileAsDataURL } from "../lib/readFileAsDataURL";
import { useAuthStore } from "../store/useAuthStore";

export default function ProfilePage() {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState<string>("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const base64 = await readFileAsDataURL(file);
    setSelectedImg(base64);

    await updateProfile({ profilePic: base64 });
  };

  return (
    <div className="h-screen pt-20 py-8 max-w-2xl mx-auto p-4 ">
      <div className="bg-base-300 rounded-xl p-6 space-y-8">
        <div className="relative flex items-center">
          <h1 className="text-2xl font-semibold flex-1">Profile</h1>
          <Pencil className="ml-auto " />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={selectedImg || authUser?.profilePic || "/avatar.png"}
              alt="Profile"
              className="size-32 rounded-full object-cover border-4 "
            />
            <label
              htmlFor="avatar-upload"
              className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
            >
              <Camera className="w-5 h-5 text-base-200" />
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>
          <p className="text-sm text-zinc-400">
            {isUpdatingProfile
              ? "Uploading..."
              : "Click the camera icon to update your photo"}
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <div className="flex items-center bg-base-200 rounded-lg border">
                <p className="px-4 py-2.5 flex-1">{authUser?.fullName}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </div>
              <div className="flex items-center bg-base-200 rounded-lg border">
                <p className="px-4 py-2.5 flex-1">TODO username</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-sm text-zinc-400 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </div>
            <div className="flex items-center bg-base-200 rounded-lg border ">
              <p className="px-4 py-2.5 flex-1">{authUser?.email}</p>
              {/* <Pencil size={20} className="mr-4" /> */}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-sm text-zinc-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Bio
            </div>
            <div className="flex items-center bg-base-200 rounded-lg border ">
              <p className="px-4 py-2.5 flex-1">TODO bio</p>
              {/* <Pencil size={20} className="mr-4" /> */}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-base-300 rounded-xl py-6">
          <h2 className="text-lg font-medium  mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-zinc-700">
              <span>Member Since</span>
              <span>{authUser?.createdAt?.split("T")[0]}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-700">
              <span>Last Update</span>
              <span>{authUser?.updatedAt?.split("T")[0]}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Account Status</span>
              <span className="text-green-500">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
