import express from "express"
import {
 createOrUpdatePortfolio,
  getMyPortfolio,
  getPortfolioByWorkerId,
  getAllPortfolios
} from "../controllers/portfolio.controller.js"

import { protect } from "../middleware/auth.middleware.js"

const router = express.Router();

router.post("/", protect, createOrUpdatePortfolio)
router.get("/me", protect, getMyPortfolio)
router.get("/worker/:workerId", protect, getPortfolioByWorkerId)
router.get("/", protect, getAllPortfolios)

export default router;