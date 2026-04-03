// import User from "../models/User.js";
// import Donation from "../models/Donation.js";
// import Inventory from "../models/Inventory.js";
// import BloodRequest from "../models/BloodRequest.js";
// import { forecastDemandAI } from "../services/aiService.js";

// /* ======================================================
//    GET ALL USERS (ADMIN)
//    GET /api/admin/users
// ====================================================== */
// export const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find().select("-password").sort({ createdAt: -1 });

//     res.json(users);
//   } catch (error) {
//     console.error("Get Users Error:", error);
//     res.status(500).json({ message: "Failed to fetch users" });
//   }
// };



// /* ======================================================
//    GET DEMAND HISTORY (AGGREGATED)
//    GET /api/admin/demand-history?bloodGroup=A+&days=30&type=daily
// ====================================================== */
// export const getDemandHistory = async (req, res) => {
//   try {
//     const { bloodGroup, days = 30, type = "daily" } = req.query;

//     if (!bloodGroup) {
//       return res.status(400).json({
//         message: "bloodGroup query param is required",
//       });
//     }

//     const startDate = new Date();
//     startDate.setDate(startDate.getDate() - Number(days));

//     // daily grouping
//     let groupBy =
//       type === "weekly"
//         ? {
//             year: { $year: "$createdAt" },
//             week: { $week: "$createdAt" },
//           }
//         : {
//             year: { $year: "$createdAt" },
//             month: { $month: "$createdAt" },
//             day: { $dayOfMonth: "$createdAt" },
//           };

//     const history = await BloodRequest.aggregate([
//       {
//         $match: {
//           bloodGroup,
//           createdAt: { $gte: startDate },
//         },
//       },
//       {
//         $group: {
//           _id: groupBy,
//           totalUnits: { $sum: "$units" },
//           totalRequests: { $sum: 1 },

//           pendingUnits: {
//             $sum: {
//               $cond: [{ $eq: ["$status", "pending"] }, "$units", 0],
//             },
//           },

//           completedUnits: {
//             $sum: {
//               $cond: [{ $eq: ["$status", "completed"] }, "$units", 0],
//             },
//           },
//         },
//       },
//       {
//         $sort: {
//           "_id.year": 1,
//           "_id.month": 1,
//           "_id.day": 1,
//           "_id.week": 1,
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           label:
//             type === "weekly"
//               ? {
//                   $concat: [
//                     "Week ",
//                     { $toString: "$_id.week" },
//                     " (",
//                     { $toString: "$_id.year" },
//                     ")",
//                   ],
//                 }
//               : {
//                   $concat: [
//                     { $toString: "$_id.year" },
//                     "-",
//                     {
//                       $cond: [
//                         { $lt: ["$_id.month", 10] },
//                         { $concat: ["0", { $toString: "$_id.month" }] },
//                         { $toString: "$_id.month" },
//                       ],
//                     },
//                     "-",
//                     {
//                       $cond: [
//                         { $lt: ["$_id.day", 10] },
//                         { $concat: ["0", { $toString: "$_id.day" }] },
//                         { $toString: "$_id.day" },
//                       ],
//                     },
//                   ],
//                 },

//           totalUnits: 1,
//           totalRequests: 1,
//           pendingUnits: 1,
//           completedUnits: 1,
//         },
//       },
//     ]);

//     res.json({
//       bloodGroup,
//       type,
//       days: Number(days),
//       history,
//       series: history.map((h) => h.totalUnits),
//     });
//   } catch (error) {
//     console.error("Demand History Error:", error);
//     res.status(500).json({
//       message: "Failed to fetch demand history",
//     });
//   }
// };

// /* ======================================================
//    FORECAST DEMAND (FULL FEATURE)
//    POST /api/admin/forecast
//    body: { bloodGroup: "A+", days: 30, type: "daily" }
// ====================================================== */
// export const forecastDemand = async (req, res) => {
//   try {
//     const { bloodGroup, days = 30, type = "daily" } = req.body;

