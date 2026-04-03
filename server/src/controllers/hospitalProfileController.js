import HospitalProfile from "../models/HospitalProfile.js";

/**
 * UPSERT Hospital Profile
 * POST /api/hospital/profile
 */
export const upsertHospitalProfile = async (req, res) => {
  try {
    const { 
      name, 
      address, 
      state, 
      district, 
      contactNumber, 
      emergencyContact, 
      hospitalType, 
      licenseNumber, 
      totalBeds, 
      icuBeds, 
      location 
    } = req.body;

    const profile = await HospitalProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        name,
        address,
        state,
        district,
        contactNumber,
        emergencyContact,
        hospitalType,
        licenseNumber,
        totalBeds,
        icuBeds,
        location,
      },
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (error) {
    console.error("Hospital Profile Error:", error);
    res.status(500).json({ message: "Failed to save hospital profile" });
  }
};

/**
 * GET Hospital Profile
 * GET /api/hospital/profile
 */
export const getHospitalProfile = async (req, res) => {
  try {
    const profile = await HospitalProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (error) {
    console.error("Get Hospital Profile Error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
