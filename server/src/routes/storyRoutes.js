import express from "express";
import { getStories, submitStory } from "../controllers/storyController.js";

const router = express.Router();

router.get("/", getStories);
router.post("/", submitStory);

export default router;
