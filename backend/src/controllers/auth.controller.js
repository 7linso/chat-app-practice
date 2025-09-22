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

    const normalizedUsername = username.trim();

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

    res.status(200).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      bio: newUser.bio ?? null,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      profilePic: latest ? latest.imageUrl : null,
      profilePicPostedAt: latest?.postedAt ?? null,
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

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      bio: user.bio ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profilePic: latest ? latest.imageUrl : null,
      profilePicPostedAt: latest?.postedAt ?? null,
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
    const isDataUrl = trimmed.startsWith("data:");
    const uploadSource = isDataUrl
      ? trimmed
      : `data:image/jpeg;base64,${trimmed}`;

    const existing = await User.findById(userId, { profilePic: 1 }).lean();
    if (!existing) return res.status(404).json({ message: "User not found." });

    const result = await cloudinary.uploader.upload(uploadSource, {
      folder: `chat-app-practice/users/${userId}/profile`,
      overwrite: false,
    });
    console.log("[updateProfile] cloudinary.secure_url:", result?.secure_url);

    if (!result?.secure_url) {
      return res.status(502).json({ message: "Upload failed at Cloudinary." });
    }

    const newEntry = {
      imageUrl: result.secure_url,
      publicId: result.public_id,
      postedAt: new Date(result.created_at || Date.now()),
    };

    const MAX_PICS = 5;
    const updated = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          profilePic: {
            $each: [newEntry],
            $slice: -MAX_PICS,
          },
        },
      },
      { new: true, runValidators: true, projection: { password: 0 } },
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "User not found." });
    }

    const prevPublicIds = (existing.profilePic || [])
      .map((p) => p.publicId)
      .filter(Boolean);
    const keptPublicIds = (updated.profilePic || [])
      .map((p) => p.publicId)
      .filter(Boolean);
    const overflow = prevPublicIds.filter(
      (pid) => !keptPublicIds.includes(pid),
    );

    if (overflow.length) {
      cloudinary.api
        .delete_resources(overflow, {
          resource_type: "image",
          type: "upload",
          invalidate: true,
        })
        .catch((err) => console.error("[Cloudinary cleanup] error:", err));
    }

    const latest = updated.profilePic.at(-1) ?? null;

    res.status(200).json({
      _id: updated._id,
      fullName: updated.fullName,
      username: updated.username,
      email: updated.email,
      bio: updated.bio ?? null,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      profilePic: latest ? latest.imageUrl : null,
      profilePicPostedAt: latest?.postedAt ?? null,
    });
  } catch (e) {
    console.error("[updateProfile] error:", e);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { fullName, username, email, bio } = req.body ?? {};

    if (bio !== undefined && String(bio).length > 200) {
      return res.status(400).json({ message: "Bio is too long." });
    }

    const update = {};

    if (fullName !== undefined) update.fullName = String(fullName).trim();

    if (username !== undefined) {
      const normUsername = String(username).trim();
      if (
        normUsername.toLowerCase() !== String(req.user.username).toLowerCase()
      ) {
        const existingUsername = await User.findOne({
          username: new RegExp(`^${normUsername}$`, "i"),
          _id: { $ne: userId },
        }).lean();
        if (existingUsername) {
          return res.status(409).json({ message: "Username is already used." });
        }
      }
      update.username = normUsername;
    }

    if (email !== undefined) {
      const normEmail = String(email).trim().toLowerCase();
      if (normEmail !== String(req.user.email).toLowerCase()) {
        const existingEmail = await User.findOne({
          email: normEmail,
          _id: { $ne: userId },
        }).lean();
        if (existingEmail) {
          return res.status(409).json({ message: "Email is already used." });
        }
      }
      update.email = normEmail;
    }

    if (bio !== undefined) update.bio = String(bio).trim();

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "No changes provided." });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: update },
      { new: true, runValidators: true, projection: { password: 0 } },
    ).lean();

    if (!updated) return res.status(404).json({ message: "User not found." });

    const latest = updated.profilePic?.at(-1) ?? null;

    return res.status(200).json({
      _id: updated._id,
      fullName: updated.fullName,
      username: updated.username,
      email: updated.email,
      bio: updated.bio ?? null,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      profilePic: latest ? latest.imageUrl : null,
      profilePicPostedAt: latest?.postedAt ?? null,
    });
  } catch (e) {
    console.error("[updateProfile] error:", e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.profilePic.length > 0) {
      const publicIds = (user.profilePic || [])
        .map((p) => p.publicId)
        .filter(Boolean);

      if (publicIds.length) {
        await cloudinary.api.delete_resources(publicIds, {
          resource_type: "image",
          type: "upload",
          invalidate: true,
        });

        const prefix = `chat-app-practice/users/${userId}/profile`;
        await cloudinary.api
          .delete_resources_by_prefix(prefix, { resource_type: "image" })
          .catch(() => {});
        await cloudinary.api.delete_folder(prefix).catch(() => {});
      }
    }
    await User.deleteOne({ _id: userId });
    res.status(200).json("Profile deleted");
  } catch (e) {
    console.error("[deleteProfile] error:", e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = async (req, res) => {
  const user = await User.findById(req.user._id, {
    fullName: 1,
    username: 1,
    email: 1,
    bio: 1,
    profilePic: { $slice: -1 },
    createdAt: 1,
    updatedAt: 1,
  }).lean();

  const latest = user?.profilePic?.[0] || null;

  res.status(200).json({
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    bio: user.bio ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profilePic: latest ? latest.imageUrl : null,
    profilePicPostedAt: latest?.postedAt ?? null,
  });
};
