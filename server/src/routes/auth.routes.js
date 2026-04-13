// routes/auth.routes.js
import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  uploadAvatar,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.post("/register",          register);
router.post("/login",             login);
router.post("/forgot-password",   forgotPassword);   // send reset code to email
router.post("/reset-password",    resetPassword);    // verify code + set new password

// Protected
router.get("/me",        protect, getMe);
router.put("/profile",   protect, updateProfile);
router.put("/password",  protect, changePassword);
router.post("/avatar",   protect, uploadAvatar);

export default router;