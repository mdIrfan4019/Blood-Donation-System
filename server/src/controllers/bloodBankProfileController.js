import BloodBankProfile from "../models/BloodBankProfile.js";

/**
 * UPSERT Blood Bank Profile
 * POST /api/bloodbank/profile
 */
export const upsertBloodBankProfile = async (req, res) => {
  try {
    const { address, licenseNumber, location } = req.body;

    const profile = await BloodBankProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        address,
        licenseNumber,
        location,
      },
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (error) {
    console.error("Blood Bank Profile Error:", error);
    res.status(500).json({ message: "Failed to save blood bank profile" });
  }
};

/**
 * GET Blood Bank Profile
 * GET /api/bloodbank/profile
 */
export const getBloodBankProfile = async (req, res) => {
  try {
    const profile = await BloodBankProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (error) {
    console.error("Get Blood Bank Profile Error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
