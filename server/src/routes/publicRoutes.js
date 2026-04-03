import express from "express";
import { getGlobalStats } from "../controllers/publicController.js";

const router = express.Router();

router.get("/stats", getGlobalStats);

export default router;
