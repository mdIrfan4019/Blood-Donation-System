import express from "express";
import { protect, adminOnly, } from "../middleware/authMiddleware.js";

import {
  getAdminStats,
  getAllUsers,
  deleteUser,
  blockUser,
  unblockUser,
} from "../controllers/adminController.js";

const router = express.Router();

// ADMIN STATS
router.get("/stats", protect, adminOnly, getAdminStats);

// USERS
router.get("/users", protect, adminOnly, getAllUsers);
router.delete("/users/:id", protect, adminOnly, deleteUser);
router.patch("/users/:id/block", protect, adminOnly, blockUser);
router.patch("/users/:id/unblock", protect, adminOnly, unblockUser);

export default router;
