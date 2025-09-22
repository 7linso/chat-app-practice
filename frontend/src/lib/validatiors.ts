import { z } from "zod";

export const fullNameValidator = z
  .string("Full name is requiered")
  .trim()
  .min(3, "Full name must be at least 3 characters")
  .max(50, "Full name must be max 50 characters");

export const usernameValidator = z
  .string("Username is requiered")
  .trim()
  .toLowerCase()
  .min(3, "Userame must be at least 3 characters")
  .max(20, "Userame must be at most 20 characters")
  .regex(/^[a-z0-9._]+$/, "Letters, numbers, dot or underscore only")
  .refine((v) => /^[a-z0-9]/.test(v), {
    message: "Must start with a letter or number",
  })
  .refine((v) => !/[._]$/.test(v), {
    message: "Cannot end with a dot or underscore",
  })
  .refine((v) => !/(\.|_){2,}/.test(v), {
    message: "No consecutive dots/underscores",
  });

export const emailValidator = z
  .string("Email is required")
  .toLowerCase()
  .email("Enter a valid email");

export const identifierValidator = z.union([usernameValidator, emailValidator]);

export const passworValidator = z
  .string("Password is required")
  .min(6, "Password must be at least 6 characters");

export const bioValidator = z
  .string()
  .trim()
  .max(200, "Bio must be at most 200 characters")
  .optional();

export const SignUpValidator = z
  .object({
    fullName: fullNameValidator,
    username: usernameValidator,
    email: emailValidator,
    password: passworValidator,
  })
  .strict();

export type SignUpInput = z.infer<typeof SignUpValidator>;

export const SignInValidator = z
  .object({
    identifier: identifierValidator,
    password: passworValidator,
  })
  .strict();

export type SignInInput = z.infer<typeof SignInValidator>;

export const UpdateProfileValidator = z
  .object({
    fullName: fullNameValidator.optional(),
    username: usernameValidator.optional(),
    email: emailValidator.optional(),
    bio: bioValidator,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
    path: [],
  });

export type UpdateProfileInput = z.infer<typeof UpdateProfileValidator>;
