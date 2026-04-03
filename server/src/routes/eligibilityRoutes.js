import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { checkEligibility } from "../controllers/eligibilityController.js";

const router = express.Router();
router.post("/check", protect, checkEligibility);

export default router;
