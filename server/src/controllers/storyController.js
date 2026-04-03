import Story from "../models/Story.js";

// @desc    Get all approved stories
// @route   GET /api/stories
// @access  Public
export const getStories = async (req, res) => {
  try {
    const stories = await Story.find({ isApproved: true })
      .sort({ createdAt: -1 }) // Newest first
      .limit(10); // Limit to top 10 recent stories

    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stories", error: error.message });
  }
};

// @desc    Submit a new story
// @route   POST /api/stories
// @access  Public
export const submitStory = async (req, res) => {
  try {
    const { name, role, text } = req.body;

    if (!name || !role || !text) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const newStory = await Story.create({
      name,
      role,
      text,
      // isApproved defaults to true
    });

    res.status(201).json(newStory);
  } catch (error) {
    res.status(500).json({ message: "Failed to submit story. Please try again.", error: error.message });
  }
};
