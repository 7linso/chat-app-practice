import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  User,
  Mail,
  Pencil,
  BookOpen,
  Check,
  IdCard,
  PenOff,
  Trash,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";

import OverlayLoader from "../components/common/OverlayLoading";
import { readFileAsDataURL } from "../lib/readFileAsDataURL";
import {
  UpdateProfileValidator,
  type UpdateProfileInput,
} from "../lib/validatiors";
import { useAuthStore } from "../store/useAuthStore";

export default function ProfilePage() {
  const {
    authUser,
    isUpdatingProfilePic,
    updateProfilePic,
    updateProfile,
    deleteProfile,
    signOut,
  } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState<string>("");
  const [editStatus, setEditStatus] = useState<boolean>(false);
  const [deleteStatus, setDeleteStatus] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileValidator),
    defaultValues: {
      fullName: authUser?.fullName ?? "",
      username: authUser?.username ?? "",
      email: authUser?.email ?? "",
      bio: authUser?.bio ?? "",
    },
  });

  const handleProfilePicUpdate = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const base64 = await readFileAsDataURL(file);
    setSelectedImg(base64);

    await updateProfilePic({ profilePic: base64 });
    setSelectedImg("");
  };

  const onSubmit: SubmitHandler<UpdateProfileInput> = async (
    data: UpdateProfileInput,
  ) => {
    try {
      await updateProfile(data);
      reset();
      setEditStatus(!editStatus);
    } catch (e: any) {
      const fields = e?.response?.data?.fields;
      if (fields?.fullName) setError("fullName", { message: fields.fullName });
      if (fields?.username) setError("username", { message: fields.username });
      if (fields?.email) setError("email", { message: fields.email });
      if (fields?.bio) setError("bio", { message: fields.bio });

      if (!fields) toast.error(e?.response?.data?.message ?? "Sign in failed");
    }
  };

  const handleUpdateProfile = handleSubmit(onSubmit);

  const handleDeleteProfile = async () => {
    try {
      setDeleteStatus(!deleteStatus);
      await deleteProfile();
      toast.success("Account deleted!");
      signOut();
    } catch (e) {
      toast.error("Failed to delete");
    }
    setDeleteStatus(!deleteStatus);
  };

  const bust = (url?: string | null, ts?: string | null) => {
    if (!url) return "/avatar.png";
    const v = ts ? new Date(ts).getTime() : Date.now();
    return url + (url.includes("?") ? "&" : "?") + "v=" + v;
  };

  const currentUrl = selectedImg || authUser?.profilePic || "/avatar.png";

  useEffect(() => {
    if (authUser) {
      reset({
        fullName: authUser.fullName ?? "",
        username: authUser.username ?? "",
        email: authUser.email ?? "",
        bio: authUser.bio ?? "",
      });
    }
  }, [authUser, reset]);

  return (
    <div className="h-screen pt-20 py-8 max-w-2xl mx-auto p-4 ">
      <div className="bg-base-300 rounded-xl p-6 space-y-8">
        <div className="relative flex items-center">
          <h1 className="text-2xl font-semibold flex-1">Profile</h1>
          {!editStatus ? (
            <div className="flex items-center gap-2">
              <Pencil onClick={() => setEditStatus(!editStatus)} />
              <Trash
                className="text-red-400"
                onClick={() => handleDeleteProfile()}
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="submit"
                form="profile-form"
                aria-label="Save"
                className="ml-auto"
              >
                <Check className="text-green-300" />
              </button>
              <button
                type="button"
                aria-label="Cancel"
                onClick={() => {
                  if (authUser) {
                    reset({
                      fullName: authUser.fullName ?? "",
                      username: authUser.username ?? "",
                      email: authUser.email ?? "",
                      bio: authUser.bio ?? "",
                    });
                  }
                  setEditStatus(false);
                }}
              >
                <PenOff />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              key={currentUrl}
              src={bust(currentUrl, authUser?.profilePicPostedAt)}
              alt="Profile"
              className="size-32 rounded-full object-cover border-4"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/avatar.png";
              }}
            />
            <label
              htmlFor="avatar-upload"
              className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfilePic ? "animate-pulse pointer-events-none" : ""}
                `}
            >
              <Camera className="w-5 h-5 text-base-200" />
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleProfilePicUpdate}
                disabled={isUpdatingProfilePic}
              />
            </label>
          </div>
          <p className="text-sm text-zinc-400">
            {isUpdatingProfilePic
              ? "Uploading..."
              : "Click the camera icon to update your photo"}
          </p>
        </div>

        <form
          id="profile-form"
          className="space-y-6"
          onSubmit={handleUpdateProfile}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <div
                className={`flex items-center bg-base-200 rounded-lg border
                ${
                  editStatus
                    ? "border-accent ring-2 ring-accent/30"
                    : "border-base-300"
                } `}
              >
                <input
                  className="px-4 py-2.5 flex-1"
                  placeholder="John Doe"
                  disabled={!editStatus}
                  {...register("fullName")}
                  aria-invalid={!!errors.fullName}
                />
              </div>
              <span className="text-sm text-error">
                {errors.fullName?.message}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <IdCard className="w-4 h-4" />
                Username
              </div>
              <div
                className={`flex items-center bg-base-200 rounded-lg border
                ${
                  editStatus
                    ? "border-accent ring-2 ring-accent/30"
                    : "border-base-300"
                } `}
              >
                <input
                  className="px-4 py-2.5 flex-1"
                  placeholder="johny123"
                  disabled={!editStatus}
                  {...register("username")}
                  aria-invalid={!!errors.username}
                />
              </div>
            </div>
            <span className="text-sm text-error">
              {errors.username?.message}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="text-sm text-zinc-400 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </div>
            <div
              className={`flex items-center bg-base-200 rounded-lg border
                ${
                  editStatus
                    ? "border-accent ring-2 ring-accent/30"
                    : "border-base-300"
                } `}
            >
              <input
                className="px-4 py-2.5 flex-1"
                placeholder="johny123@example.com"
                disabled={!editStatus}
                {...register("email")}
                aria-invalid={!!errors.email}
              />
            </div>
            <span className="text-sm text-error">{errors.email?.message}</span>
          </div>

          <div className="space-y-1.5">
            <div className="text-sm text-zinc-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Bio
            </div>
            <div
              className={`flex items-center bg-base-200 rounded-lg border
                ${
                  editStatus
                    ? "border-accent ring-2 ring-accent/30"
                    : "border-base-300"
                } `}
            >
              <input
                className="px-4 py-2.5 flex-1"
                placeholder="I like playing the guitar..."
                disabled={!editStatus}
                {...register("bio")}
                aria-invalid={!!errors.bio}
              />
            </div>
            <span className="text-sm text-error">{errors.bio?.message}</span>
          </div>
        </form>

        <div className="mt-6 bg-base-300 rounded-xl py-6">
          <h2 className="text-lg font-medium  mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-zinc-700">
              <span>Member Since</span>
              <span>
                {authUser && new Date(authUser?.createdAt).toDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-zinc-700">
              <span>Last Update</span>
              <span>
                {authUser && new Date(authUser?.updatedAt).toDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Account Status</span>
              <span className="text-green-500">Active</span>
            </div>
          </div>
        </div>
      </div>

      <OverlayLoader open={deleteStatus} text="Analyzing your input...." />
    </div>
  );
}
