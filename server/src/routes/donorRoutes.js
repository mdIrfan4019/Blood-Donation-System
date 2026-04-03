import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { upsertProfile, getDashboard, getCertificate } from "../controllers/donorController.js";
import { donateBlood } from "../controllers/donorController.js";


const router = express.Router();

router.post("/profile", protect, allowRoles("donor"), upsertProfile);
router.get("/dashboard", protect, allowRoles("donor"), getDashboard);
router.post("/donate", protect, allowRoles("donor"), donateBlood);
router.get("/certificate/:donationId", protect, getCertificate);


export default router;
