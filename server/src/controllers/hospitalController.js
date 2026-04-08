import BloodRequest from "../models/BloodRequest.js";
import Inventory from "../models/Inventory.js";
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Donation from "../models/Donation.js";
import BloodTest from "../models/BloodTest.js";
import Camp from "../models/Camp.js";
import HospitalProfile from "../models/HospitalProfile.js";
import { forecastDemandAI } from "../services/aiService.js";
import { sendMail } from "../services/mailService.js";

// Compatibility Map (Receiver -> Allowed Donor Blood)
const compatibility = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"],
  "AB+": ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
  "AB-": ["A-", "B-", "O-", "AB-"],
};

/* ======================================================
   GET INVENTORY FOR REQUEST (COMPATIBILITY CHECK)
   GET /api/hospital/inventory/:bloodGroup
====================================================== */
export const getInventoryForRequest = async (req, res) => {
  try {
    const { bloodGroup } = req.params;
    const allowedGroups = compatibility[bloodGroup];

    if (!allowedGroups) {
      return res.status(400).json({ message: "Invalid blood group" });
    }

    const hospitalId = req.user.hospitalId || req.user._id;
    const items = await Inventory.find({
      hospitalId,
      bloodGroup: { $in: allowedGroups },
    });

    const totalAvailable = items.reduce(
      (sum, i) => sum + (i.unitsAvailable || 0),
      0
    );

    res.json({
      requestedBloodGroup: bloodGroup,
      compatibleGroups: allowedGroups,
      items,
      totalAvailable,
    });
  } catch (error) {
    console.error("Inventory check error:", error);
    res.status(500).json({ message: "Failed to fetch inventory summary" });
  }
};

/* ======================================================
   STAFF MANAGEMENT (Hospital Admin Only)
   POST /api/hospital/staff
====================================================== */
export const addStaff = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const allowedRoles = ["doctor", "nurse", "tester", "receptionist"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid staff role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const staffMember = await User.create({
      name,
      email,
      password,
      phone: phone || undefined, // Sparse unique index requires undefined, not empty string
      role,
      hospitalId: req.user._id, // Linked to current hospital admin
    });

    const hospital = await User.findById(req.user._id).select("name");

    const subject = `Welcome to ${hospital.name} - Your Staff Account`;
    const text = `Hello ${name},\n\nYou have been added as a ${role} at ${hospital.name}.\n\nYour login credentials are:\nEmail: ${email}\nPassword: ${password}\n\nPlease login independently to access your dashboard and fulfill your duties.\n\nThank you!`;
    
    try {
      await sendMail(email, subject, text);
    } catch (e) {
      console.error("Staff invitation email sending failed:", e);
    }

    res.status(201).json({ message: "Staff member added successfully", staffMember });
  } catch (error) {
    console.error("Add Staff Error:", error);
    res.status(500).json({ message: "Failed to add staff" });
  }
};

/* ======================================================
   GET STAFF MEMBERS
   GET /api/hospital/staff
====================================================== */
export const getStaff = async (req, res) => {
  try {
    const hId = req.user.hospitalId || req.user._id;
    const staff = await User.find({ hospitalId: hId, role: { $in: ["doctor", "nurse", "tester", "receptionist"] } }).select("-password");
    res.json(staff);
  } catch (error) {
    console.error("Get Staff Error:", error);
    res.status(500).json({ message: "Failed to fetch staff members" });
  }
};

/* ======================================================
   APPROVE DONOR APPLICATION
   PATCH /api/hospital/donation/approve/:id
====================================================== */
export const approveDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    // Ensure it belongs to this hospital
    if (donation.hospitalId.toString() !== req.user.hospitalId?.toString() && donation.hospitalId.toString() !== req.user._id.toString()) {
       return res.status(403).json({ message: "Unauthorized hospital action" });
    }

    donation.status = "testing";
    await donation.save();

    res.json({ message: "Donation approved and moved to testing", donation });
  } catch (error) {
    console.error("Approve Donation Error:", error);
    res.status(500).json({ message: "Failed to approve donation" });
  }
};

