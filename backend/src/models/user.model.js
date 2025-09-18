import mongoose from "mongoose";

const ProfilePicSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    profilePic: {
      type: [ProfilePicSchema],
      default: [],
    },
    bio: {
      type: String,
      maxLength: 200,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
