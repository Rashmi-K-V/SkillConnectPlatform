// controllers/auth.controller.js
import User      from "../models/User.js";
import Portfolio from "../models/Portfolio.js";
import bcrypt    from "bcryptjs";
import jwt       from "jsonwebtoken";

// ── REGISTER ──────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, role, category } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password and role are required" });
    }

    if (role === "worker" && !category) {
      return res.status(400).json({ message: "Workers must select a category" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed, role });

    // For workers — create a blank portfolio pre-seeded with their category
    // so clients can find them immediately even before they upload a video
    if (role === "worker" && category) {
      await Portfolio.create({
        workerId: user._id,
        category,
        skills: [],
      });
    }

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error("register:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── LOGIN ────────────────────────────────────────────────────
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

    res.json({
      token,
      role:  user.role,
      name:  user.name,
      email: user.email,
      _id:   user._id,
    });
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

// ── CHANGE PASSWORD ───────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { current, password } = req.body;
    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(current, user.password);
    if (!match) return res.status(401).json({ message: "Current password is incorrect" });
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── UPLOAD AVATAR ─────────────────────────────────────────────
export const uploadAvatar = async (req, res) => {
  try {
    // expects multer to handle the file upload and give you a URL
    // adjust based on your upload middleware (cloudinary etc.)
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