//     if (!bloodGroup) {
//       return res.status(400).json({
//         message: "bloodGroup is required",
//       });
//     }

    

//     const startDate = new Date();
//     startDate.setDate(startDate.getDate() - Number(days));

//     let groupBy =
//       type === "weekly"
//         ? {
//             year: { $year: "$createdAt" },
//             week: { $week: "$createdAt" },
//           }
//         : {
//             year: { $year: "$createdAt" },
//             month: { $month: "$createdAt" },
//             day: { $dayOfMonth: "$createdAt" },
//           };

//     /* ===============================
//        1. GET DEMAND HISTORY FROM DB
//     =============================== */
//     const history = await BloodRequest.aggregate([
//       {
//         $match: {
//           bloodGroup,
//           createdAt: { $gte: startDate },
//         },
//       },
//       {
//         $group: {
//           _id: groupBy,
//           totalUnits: { $sum: "$units" },
//           totalRequests: { $sum: 1 },

//           pendingUnits: {
//             $sum: {
//               $cond: [{ $eq: ["$status", "pending"] }, "$units", 0],
//             },
//           },

//           completedUnits: {
//             $sum: {
//               $cond: [{ $eq: ["$status", "completed"] }, "$units", 0],
//             },
//           },
//         },
//       },
//       {
//         $sort: {
//           "_id.year": 1,
//           "_id.month": 1,
//           "_id.day": 1,
//           "_id.week": 1,
//         },
//       },
//     ]);

//     const series = history.map((h) => h.totalUnits);

//     if (series.length < 3) {
//       return res.status(400).json({
//         message: "Not enough demand history data (minimum 3 records required)",
//         series,
//       });
//     }

//     /* ===============================
//        2. CALL PYTHON AI FORECAST API
//     =============================== */
//     const forecastResult = await forecastDemandAI(series);

//     const predictedUnits = Math.round(forecastResult.predicted_units || 0);

//     /* ===============================
//        3. INVENTORY CHECK (SHORTAGE ALERT)
//     =============================== */
//     const inventoryItems = await Inventory.find({ bloodGroup });

//     const totalStock = inventoryItems.reduce(
//       (sum, inv) => sum + (inv.unitsAvailable || 0),
//       0
//     );

//     const shortage = predictedUnits > totalStock;

//     /* ===============================
//        4. BUILD CHART DATA (FRONTEND READY)
//     =============================== */
//     const chartData = history.map((h, index) => ({
//       label: type === "weekly" ? `Week ${h._id.week}` : `Point ${index + 1}`,
//       demand: h.totalUnits,
//       pending: h.pendingUnits,
//       completed: h.completedUnits,
//     }));

//     chartData.push({
//       label: "Forecast",
//       demand: predictedUnits,
//       pending: null,
//       completed: null,
//     });

//     /* ===============================
//        5. FINAL RESPONSE
//     =============================== */
//     res.json({
//       bloodGroup,
//       type,
//       days: Number(days),

//       predicted_units: predictedUnits,

//       totalStock,
//       shortage,
//       shortageBy: shortage ? predictedUnits - totalStock : 0,

//       history: history.map((h) => ({
//         totalUnits: h.totalUnits,
//         totalRequests: h.totalRequests,
//         pendingUnits: h.pendingUnits,
//         completedUnits: h.completedUnits,
//       })),

//       series,
//       chartData,

//       suggestion: shortage
//         ? `⚠️ Predicted demand is higher than stock. Add at least ${
//             predictedUnits - totalStock
//           } units.`
//         : "✅ Stock is sufficient according to forecast.",
//     });
//   } catch (err) {
//     console.error("Forecast Error:", err);
//     res.status(500).json({
//       message: "Demand forecast failed",
//     });
//   }
// };




// export const getAdminStats = async (req, res) => {
//   try {
//     const totalDonors = await User.countDocuments({ role: "donor" });
//     const totalRecipients = await User.countDocuments({ role: "recipient" });
//     const totalHospitals = await User.countDocuments({ role: "hospital" });

