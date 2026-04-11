// import Portfolio from "../models/Portfolio.js";
// import { translateText } from "../services/translation.services.js";
// import User from "../models/User.js";
// // CREATE OR UPDATE PORTFOLIO
// const createOrUpdatePortfolio = async (req, res) => {
//   try {
//     if (req.user.role !== "worker") {
//       return res.status(403).json({ message: "Only workers allowed" });
//     }

//     const {
//       category,
//       skills,
//       experience,
//       priceRange,
//       languages,
//       location
//     } = req.body;

//     const portfolio = await Portfolio.findOneAndUpdate(
//       { workerId: req.user._id },
//       {
//         category,
//         skills,
//         experience,
//         priceRange,
//         languages,
//         location
//       },
//       { new: true, upsert: true }
//     );

//     res.json(portfolio);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // GET OWN PORTFOLIO
// const getMyPortfolio = async (req, res) => {
//   try {
//     const portfolio = await Portfolio.findOne({
//       workerId: req.user._id
//     }).populate("workerId", "name email");

//     res.json(portfolio);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // GET ALL WORKERS (FILTERED)
//  const getAllPortfolios = async (req, res) => {
//   try {
//     const { category } = req.query;

//     let filter = {};

//     if (category) {
//       const users = await User.find({ category });

//       const userIds = users.map(u => u._id);

//       filter.workerId = { $in: userIds };
//     }

//     const portfolios = await Portfolio.find(filter).populate("workerId", "name category");

//     res.json(portfolios);

//   } catch (err) {
//     console.log(err)
//     res.status(500).json({ message: err.message });
//   }
// };

// // GET SINGLE WORKER

// const getPortfolioByWorkerId = async (req, res) => {
//   try {
//     const { lang } = req.query;

//     const portfolio = await Portfolio.findOne({
//       workerId: req.params.workerId
//     }).populate("workerId", "name");

//     if (!portfolio) {
//       return res.status(404).json({ message: "Not found" });
//     }

//     let translatedDescription = portfolio.description;

//     if (lang) {
//       translatedDescription = await translateText(
//         portfolio.description,
//         lang
//       );
//     }

//     res.json({
//       ...portfolio._doc,
//       translatedDescription
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

//  const updatePortfolio = async (req, res) => {
//   try {
//     const { name, age, gender, email, contact, experience, pricing, skills } = req.body;
//     const portfolio = await Portfolio.findOneAndUpdate(
//       { workerId: req.user.id },
//       { name, age, gender, email, contact, experience, pricing, skills },
//       { returnDocument: "after", upsert: true }
//     );
//     res.json({ portfolio });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export {
//   createOrUpdatePortfolio,
//   getMyPortfolio,
//   getAllPortfolios,
//   getPortfolioByWorkerId,
//   updatePortfolio
// };
import Portfolio from "../models/Portfolio.js";
import { translateText } from "../services/translation.services.js";
import User from "../models/User.js";

// CREATE OR UPDATE PORTFOLIO
const createOrUpdatePortfolio = async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({ message: "Only workers allowed" });
    }

    const {
      category,
      skills,
      experience,
      priceRange,
      languages,
      location,
      // new fields
      name,
      age,
      gender,
      email,
      contact,
      pricing,
    } = req.body;

    const portfolio = await Portfolio.findOneAndUpdate(
      { workerId: req.user._id },
      {
        category,
        skills,
        experience,
        priceRange,
        languages,
        location,
        name,
        age,
        gender,
        email,
        contact,
        pricing,
      },
      { returnDocument: "after", upsert: true }  // fixed deprecation warning
    );

    res.json(portfolio);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET OWN PORTFOLIO
const getMyPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      workerId: req.user._id
    }).populate("workerId", "name email");

    res.json(portfolio);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL WORKERS (FILTERED)
const getAllPortfolios = async (req, res) => {
  try {
    const { category } = req.query;

    let filter = {};

    if (category) {
      const users = await User.find({ category });
      const userIds = users.map(u => u._id);
      filter.workerId = { $in: userIds };
    }

    const portfolios = await Portfolio.find(filter)
      .populate("workerId", "name category");

    res.json(portfolios);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE WORKER
const getPortfolioByWorkerId = async (req, res) => {
  try {
    const { lang } = req.query;

    const portfolio = await Portfolio.findOne({
      workerId: req.params.workerId
    }).populate("workerId", "name");

    if (!portfolio) {
      return res.status(404).json({ message: "Not found" });
    }

    let translatedDescription = portfolio.description;

    if (lang && portfolio.description) {
      translatedDescription = await translateText(portfolio.description, lang);
    }

    res.json({
      ...portfolio._doc,
      translatedDescription
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PORTFOLIO (called after ML auto-fill or manual edit from frontend)
const updatePortfolio = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      email,
      contact,
      experience,
      pricing,
      skills,
      // also allow updating these if sent
      category,
      priceRange,
      languages,
      location,
    } = req.body;

    // Build update object — only include fields that were actually sent
    const updates = {};
    if (name       !== undefined) updates.name       = name;
    if (age        !== undefined) updates.age        = age;
    if (gender     !== undefined) updates.gender     = gender;
    if (email      !== undefined) updates.email      = email;
    if (contact    !== undefined) updates.contact    = contact;
    if (experience !== undefined) updates.experience = experience;
    if (pricing    !== undefined) updates.pricing    = pricing;
    if (skills     !== undefined) updates.skills     = skills;
    if (category   !== undefined) updates.category   = category;
    if (priceRange !== undefined) updates.priceRange = priceRange;
    if (languages  !== undefined) updates.languages  = languages;
    if (location   !== undefined) updates.location   = location;

    const portfolio = await Portfolio.findOneAndUpdate(
      { workerId: req.user._id },  // consistent: use _id not .id
      updates,
      { returnDocument: "after", upsert: true }
    );

    res.json({ portfolio });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export {
  createOrUpdatePortfolio,
  getMyPortfolio,
  getAllPortfolios,
  getPortfolioByWorkerId,
  updatePortfolio
};