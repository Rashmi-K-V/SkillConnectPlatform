// controllers/portfolio.controller.js
import Portfolio from "../models/Portfolio.js";
import { translateText } from "../services/translation.services.js";


// ── CREATE OR UPDATE ──────────────────────────────────────────
export const createOrUpdatePortfolio = async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({ message: "Only workers allowed" });
    }

    const {
      name, age, gender, email, contact,
      experience, pricing, skills, description,
      category, videoUrl,
    } = req.body;

    const updates = {};
    if (name        !== undefined) updates.name        = name;
    if (age         !== undefined) updates.age         = Number(age) || undefined;
    if (gender      !== undefined) updates.gender      = gender;
    if (email       !== undefined) updates.email       = email;
    if (contact     !== undefined) updates.contact     = contact;
    if (experience  !== undefined) updates.experience  = experience;
    if (pricing     !== undefined) updates.pricing     = pricing;
    if (skills      !== undefined) updates.skills      = skills;
    if (description !== undefined) updates.description = description;
    if (category    !== undefined) updates.category    = category;
    if (videoUrl    !== undefined) updates.videoUrl    = videoUrl;

    const portfolio = await Portfolio.findOneAndUpdate(
      { workerId: req.user._id },
      { $set: { workerId: req.user._id, ...updates } },
      { new: true, upsert: true }
    ).populate("workerId", "name email profilePicture");

    res.json(portfolio);
  } catch (err) {
    console.error("createOrUpdatePortfolio:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET MY PORTFOLIO ──────────────────────────────────────────
export const getMyPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ workerId: req.user._id })
      .populate("workerId", "name email profilePicture");

    // return null gracefully instead of 404 — frontend handles empty state
    res.json(portfolio || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET ALL PORTFOLIOS (with optional category filter) ────────
// FIX: category lives on Portfolio, not User — filter directly
export const getAllPortfolios = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category.toLowerCase().trim();
    }

    const portfolios = await Portfolio.find(filter)
      .populate("workerId", "name email profilePicture");

    res.json(portfolios);
  } catch (err) {
    console.error("getAllPortfolios:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET SINGLE WORKER PORTFOLIO ───────────────────────────────
export const getPortfolioByWorkerId = async (req, res) => {
  try {
    const { lang } = req.query;

    const portfolio = await Portfolio.findOne({ workerId: req.params.workerId })
      .populate("workerId", "name email profilePicture");

    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    let translatedDescription = portfolio.description;
    if (lang && portfolio.description) {
      try {
        translatedDescription = await translateText(portfolio.description, lang);
      } catch (_) {}
    }

    res.json({ ...portfolio.toObject(), translatedDescription });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── UPDATE PORTFOLIO (PUT) — delegates to createOrUpdate ──────
export const updatePortfolio = async (req, res) => {
  return createOrUpdatePortfolio(req, res);
};