/* ======================================================
   CLAIM DONATION FOR TESTING
   PATCH /api/hospital/donation/claim/:id
====================================================== */
export const claimDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    if (donation.status !== "testing") {
      return res.status(400).json({ message: "Donation is not in testing status" });
    }

    if (donation.testerId) {
      return res.status(400).json({ message: "Donation already claimed by another tester" });
    }

    donation.testerId = req.user._id;
    await donation.save();

    res.json({ message: "Donation successfully claimed for screening", donation });
  } catch (error) {
    console.error("Claim Donation Error:", error);
    res.status(500).json({ message: "Failed to claim donation" });
  }
};

/* ======================================================
   SUBMIT TEST RESULTS (Tester Role)
   POST /api/hospital/lab/test
====================================================== */
export const submitTestResults = async (req, res) => {
  try {
    const { donationId, results, remarks } = req.body;
    const donation = await Donation.findById(donationId);
    
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    // Enforce tester assignment
    if (donation.testerId && donation.testerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the assigned tester can submit results for this donation" });
    }

    // Prevent duplicate tests
    const existingTest = await BloodTest.findOne({ donation: donationId });
    if (existingTest) {
      return res.status(400).json({ message: "Test results already submitted for this donation" });
    }

    // Check if any results are positive
    const isSafe = Object.values(results).every(val => val === "negative");
    const status = isSafe ? "safe" : "unsafe";

    const bloodTest = await BloodTest.create({
      donation: donationId,
      results,
      remarks,
      status,
      testedBy: req.user._id,
    });

    donation.testResult = bloodTest._id;
    donation.status = status;
    await donation.save();

    if (isSafe) {
      // Add to inventory with components split (Plasma, Platelets, RBC)
      const components = ["Plasma", "Platelets", "RBC"];
      const temps = { "Plasma": "-30°C", "Platelets": "22°C", "RBC": "4°C" };
      const shelfLives = { "Plasma": 365, "Platelets": 5, "RBC": 42 };

      for (const comp of components) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + shelfLives[comp]);

        await Inventory.findOneAndUpdate(
          { 
            hospitalId: donation.hospitalId, 
            bloodGroup: donation.bloodGroup, 
            component: comp 
          },
          { 
            $inc: { unitsAvailable: donation.units },
            $set: { 
              temperature: temps[comp],
              expiryDate: expiryDate
            }
          },
          { upsert: true, new: true }
        );
      }
    }

    res.json({ message: `Testing complete. Blood is marked as ${status}`, bloodTest });
  } catch (error) {
    console.error("Lab Test Error:", error);
    res.status(500).json({ message: "Failed to submit test results" });
  }
};

/* ======================================================
   REGISTER PATIENT (Receptionist Role)
   POST /api/hospital/patient/register
====================================================== */
export const registerPatient = async (req, res) => {
  try {
    const { name, age, gender, bloodGroup } = req.body;
    const hId = req.user.hospitalId || req.user._id;
    console.log(`[DEBUG] Registering patient for HospitalID: ${hId} by UserID: ${req.user._id} (Role: ${req.user.role})`);
    
    const patient = await Patient.create({
      name,
      age,
      gender,
      bloodGroup,
      hospitalId: hId,
      registeredBy: req.user._id,
    });
    res.status(201).json({ message: "Patient registered successfully", patient });
  } catch (error) {
    console.error("Patient Registration Error:", error);
    res.status(500).json({ message: "Failed to register patient" });
  }
};

