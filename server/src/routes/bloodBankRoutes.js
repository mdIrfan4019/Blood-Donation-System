import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { viewInventory } from "../controllers/inventoryController.js";
import { upsertBloodBankProfile, getBloodBankProfile } from "../controllers/bloodBankProfileController.js";

const router = express.Router();

router.get("/inventory", protect, viewInventory);

router.get("/profile", protect, allowRoles("bloodbank"), getBloodBankProfile);
router.post("/profile", protect, allowRoles("bloodbank"), upsertBloodBankProfile);

export default router;
