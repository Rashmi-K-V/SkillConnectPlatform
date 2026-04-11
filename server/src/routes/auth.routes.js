import express from "express";
import {
  register,
  login,
  getMe,           // ✅ was: getProfile
  updateProfile,
  changePassword,
  uploadAvatar,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
 
const router = express.Router();
 
router.post("/register",         register);
router.post("/login",            login);
router.get("/me",       protect, getMe);           // ✅ was: getProfile
router.put("/profile",  protect, updateProfile);
router.put("/password", protect, changePassword);
router.post("/avatar",  protect, uploadAvatar);
 
export default router;