import express from "express";
import {
  signup,
  signin,
  signout,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/signin", signin);

router.post("/signout", signout);

router.put("/update-profile", protectRoute, updateProfile);

export default router;
