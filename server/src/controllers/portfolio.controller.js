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
      location
    } = req.body;

    const portfolio = await Portfolio.findOneAndUpdate(
      { workerId: req.user._id },
      {
        category,
        skills,
        experience,
        priceRange,
        languages,
        location
      },
      { new: true, upsert: true }
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

    const portfolios = await Portfolio.find(filter).populate("workerId", "name category");

    res.json(portfolios);

  } catch (err) {
    console.log(err)
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

    if (lang) {
      translatedDescription = await translateText(
        portfolio.description,
        lang
      );
    }

    res.json({
      ...portfolio._doc,
      translatedDescription
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createOrUpdatePortfolio,
  getMyPortfolio,
  getAllPortfolios,
  getPortfolioByWorkerId
};