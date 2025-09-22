import express from "express";
import {
  signup,
  signin,
  signout,
  updateProfilePic,
  checkAuth,
  updateProfile,
  deleteProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.post("/signout", signout);

router.put("/update-profile-pic", protectRoute, updateProfilePic);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

router.delete("/delete-profile", protectRoute, deleteProfile);

export default router;
