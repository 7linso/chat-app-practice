import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return res.status(409).json({ message: "Email is already used." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (!newUser)
      return res.status(400).json({ message: "Invalid user data." });

    generateToken(newUser._id, res);
    await newUser.save();

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (e) {
    console.log(`Error signup: ${e}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword)
      return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
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

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id || req.user.id;

    // 1) auth
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // 2) input presence/shape
    if (!profilePic || typeof profilePic !== "string") {
      return res.status(400).json({ message: "Profile picture is required." });
    }

    const trimmed = profilePic.trim();
    const uploadSource = trimmed.startsWith("data:")
      ? trimmed
      : `data:image/jpeg;base64,${trimmed}`;

    // quick visibility logs (remove after debug)
    console.log("[updateProfile] userId:", userId);
    console.log("[updateProfile] body length:", uploadSource.length);
    console.log(
      "[updateProfile] prefix:",
      uploadSource.slice(0, Math.min(40, uploadSource.length)),
    );

    // 3) cloudinary upload
    const result = await cloudinary.uploader.upload(uploadSource, {
      folder: "chat-app-practice",
      resource_type: "image",
      overwrite: true,
    });

    console.log("[updateProfile] cloudinary.secure_url:", result?.secure_url);

    if (!result?.secure_url) {
      return res.status(502).json({ message: "Upload failed at Cloudinary." });
    }

    // 4) db save
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: result.secure_url },
      { new: true, runValidators: true, projection: { password: 0 } },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // 5) return fresh user (ensure schema actually has 'profilePic')
    return res.status(200).json(updatedUser);
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