/* ======================================================
   REQUEST BLOOD (Doctor Role)
   POST /api/hospital/doctor/request
====================================================== */
export const requestBlood = async (req, res) => {
  let lockAcquired = false;
  const { patientId, bloodGroup, component, units } = req.body;
  
  try {
    const hospitalId = req.user.hospitalId || req.user._id;

    // 1. ATOMIC LOCK: Try to claim the assignment slot for this patient
    const patientRecord = await Patient.findOneAndUpdate(
      { _id: patientId, hospitalId, isAssignedBlood: false, isBlocked: false },
      { $set: { isAssignedBlood: true } },
      { new: true }
    );

    if (!patientRecord) {
      return res.status(400).json({ 
        message: "Assignment Denied: Patient either already has an active blood request, is not found, or is currently on hold." 
      });
    }
    lockAcquired = true;

    // Get allowed donor groups for the requested blood group
    const allowedGroups = compatibility[bloodGroup];
    if (!allowedGroups) {
      // Revert lock if invalid input
      await Patient.findByIdAndUpdate(patientId, { $set: { isAssignedBlood: false } });
      return res.status(400).json({ message: "Invalid blood group requested" });
    }

    // Check total compatible inventory first
    const compatibleInventory = await Inventory.find({
      hospitalId,
      bloodGroup: { $in: allowedGroups },
      component,
      unitsAvailable: { $gt: 0 }
    }).sort({ bloodGroup: 1 });

    // Sort to ensure exact match comes first
    compatibleInventory.sort((a, b) => {
      if (a.bloodGroup === bloodGroup) return -1;
      if (b.bloodGroup === bloodGroup) return 1;
      return 0;
    });

    const totalAvailable = compatibleInventory.reduce((sum, item) => sum + item.unitsAvailable, 0);

    if (totalAvailable < units) {
      // Revert lock if insufficient inventory
      await Patient.findByIdAndUpdate(patientId, { $set: { isAssignedBlood: false } });
      return res.status(400).json({ message: `Insufficient stock. Required: ${units}, Available: ${totalAvailable} (Compatible with ${bloodGroup})` });
    }

    // Create the blood request record
    const request = await BloodRequest.create({
      requester: req.user._id,
      patient: patientId,
      hospitalId,
      bloodGroup,
      component,
      units,
      status: "approved",
    });

    // Deduct units from inventory
    let unitsToDeduct = units;
    for (const item of compatibleInventory) {
      if (unitsToDeduct <= 0) break;

      const deduct = Math.min(item.unitsAvailable, unitsToDeduct);
      item.unitsAvailable -= deduct;
      unitsToDeduct -= deduct;
      await item.save();
    }

    res.status(201).json({ message: "Blood request approved and units assigned to patient", request });
  } catch (error) {
    console.error("Blood Request Error:", error);
    // 2. SAFETY REVERSION: Release lock if an unexpected error occurs during the process
    if (lockAcquired) {
       await Patient.findByIdAndUpdate(patientId, { $set: { isAssignedBlood: false } });
    }
    res.status(500).json({ message: "Failed to process blood request" });
  }
};

/* ======================================================
   GET DOCTOR REQUESTS
   GET /api/hospital/doctor/requests
====================================================== */
export const getDoctorRequests = async (req, res) => {
  try {
    const hId = req.user.hospitalId || req.user._id;
    const isHospitalAdmin = req.user.role === "hospital";
    
    // If hospital admin, show all requests for their hospital. If doctor, show only their requests.
    const filter = isHospitalAdmin ? { hospitalId: hId } : { requester: req.user._id };

    const requests = await BloodRequest.find(filter)
      .populate("patient", "name bloodGroup")
      .populate("requester", "name")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("Fetch Doctor Requests Error:", error);
    res.status(500).json({ message: "Failed to fetch blood requests" });
  }
};

