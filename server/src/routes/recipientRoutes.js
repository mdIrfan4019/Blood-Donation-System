import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import {
  createRequest,
  myRequests,
} from "../controllers/recipientController.js";

const router = express.Router();

router.post("/request", protect, allowRoles("recipient"), createRequest);
router.get("/my-requests", protect, allowRoles("recipient"), myRequests);

export default router;
