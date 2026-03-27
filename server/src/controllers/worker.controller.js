import Portfolio from "../models/Portfolio.js";

const getWorker = async (req, res) => {
  const { category } = req.query;

  const filter = {};
  if (category) filter.category = category;

  const workers = await Portfolio.find(filter)
    .populate("workerId", "name email");

  res.json(workers);
};

const getWorkerDetails = async (req, res) => {
  const portfolio = await Portfolio.findOne({
    workerId: req.params.id
  }).populate("workerId", "-password");

  if (!portfolio) {
    return res.status(404).json({ message: "Worker not found" });
  }

  res.json(portfolio);
};

export { getWorker, getWorkerDetails };