/* ======================================================
   COMPLETE BLOOD REQUEST (Handover)
   PATCH /api/hospital/doctor/complete/:id
====================================================== */
export const completeBloodRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status === "completed") {
      return res.status(400).json({ message: "Request is already completed" });
    }

    // Validate ownership or hospital association
    const hId = req.user.hospitalId || req.user._id;
    const isOwner = request.requester.toString() === req.user._id.toString();
    const isFromMyHospital = request.hospitalId.toString() === hId.toString();

    if (!isOwner && !isFromMyHospital) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    request.status = "completed";
    request.completedAt = new Date();
    await request.save();

    // 3. RELEASE LOCK: Set patient.isAssignedBlood to false upon completion
    await Patient.findByIdAndUpdate(request.patient, { $set: { isAssignedBlood: false } });

    res.json({ message: "Blood handout confirmed and request marked as completed", request });
  } catch (error) {
    console.error("Complete Request Error:", error);
    res.status(500).json({ message: "Failed to complete request" });
  }
};

export const getPatients = async (req, res) => {
  try {
    const hId = req.user.hospitalId || req.user._id;
    console.log(`[DEBUG] Fetching patients for HospitalID: ${hId} requested by UserID: ${req.user._id} (Role: ${req.user.role})`);
    
    const patients = await Patient.find({ hospitalId: hId }).sort({ name: 1 });
    console.log(`[DEBUG] Found ${patients.length} patients for HospitalID: ${hId}`);
    
    res.json(patients);
  } catch (error) {
    console.error("View Patients Error:", error);
    res.status(500).json({ message: "Failed to fetch patients" });
  }
};

export const getAllHospitals = async (req, res) => {
  try {
    const { state, district } = req.query;
    const filter = { role: "hospital" };
    
    // This is a bit tricky since location is in HospitalProfile
    // We'll fetch profiles first if filtering is needed
    if (state || district) {
      const profileFilter = {};
      if (state) profileFilter.state = state;
      if (district) profileFilter.district = district;
      
      const profiles = await HospitalProfile.find(profileFilter).select("user");
      const hospitalIds = profiles.map(p => p.user);
      filter._id = { $in: hospitalIds };
    }

    const hospitals = await User.find(filter).select("name _id");
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch hospitals" });
  }
};

/* ======================================================
   CAMP MANAGEMENT
====================================================== */

export const createCamp = async (req, res) => {
  try {
    const { name, state, district, address, location, startDate, endDate, description } = req.body;
    const hospitalId = req.user.hospitalId || req.user._id;

    const camp = await Camp.create({
      hospitalId,
      name,
      state,
      district,
      address,
      location,
      startDate,
      endDate,
      description
    });

    res.status(201).json({ message: "Camp created successfully", camp });
  } catch (error) {
    console.error("Create Camp Error:", error);
    res.status(500).json({ message: "Failed to create camp" });
  }
};

export const getCamps = async (req, res) => {
  try {
    const { state, district } = req.query;
    const filter = { status: "active" };
    if (state) filter.state = state;
    if (district) filter.district = district;

    const camps = await Camp.find(filter).populate("hospitalId", "name");
    res.json(camps);
  } catch (error) {
    console.error("Get Camps Error:", error);
    res.status(500).json({ message: "Failed to fetch camps" });
  }
};

export const getHospitalCamps = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId || req.user._id;
    const camps = await Camp.find({ hospitalId }).sort({ startDate: -1 });
    res.json(camps);
  } catch (error) {
    console.error("Get Hospital Camps Error:", error);
    res.status(500).json({ message: "Failed to fetch hospital camps" });
  }
};

export const viewRequests = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId || req.user._id;

    const [bRequests, donations] = await Promise.all([
      BloodRequest.find({ hospitalId })
        .populate("requester", "name email phone")
        .populate("patient", "name bloodGroup")
        .lean(),
      Donation.find({ hospitalId })
        .populate("donor", "name email phone")
        .lean(),
    ]);

    // Combine and sort by creation date (descending)
    const combined = [...bRequests, ...donations].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(combined);
  } catch (error) {
    console.error("View Requests Error:", error);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

// ... keep compatibility and other older helpers if needed, but the above covers the core new idea.

export const getHospitalInventory = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId || req.user._id;
    const inventory = await Inventory.find({ hospitalId }).sort({ createdAt: -1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
};

export const addInventoryItem = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId || req.user._id;
    const { bloodGroup, component, unitsAvailable, expiryDate, temperature } = req.body;

    const newItem = await Inventory.create({
      hospitalId,
      bloodGroup,
      component: component || "Whole Blood",
      unitsAvailable: Number(unitsAvailable),
      expiryDate,
      temperature
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: "Failed to add inventory item" });
  }
};

