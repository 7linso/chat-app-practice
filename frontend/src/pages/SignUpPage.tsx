import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  User,
  IdCard,
} from "lucide-react";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

import AuthImagePattern from "../components/AuthImagePattern";
import { SignUpValidator, type SignUpInput } from "../lib/validatiors";
import { useAuthStore } from "../store/useAuthStore";

export default function SignUpPage() {
  const { signUp, isSigningUp } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpValidator),
    defaultValues: { fullName: "", username: "", email: "", password: "" },
  });

  const onSubmit: SubmitHandler<SignUpInput> = async (data: SignUpInput) => {
    try {
      await signUp(data);
      toast.success("Welcome!");
      reset();
    } catch (e: any) {
      const fields = e?.response?.data?.fields;
      if (fields?.username) setError("username", { message: fields.username });
      if (fields?.email) setError("email", { message: fields.email });
      if (!fields) toast.error(e?.response?.data?.message ?? "Sign up failed");
    }
  };

  const handleSignUp = handleSubmit(onSubmit);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">
                Get started with your free account
              </p>
            </div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 pl-3 flex items-center">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  {...register("fullName")}
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="John Doe"
                  aria-invalid={!!errors.fullName}
                />
              </div>
              <span className="text-sm text-error">
                {errors.fullName?.message}
              </span>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Username</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 pl-3 flex items-center">
                  <IdCard className="size-5 text-base-content/40" />
                </div>
                <input
                  {...register("username")}
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="johny123"
                  aria-invalid={!!errors.username}
                />
              </div>
              <span className="text-sm text-error">
                {errors.username?.message}
              </span>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 pl-3 flex items-center">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="johny123@example.com"
                  aria-invalid={!!errors.email}
                />
              </div>
              <span className="text-sm text-error">
                {errors.email?.message}
              </span>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 pl-3 flex items-center">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10`}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
              <span className="text-sm text-error">
                {errors.password?.message}
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/signin" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* right side */}

      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  );
}
