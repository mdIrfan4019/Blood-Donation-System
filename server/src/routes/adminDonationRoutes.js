import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
  getPendingDonations,
  approveDonation,
  rejectDonation,
  getAllDonations,
  recordBloodTest,
} from "../controllers/adminDonationController.js";

const router = express.Router();

// GET /api/admin/donations/pending
router.get("/pending", protect, allowRoles("admin"), getPendingDonations);

// PATCH /api/admin/donations/approve/:id
router.patch("/approve/:id", protect, allowRoles("admin"), approveDonation);

// PATCH /api/admin/donations/:id/reject ✅ FIXED
router.patch("/:id/reject", protect, allowRoles("admin"), rejectDonation);

router.post("/test/:id", protect, allowRoles("admin"), recordBloodTest);

router.get("/all", protect, allowRoles("admin"), getAllDonations);


export default router;
