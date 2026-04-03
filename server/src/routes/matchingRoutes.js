import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { matchDonor } from "../controllers/matchingController.js";

const router = express.Router();

router.post("/match/:id", protect, matchDonor);

export default router;
