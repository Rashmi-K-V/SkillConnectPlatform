// // controllers/portfolio.controller.js
// import Portfolio from "../models/Portfolio.js";
// import { translateText } from "../services/translation.services.js";

// export const createOrUpdatePortfolio = async (req, res) => {
//   try {
//     if (req.user.role !== "worker") {
//       return res.status(403).json({ message: "Only workers allowed" });
//     }

//     const {
//       name, age, gender, email, contact, experience,
//       description, skills, category, videoUrl,
//       languagesKnown, selectedWorkTypes, priceMin, priceMax, pricing,
//     } = req.body;

//     const updates = {};
//     if (name              !== undefined) updates.name              = name;
//     if (age               !== undefined) updates.age               = Number(age) || undefined;
//     if (gender            !== undefined) updates.gender            = gender;
//     if (email             !== undefined) updates.email             = email;
//     if (contact           !== undefined) updates.contact           = contact;
//     if (experience        !== undefined) updates.experience        = experience;
//     if (description       !== undefined) updates.description       = description;
//     if (skills            !== undefined) updates.skills            = skills;
//     if (category          !== undefined) updates.category          = category;
//     if (videoUrl          !== undefined) updates.videoUrl          = videoUrl;
//     if (languagesKnown    !== undefined) updates.languagesKnown    = languagesKnown;
//     if (selectedWorkTypes !== undefined) updates.selectedWorkTypes = selectedWorkTypes;
//     if (priceMin          !== undefined) updates.priceMin          = Number(priceMin);
//     if (priceMax          !== undefined) updates.priceMax          = Number(priceMax);
//     if (pricing           !== undefined) updates.pricing           = pricing;

//     const portfolio = await Portfolio.findOneAndUpdate(
//       { workerId: req.user._id },
//       { $set: { workerId: req.user._id, ...updates } },
//       { new: true, upsert: true }
//     ).populate("workerId", "name email profilePicture");

//     res.json(portfolio);
//   } catch (err) {
//     console.error("createOrUpdatePortfolio:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getMyPortfolio = async (req, res) => {
//   try {
//     const portfolio = await Portfolio.findOne({ workerId: req.user._id })
//       .populate("workerId", "name email profilePicture");
//     res.json(portfolio || null);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getAllPortfolios = async (req, res) => {
//   try {
//     const filter = {};
//     if (req.query.category) filter.category = req.query.category.toLowerCase().trim();
//     const portfolios = await Portfolio.find(filter)
//       .populate("workerId", "name email profilePicture");
//     res.json(portfolios);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getPortfolioByWorkerId = async (req, res) => {
//   try {
//     const { lang } = req.query;
//     const portfolio = await Portfolio.findOne({ workerId: req.params.workerId })
//       .populate("workerId", "name email profilePicture");
//     if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

//     let translatedDescription = portfolio.description;
//     if (lang && portfolio.description) {
//       try { translatedDescription = await translateText(portfolio.description, lang); } catch (_) {}
//     }
//     res.json({ ...portfolio.toObject(), translatedDescription });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const updatePortfolio = async (req, res) => {
//   return createOrUpdatePortfolio(req, res);
// };

// controllers/portfolio.controller.js
import Portfolio from "../models/Portfolio.js";
import { translateText } from "../services/translation.services.js";

// ── helper: convert Mongoose Map → plain object for JSON responses ──────────
function serializePortfolio(portfolio) {
  const doc = portfolio.toObject({ virtuals: false });
  // Mongoose stores Map fields as ES6 Maps in memory — convert to plain object
  if (portfolio.workTypePrices instanceof Map) {
    doc.workTypePrices = Object.fromEntries(portfolio.workTypePrices);
  } else if (doc.workTypePrices && typeof doc.workTypePrices === "object") {
    // already plain — leave as-is
    doc.workTypePrices = { ...doc.workTypePrices };
  } else {
    doc.workTypePrices = {};
  }
  return doc;
}

export const createOrUpdatePortfolio = async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({ message: "Only workers allowed" });
    }

    const {
      name, age, gender, email, contact, experience,
      description, skills, category, videoUrl,
      languagesKnown, selectedWorkTypes, priceMin, priceMax, pricing,
      workTypePrices,          // ← NOW EXTRACTED
    } = req.body;

    const updates = {};
    if (name              !== undefined) updates.name              = name;
    if (age               !== undefined) updates.age               = Number(age) || undefined;
    if (gender            !== undefined) updates.gender            = gender;
    if (email             !== undefined) updates.email             = email;
    if (contact           !== undefined) updates.contact           = contact;
    if (experience        !== undefined) updates.experience        = experience;
    if (description       !== undefined) updates.description       = description;
    if (skills            !== undefined) updates.skills            = skills;
    if (category          !== undefined) updates.category          = category;
    if (videoUrl          !== undefined) updates.videoUrl          = videoUrl;
    if (languagesKnown    !== undefined) updates.languagesKnown    = languagesKnown;
    if (selectedWorkTypes !== undefined) updates.selectedWorkTypes = selectedWorkTypes;
    if (priceMin          !== undefined) updates.priceMin          = Number(priceMin);
    if (priceMax          !== undefined) updates.priceMax          = Number(priceMax);
    if (pricing           !== undefined) updates.pricing           = pricing;

    // ── FIXED: save workTypePrices as a proper Map ─────────────────────────
    // The frontend sends a plain object { serviceId: "price", ... }
    // Mongoose schema type is Map, so we convert explicitly.
    if (workTypePrices !== undefined && typeof workTypePrices === "object") {
      updates.workTypePrices = new Map(
        Object.entries(workTypePrices).filter(([, v]) => v !== "" && v != null)
      );
    }

    const portfolio = await Portfolio.findOneAndUpdate(
      { workerId: req.user._id },
      { $set: { workerId: req.user._id, ...updates } },
      { new: true, upsert: true }
    ).populate("workerId", "name email profilePicture");

    // ── FIXED: serialize Map → plain object before sending response ─────────
    res.json(serializePortfolio(portfolio));
  } catch (err) {
    console.error("createOrUpdatePortfolio:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getMyPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ workerId: req.user._id })
      .populate("workerId", "name email profilePicture");

    if (!portfolio) return res.json(null);

    // ── FIXED: serialize Map → plain object before sending response ─────────
    res.json(serializePortfolio(portfolio));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllPortfolios = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category.toLowerCase().trim();
    const portfolios = await Portfolio.find(filter)
      .populate("workerId", "name email profilePicture");

    res.json(portfolios.map(serializePortfolio));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPortfolioByWorkerId = async (req, res) => {
  try {
    const { lang } = req.query;
    const portfolio = await Portfolio.findOne({ workerId: req.params.workerId })
      .populate("workerId", "name email profilePicture");

    if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

    let translatedDescription = portfolio.description;
    if (lang && portfolio.description) {
      try { translatedDescription = await translateText(portfolio.description, lang); } catch (_) {}
    }

    // ── FIXED: use serializePortfolio so Map is converted correctly ─────────
    res.json({ ...serializePortfolio(portfolio), translatedDescription });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePortfolio = async (req, res) => {
  return createOrUpdatePortfolio(req, res);
};