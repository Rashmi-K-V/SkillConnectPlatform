import Portfolio from "../models/Portfolio.js";

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

    const filter = {};
    if (category) filter.category = category;

    const portfolios = await Portfolio.find(filter)
      .populate("workerId", "name email");

    res.json(portfolios);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE WORKER
const getPortfolioByWorkerId = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      workerId: req.params.workerId
    }).populate("workerId", "name email");

    if (!portfolio) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(portfolio);

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