/* ======================================================
   GET ALL BLOOD BANKS (Network Directory)
   GET /api/hospital/bloodbanks
====================================================== */
export const getAllBloodBanks = async (req, res) => {
  try {
    const bloodbanks = await User.find({ role: "bloodbank" }).select("name email phone");
    res.json(bloodbanks);
  } catch (error) {
    console.error("Get Blood Banks Error:", error);
    res.status(500).json({ message: "Failed to fetch blood banks" });
  }
};

/* ======================================================
   GET LOGAL DEMAND HISTORY (HOSPITAL SPECIFIC)
   GET /api/hospital/demand-history?bloodGroup=A+&days=30&type=daily
====================================================== */
export const getDemandHistory = async (req, res) => {
  try {
    const { bloodGroup, days = 30, type = "daily" } = req.query;
    const hospitalId = req.user.hospitalId || req.user._id;

    if (!bloodGroup) {
      return res.status(400).json({ message: "bloodGroup query param is required" });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const groupBy = type === "weekly"
      ? { year: { $year: "$createdAt" }, week: { $week: "$createdAt" } }
      : { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };

    const history = await BloodRequest.aggregate([
      {
        $match: {
          hospitalId,
          bloodGroup,
          status: { $in: ["pending", "completed"] },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: groupBy,
          totalUnits: { $sum: "$units" },
          totalRequests: { $sum: 1 },
          pendingUnits: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$units", 0] } },
          completedUnits: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$units", 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
      {
        $project: {
          _id: 0,
          label: type === "weekly"
            ? { $concat: ["Week ", { $toString: "$_id.week" }, " (", { $toString: "$_id.year" }, ")"] }
            : {
                $concat: [
                  { $toString: "$_id.year" }, "-",
                  { $cond: [{ $lt: ["$_id.month", 10] }, { $concat: ["0", { $toString: "$_id.month" }] }, { $toString: "$_id.month" }] }, "-",
                  { $cond: [{ $lt: ["$_id.day", 10] }, { $concat: ["0", { $toString: "$_id.day" }] }, { $toString: "$_id.day" }] },
                ],
              },
          totalUnits: 1, totalRequests: 1, pendingUnits: 1, completedUnits: 1,
        },
      },
    ]);

    res.json({ bloodGroup, type, days: Number(days), history, series: history.map((h) => h.totalUnits) });
  } catch (error) {
    console.error("Demand History Error:", error);
    res.status(500).json({ message: "Failed to fetch demand history" });
  }
};

/* ======================================================
   FORECAST DEMAND LOCALIZED
   POST /api/hospital/forecast
   body: { bloodGroup: "A+", days: 30, type: "daily" }
====================================================== */
export const forecastDemand = async (req, res) => {
  try {
    const { bloodGroup, days = 30, type = "daily" } = req.body;
    const hospitalId = req.user.hospitalId || req.user._id;

    if (!bloodGroup) {
      return res.status(400).json({ message: "bloodGroup is required" });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const groupBy = type === "weekly"
      ? { year: { $year: "$createdAt" }, week: { $week: "$createdAt" } }
      : { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };

    const history = await BloodRequest.aggregate([
      {
        $match: {
          hospitalId,
          bloodGroup,
          status: { $in: ["pending", "completed"] },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: groupBy,
          totalUnits: { $sum: "$units" },
          totalRequests: { $sum: 1 },
          pendingUnits: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$units", 0] } },
          completedUnits: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$units", 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
    ]);

    const series = history.map((h) => h.totalUnits);

    if (series.length < 3) {
      return res.status(400).json({
        message: "Not enough demand history data for this hospital (minimum 3 records required)",
        series, found: series.length,
      });
    }

    const forecastResult = await forecastDemandAI(series);
    const predictedUnits = Math.round(forecastResult.predicted_units || 0);

    const inventoryAgg = await Inventory.aggregate([
      { $match: { hospitalId, bloodGroup } },
      { $group: { _id: null, totalUnits: { $sum: "$unitsAvailable" } } },
    ]);
    const totalStock = inventoryAgg.length > 0 ? inventoryAgg[0].totalUnits : 0;
    const shortage = predictedUnits > totalStock;

    const chartData = history.map((h, index) => ({
      label: type === "weekly" ? `Week ${h._id.week}` : `Point ${index + 1}`,
      demand: h.totalUnits, pending: h.pendingUnits, completed: h.completedUnits,
    }));
    chartData.push({ label: "Forecast", demand: predictedUnits, pending: null, completed: null });

    res.json({
      bloodGroup, type, days: Number(days), predicted_units: predictedUnits, totalStock,
      shortage, shortageBy: shortage ? predictedUnits - totalStock : 0, history, series, chartData,
      suggestion: shortage ? `⚠️ Predicted demand escapes local stock limit. Add ${predictedUnits - totalStock} units.` : "✅ Local stock sufficient.",
    });
  } catch (err) {
    console.error("Forecast Error:", err);
    res.status(500).json({ message: "Demand forecast failed" });
  }
};

/* ======================================================
   USER MANAGEMENT (Staff & BloodBanks)
====================================================== */
export const deleteNetworkUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Restrict deletion to staff of this hospital OR generic blood banks
    if (user.role !== "bloodbank" && user.hospitalId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this user" });
    }

    await user.deleteOne();
    res.json({ message: "Network user removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

export const blockNetworkUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "bloodbank" && user.hospitalId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to block this user" });
    }

    user.isBlocked = true;
    await user.save();
    res.json({ message: "Network user blocked", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to block user" });
  }
};

export const unblockNetworkUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "bloodbank" && user.hospitalId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to unblock this user" });
    }

    user.isBlocked = false;
    await user.save();
    res.json({ message: "Network user unblocked", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to unblock user" });
  }
};

/* ======================================================
   PATIENT MANAGEMENT
====================================================== */
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const hospitalId = req.user.hospitalId || req.user._id;
    if (patient.hospitalId.toString() !== hospitalId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this patient" });
    }

    await patient.deleteOne();
    res.json({ message: "Patient removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete patient" });
  }
};

export const blockPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const hospitalId = req.user.hospitalId || req.user._id;
    if (patient.hospitalId.toString() !== hospitalId.toString()) {
      return res.status(403).json({ message: "Not authorized to block this patient" });
    }

    patient.isBlocked = true;
    await patient.save();
    res.json({ message: "Patient blocked successfully", patient });
  } catch (error) {
    res.status(500).json({ message: "Failed to block patient" });
  }
};

/* ======================================================
   GET TESTING HISTORY (LAB TESTER)
   GET /api/hospital/lab/history
====================================================== */
export const getTestingHistory = async (req, res) => {
  try {
    const history = await BloodTest.find({ testedBy: req.user._id })
      .populate({
        path: "donation",
        populate: { path: "donor", select: "name email phone" }
      })
      .sort({ testedAt: -1 });

    res.json(history);
  } catch (error) {
    console.error("Fetch Testing History Error:", error);
    res.status(500).json({ message: "Failed to fetch testing history" });
  }
};

export const unblockPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const hospitalId = req.user.hospitalId || req.user._id;
    if (patient.hospitalId.toString() !== hospitalId.toString()) {
      return res.status(403).json({ message: "Not authorized to unblock this patient" });
    }

    patient.isBlocked = false;
    await patient.save();
    res.json({ message: "Patient unblocked successfully", patient });
  } catch (error) {
    res.status(500).json({ message: "Failed to unblock patient" });
  }
};
