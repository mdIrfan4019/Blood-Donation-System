import { checkEligibilityAI } from "../services/aiService.js";

export const checkEligibility = async (req, res) => {
  try {
    const result = await checkEligibilityAI(req.body);

    // Safety fallback
    if (!result || !result.status) {
      return res.status(400).json({
        message: "Invalid AI response",
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Eligibility Error:", error);

    res.status(500).json({
      message: "AI service unavailable",
    });
  }
};
