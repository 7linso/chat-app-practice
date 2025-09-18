import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
  const { fullName, username, email, password } = req.body;

  try {
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingEmail = await User.findOne({ email: normalizedEmail }).lean();
    if (existingEmail) {
      return res.status(409).json({ message: "Email is already used." });
    }

    const normalizedUsername = email.trim();

    const existingUsername = await User.findOne({
      username: normalizedUsername,
    }).lean();
    if (existingUsername) {
      return res.status(409).json({ message: "Username is already used." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    if (!newUser)
      return res.status(400).json({ message: "Invalid user data." });

    generateToken(newUser._id, res);
    await newUser.save();

    const me = await User.findById(newUser._id, {
      fullName: 1,
      username: 1,
      email: 1,
      profilePic: { $slice: -1 },
    }).lean();

    const latest = me.profilePic?.[0] || null;

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      profilePic: latest ? latest.imageUrl : null,
      profilePicPostedAt: latest?.postedAt ?? null,
      bio: newUser.bio,
    });
  } catch (e) {
    console.log(`Error signup: ${e}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const signin = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    const user = await User.findOne(
      isEmail ? { email: identifier } : { username: identifier },
    );

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword)
      return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);

    const me = await User.findById(user._id, {
      fullName: 1,
      username: 1,
      email: 1,
      profilePic: { $slice: -1 },
    }).lean();

    const latest = me.profilePic?.[0] || null;

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      profilePic: latest ? latest.imageUrl : null,
      profilePicPostedAt: latest?.postedAt ?? null,
      bio: user.bio,
    });
  } catch (e) {
    console.log(`Error signin: ${e}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const signout = (_req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged Out" });
  } catch (e) {
    console.log(`Error signout: ${e}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfilePic = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id || req.user.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!profilePic || typeof profilePic !== "string") {
      return res.status(400).json({ message: "Profile picture is required." });
    }

    const trimmed = profilePic.trim();
    const uploadSource = trimmed.startsWith("data:")
      ? trimmed
      : `data:image/jpeg;base64,${trimmed}`;

    const result = await cloudinary.uploader.upload(uploadSource, {
      folder: "chat-app-practice",
      resource_type: "image",
    });

    console.log("[updateProfile] cloudinary.secure_url:", result?.secure_url);

    if (!result?.secure_url) {
      return res.status(502).json({ message: "Upload failed at Cloudinary." });
    }

    const MAX_PICS = 5;
    const updated = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          profilePic: {
            $each: [{ imageUrl: result.secure_url, postedAt: new Date() }],
            $slice: -MAX_PICS, // keep only the last N (remove this line if you want unlimited)
          },
        },
      },
      {
        new: true,
        runValidators: true,
        projection: { password: 0 },
      },
    ).lean();

    const latest = updated.profilePic?.[updated.profilePic.length - 1] ?? null;

    if (!updated) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      _id: updated._id,
      fullName: updated.fullName,
      username: updated.username,
      email: updated.email,
      profilePic: latest ? latest.imageUrl : null,
      profilePicPostedAt: latest?.postedAt ?? null,
      bio: updated.bio ?? null,
    });
  } catch (e) {
    console.error("[updateProfile] error:", e);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (e) {
    console.log("Error checking profile");
    res.staus(500).json({ message: "Not Authenticated" });
  }
};
