// controllers/auth.controller.js
import User      from "../models/User.js";
import Portfolio from "../models/Portfolio.js";
import bcrypt    from "bcryptjs";
import jwt       from "jsonwebtoken";
import crypto    from "crypto";

// In-memory token store — replace with DB field or Redis in production
// Map: { email -> { token, expires } }
const resetTokens = new Map();

// ── REGISTER ──────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, role, category } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "name, email, password and role are required" });
    if (role === "worker" && !category)
      return res.status(400).json({ message: "Workers must select a category" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed, role });

    if (role === "worker" && category) {
      await Portfolio.create({ workerId: user._id, category, skills: [] });
    }

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error("register:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { _id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, role: user.role, name: user.name, email: user.email, _id: user._id });
  } catch (err) {
    console.error("login:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET ME ────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── UPDATE PROFILE ────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...(name && { name }), ...(email && { email }) },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── CHANGE PASSWORD (logged in) ───────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { current, password } = req.body;
    const user  = await User.findById(req.user._id);
    const match = await bcrypt.compare(current, user.password);
    if (!match) return res.status(401).json({ message: "Current password is incorrect" });
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── FORGOT PASSWORD — send reset token to email ───────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    // Always respond with success to prevent email enumeration
    if (!user) return res.json({ message: "If that email exists, a reset code was sent." });

    // Generate a 6-digit code (simple, user-friendly)
    const code    = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

    resetTokens.set(email, { code, expires });

    // ── Send email ──────────────────────────────────────────
    // Option A: Using nodemailer (install: npm i nodemailer)
    try {
      const nodemailer = (await import("nodemailer")).default;
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,   // your Gmail address
          pass: process.env.EMAIL_PASS,   // Gmail app password (not your login password)
        },
      });

      await transporter.sendMail({
        from: `"SkillConnect" <${process.env.EMAIL_USER}>`,
        to:   email,
        subject: "Your SkillConnect Password Reset Code",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0d0d0d;color:#fff;padding:32px;border-radius:16px;">
            <h2 style="color:#c8f135;margin-bottom:8px;">Password Reset</h2>
            <p style="color:rgba(255,255,255,0.6);margin-bottom:24px;">Use the code below to reset your password. It expires in 15 minutes.</p>
            <div style="background:#1a1a1a;border:1px solid rgba(200,241,53,0.3);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
              <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#c8f135;">${code}</span>
            </div>
            <p style="color:rgba(255,255,255,0.4);font-size:13px;">If you didn't request this, ignore this email. Your password won't change.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Email send failed:", emailErr.message);
      // In development — log the code to console so you can test without email
      console.log(`\n🔑 RESET CODE for ${email}: ${code}\n`);
    }

    res.json({ message: "If that email exists, a reset code was sent." });
  } catch (err) {
    console.error("forgotPassword:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── RESET PASSWORD — verify code and set new password ─────────
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body; // token = the 6-digit code

    if (!token || !password)
      return res.status(400).json({ message: "Code and new password are required" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    // Find which email this code belongs to
    let foundEmail = null;
    for (const [email, data] of resetTokens.entries()) {
      if (data.code === token && data.expires > Date.now()) {
        foundEmail = email;
        break;
      }
    }

    if (!foundEmail)
      return res.status(400).json({ message: "Invalid or expired reset code" });

    const user = await User.findOne({ email: foundEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    // Remove used token
    resetTokens.delete(foundEmail);

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("resetPassword:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── UPLOAD AVATAR ─────────────────────────────────────────────
export const uploadAvatar = async (req, res) => {
  try {
    const url = req.file?.path || req.body.avatar;
    if (!url) return res.status(400).json({ message: "No avatar provided" });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: url },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};