//     const pendingDonations = await Donation.countDocuments({
//       status: "pending",
//     });

//     const approvedDonations = await Donation.countDocuments({
//       status: "approved",
//     });

//     // sum of all inventory units
//     const inventoryAgg = await Inventory.aggregate([
//       {
//         $group: {
//           _id: null,
//           totalUnits: { $sum: "$unitsAvailable" },
//         },
//       },
//     ]);

//     const totalInventoryUnits =
//       inventoryAgg.length > 0 ? inventoryAgg[0].totalUnits : 0;
    
//     const totalRequests = await BloodRequest.countDocuments();

// const pendingRequests = await BloodRequest.countDocuments({
//   status: "pending",
// });
  

//     res.json({
//       totalDonors,
//       totalRecipients,
//       totalHospitals,
//       pendingDonations,
//       approvedDonations,
//       totalInventoryUnits,
//       totalRequests,
//       pendingRequests,
//     });
//   } catch (error) {
//     console.error("Admin Stats Error:", error);
//     res.status(500).json({
//       message: "Failed to load admin stats",
//     });
//   }
// };




// /* ======================================================
//    DELETE USER
//    DELETE /api/admin/users/:id
// ====================================================== */
// export const deleteUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // prevent admin deleting self
//     if (user._id.toString() === req.user._id.toString()) {
//       return res.status(400).json({ message: "You cannot delete your own account" });
//     }

//     await user.deleteOne();

//     res.json({ message: "User deleted successfully" });
//   } catch (error) {
//     console.error("Delete User Error:", error);
//     res.status(500).json({ message: "Failed to delete user" });
//   }
// };

// /* ======================================================
//    BLOCK USER
//    PATCH /api/admin/users/:id/block
// ====================================================== */
// export const blockUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);

//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.role === "admin") {
//       return res.status(400).json({ message: "Admin cannot be blocked" });
//     }

//     user.isBlocked = true;
//     await user.save();

//     res.json({ message: "User blocked successfully", user });
//   } catch (error) {
//     console.error("Block User Error:", error);
//     res.status(500).json({ message: "Failed to block user" });
//   }
// };

// /* ======================================================
//    UNBLOCK USER
//    PATCH /api/admin/users/:id/unblock
// ====================================================== */
// export const unblockUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);

//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.isBlocked = false;
//     await user.save();

//     res.json({ message: "User unblocked successfully", user });
//   } catch (error) {
//     console.error("Unblock User Error:", error);
//     res.status(500).json({ message: "Failed to unblock user" });
//   }
// };


import User from "../models/User.js";

/* ======================================================
   GET ALL USERS (ADMIN)
   GET /api/admin/users
====================================================== */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ["donor", "hospital"] } })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};



/* ======================================================
   GET ADMIN STATS
   GET /api/admin/stats
====================================================== */
export const getAdminStats = async (req, res) => {
  try {
    const totalDonors = await User.countDocuments({ role: "donor" });
    const totalHospitals = await User.countDocuments({ role: "hospital" });

    res.json({
      totalDonors,
      totalHospitals,
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({
      message: "Failed to load admin stats",
    });
  }
};

/* ======================================================
   DELETE USER
   DELETE /api/admin/users/:id
====================================================== */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own account" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

/* ======================================================
   BLOCK USER
   PATCH /api/admin/users/:id/block
====================================================== */
export const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin") {
      return res.status(400).json({ message: "Admin cannot be blocked" });
    }

    user.isBlocked = true;
    await user.save();

    res.json({ message: "User blocked successfully", user });
  } catch (error) {
    console.error("Block User Error:", error);
    res.status(500).json({ message: "Failed to block user" });
  }
};

/* ======================================================
   UNBLOCK USER
   PATCH /api/admin/users/:id/unblock
====================================================== */
export const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = false;
    await user.save();

    res.json({ message: "User unblocked successfully", user });
  } catch (error) {
    console.error("Unblock User Error:", error);
    res.status(500).json({ message: "Failed to unblock user" });
  }
};
