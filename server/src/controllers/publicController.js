import User from "../models/User.js";
import HospitalProfile from "../models/HospitalProfile.js";
import BloodRequest from "../models/BloodRequest.js";
import Inventory from "../models/Inventory.js";

// @desc    Get global platform stats
// @route   GET /api/public/stats
// @access  Public
export const getGlobalStats = async (req, res) => {
  try {
    const [donorsCount, hospitalsCount, requestsCount, inventoryResult] = await Promise.all([
      User.countDocuments({ role: "donor" }),
      User.countDocuments({ role: "hospital" }),
      BloodRequest.countDocuments({ status: { $ne: "completed" } }), 
      Inventory.aggregate([{ $group: { _id: null, total: { $sum: "$unitsAvailable" } } }]),
    ]);

    const totalRequests = await BloodRequest.countDocuments();

    // calculate total inventory across all hospitals
    const inventoryCount = inventoryResult.length > 0 ? inventoryResult[0].total : 0;

    res.status(200).json({
      donors: donorsCount,
      hospitals: hospitalsCount,
      requests: totalRequests,
      inventory: inventoryCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load global stats", error: error.message });
  }
};
