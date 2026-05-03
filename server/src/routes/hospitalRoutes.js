import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
  getInventoryForRequest,
  viewRequests,
  addStaff,
  getStaff,
  approveDonation,
  submitTestResults,
  registerPatient,
  requestBlood,
  getDoctorRequests,
  completeBloodRequest,
  getPatients,
  getAllHospitals,
  getHospitalInventory,
  addInventoryItem,
  createCamp,
  getCamps,
  getHospitalCamps,
  getAllBloodBanks,
  getDemandHistory,
  forecastDemand,
  deleteNetworkUser,
  blockNetworkUser,
  unblockNetworkUser,
  deletePatient,
  blockPatient,
  unblockPatient,
  claimDonation,
  getTestingHistory
} from "../controllers/hospitalController.js";
import { upsertHospitalProfile, getHospitalProfile } from "../controllers/hospitalProfileController.js";

const router = express.Router();

router.get("/all", protect, getAllHospitals);
router.get("/inventory", protect, allowRoles("hospital"), getHospitalInventory);
router.post("/inventory", protect, allowRoles("hospital"), addInventoryItem);
router.get("/profile", protect, allowRoles("hospital"), getHospitalProfile);
router.post("/profile", protect, allowRoles("hospital"), upsertHospitalProfile);

// Camp management
router.post("/camp", protect, allowRoles("hospital"), createCamp);
router.get("/camp/all", protect, getCamps); // Donors can see all active camps
router.get("/camp/my", protect, allowRoles("hospital"), getHospitalCamps);

// Staff management
router.post("/staff", protect, allowRoles("hospital"), addStaff);
router.get("/staff", protect, allowRoles("hospital"), getStaff);

// New Workflows
router.patch("/donation/approve/:id", protect, allowRoles("hospital"), approveDonation);
router.patch("/donation/claim/:id", protect, allowRoles("tester", "hospital"), claimDonation);
router.post("/lab/test", protect, allowRoles("tester", "hospital"), submitTestResults);
router.get("/lab/history", protect, allowRoles("tester", "hospital"), getTestingHistory);
router.post("/patient/register", protect, allowRoles("hospital", "receptionist"), registerPatient);
router.get("/patients", protect, allowRoles("hospital", "doctor", "receptionist"), getPatients);
router.post("/doctor/request", protect, allowRoles("doctor", "hospital"), requestBlood);
router.get("/doctor/requests", protect, allowRoles("doctor", "hospital"), getDoctorRequests);
router.patch("/doctor/complete/:id", protect, allowRoles("doctor", "hospital"), completeBloodRequest);

router.get("/inventory/:bloodGroup", protect, allowRoles("hospital", "doctor"), getInventoryForRequest);
router.get("/requests", protect, allowRoles("hospital", "doctor", "tester"), viewRequests);

// Network
router.get("/bloodbanks", protect, allowRoles("hospital"), getAllBloodBanks);

// Forecasting
router.get("/demand-history", protect, allowRoles("hospital"), getDemandHistory);
router.post("/forecast", protect, allowRoles("hospital"), forecastDemand);

// Network Moderation
router.delete("/user/:id", protect, allowRoles("hospital"), deleteNetworkUser);
router.patch("/user/:id/block", protect, allowRoles("hospital"), blockNetworkUser);
router.patch("/user/:id/unblock", protect, allowRoles("hospital"), unblockNetworkUser);

router.delete("/patient/:id", protect, allowRoles("hospital"), deletePatient);
router.patch("/patient/:id/block", protect, allowRoles("hospital"), blockPatient);
router.patch("/patient/:id/unblock", protect, allowRoles("hospital"), unblockPatient);

export default router;
