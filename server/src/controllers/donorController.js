import DonorProfile from "../models/DonorProfile.js";
import Donation from "../models/Donation.js";
import User from "../models/User.js";
import { checkEligibilityAI } from "../services/aiService.js";

/* ======================================================
   CREATE / UPDATE DONOR PROFILE
   POST /api/donor/profile
====================================================== */
export const upsertProfile = async (req, res) => {
  try {
    const { bloodGroup, age, medicalHistory, location, state, district } = req.body;

    // fetch existing profile
    const existingProfile = await DonorProfile.findOne({ user: req.user._id });

    // donation count (lock condition)
    const donationCount = await Donation.countDocuments({
      donor: req.user._id,
    });

    const isBloodGroupLocked = donationCount > 0;

    // 🔥 VALIDATION FOR LOCATION (always required)
    if (
      !location ||
      !location.address ||
      location.lat === undefined ||
      location.lng === undefined
    ) {
      return res.status(400).json({
        message: "Complete location (address, lat, lng) is required",
      });
    }

    // 🔥 Validate Age
    if (age === undefined || age < 18 || age > 65) {
      return res.status(400).json({
        message: "Donor must be between 18 and 65 years old",
      });
    }

    // 🔥 If profile does not exist, bloodGroup must be provided
    if (!existingProfile && !bloodGroup) {
      return res.status(400).json({
        message: "Blood group is required for first time profile creation",
      });
    }

    // 🔥 If bloodgroup locked, do not allow changing it
    if (
      isBloodGroupLocked &&
      bloodGroup &&
      existingProfile?.bloodGroup !== bloodGroup
    ) {
      return res.status(403).json({
        message: "Blood group cannot be changed after first donation",
      });
    }

    // if donor already has bloodGroup, keep it
    const finalBloodGroup = existingProfile?.bloodGroup || bloodGroup;

    const profile = await DonorProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        bloodGroup: finalBloodGroup,
        age,
        state,
        district,
        medicalHistory: medicalHistory || [],
        location: {
          address: location.address,
          lat: location.lat,
          lng: location.lng,
        },
        isAvailable: existingProfile?.isAvailable ?? true,
      },
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({
      message: "Failed to save donor profile",
    });
  }
};


/* ======================================================
   GET DONOR DASHBOARD
   GET /api/donor/dashboard
====================================================== */
export const getDashboard = async (req, res) => {
  try {
    const profile = await DonorProfile.findOne({
      user: req.user._id,
    });

    const donations = await Donation.find({
      donor: req.user._id,
    }).sort({ donationDate: -1 });

    res.json({
      totalDonations: donations.length,
      lastDonationDate: profile?.lastDonationDate || null,
      isAvailable: profile?.isAvailable ?? false,
      bloodGroup: profile?.bloodGroup || null,
      state: profile?.state || null,
      district: profile?.district || null,
      age: profile?.age || null,
      medicalHistory: profile?.medicalHistory || [],
      location: profile?.location || null,
      donations,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
};



/* ======================================================
   DONATE BLOOD
   POST /api/donor/donate
====================================================== */
// export const donateBlood = async (req, res) => {
//   try {
//     const { units, location } = req.body;

//     if (!units || units <= 0) {
//       return res.status(400).json({ message: "Invalid units" });
//     }

//     const donorProfile = await DonorProfile.findOne({
//       user: req.user._id,
//     });

//     if (!donorProfile) {
//       return res
//         .status(400)
//         .json({ message: "Please complete donor profile first" });
//     }

//     if (!donorProfile.isAvailable) {
//       return res
//         .status(400)
//         .json({ message: "Donor is currently unavailable" });
//     }

//     // ✅ CREATE PENDING DONATION


//     const donation = await Donation.create({
//   donor: req.user._id,
//   bloodGroup: donorProfile.bloodGroup,
//   units,
//   status: "pending",
//   donationDate: new Date(),
//   location: {
//     address:
//       typeof location === "string"
//         ? location
//         : location?.address || donorProfile.location.address,
//     lat: donorProfile.location.lat,
//     lng: donorProfile.location.lng,
//   },
// });


//     donorProfile.lastDonationDate = new Date();
//     donorProfile.isAvailable = false;
//     await donorProfile.save();

//     res.status(201).json({
//       message: "Donation submitted for admin approval",
//       donation,
//     });
//   } catch (error) {
//     console.error("Donation Error:", error);
//     res.status(500).json({ message: "Donation failed" });
//   }
// };


export const donateBlood = async (req, res) => {
  try {
    const { 
      units, 
      donationType, 
      state,
      district, 
      hospitalId,
      hb,
      bp,
      age,
      weight,
      height
    } = req.body;

    // ✅ Validate donation parameters
    if (!units || units <= 0) {
      return res.status(400).json({ message: "Invalid units" });
    }
    if (!donationType || !["camp", "hospital"].includes(donationType)) {
      return res.status(400).json({ message: "Invalid donation type" });
    }
    if (!state || !district || !hospitalId) {
      return res.status(400).json({ message: "State, district, and hospital are required" });
    }

    // ✅ AI Eligibility Check (Final Guard)
    const aiResult = await checkEligibilityAI({ hb, bp, age, weight, height });
    if (aiResult.status !== "Eligible") {
      return res.status(400).json({ 
        message: aiResult.reason || "You do not meet the AI-determined eligibility criteria for donation.",
        eligible: false,
        explanation: aiResult.explanation
      });
    }

    // ✅ Find donor profile
    const donorProfile = await DonorProfile.findOne({ user: req.user._id });

    if (!donorProfile) {
      return res.status(400).json({ message: "Please complete donor profile first" });
    }

    // ✅ Check availability (last donation gap)
    if (!donorProfile.isAvailable) {
      return res.status(400).json({ message: "Donor is currently unavailable for donation" });
    }

    // ✅ Create donation application
    const donation = await Donation.create({
      donor: req.user._id,
      bloodGroup: donorProfile.bloodGroup,
      units,
      donationType,
      state,
      district,
      hospitalId,
      eligibility: { hb, bp, age, weight, height },
      status: "pending",
      donationDate: new Date()
    });

    // ✅ Update donor status
    donorProfile.lastDonationDate = new Date();
    donorProfile.isAvailable = false;
    await donorProfile.save();

    return res.status(201).json({
      message: "Donation application submitted successfully. Please wait for hospital approval.",
      donation,
    });
  } catch (error) {
    console.error("Donation Error:", error);
    return res.status(500).json({
      message: "Donation application failed",
      error: error.message,
    });
  }
};

/**
 * GET Donation Certificate Data
 * GET /api/donor/certificate/:donationId
 */
export const getCertificate = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId).populate("donor");

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.donor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access to certificate" });
    }

    if (donation.status !== "approved") {
      return res.status(400).json({ message: "Certificate only available for approved donations" });
    }

    res.json({
      certificateId: donation._id,
      donorName: donation.donor.name,
      bloodGroup: donation.bloodGroup,
      units: donation.units,
      date: donation.donationDate,
      message: "This is a digital certificate of appreciation for your life-saving blood donation.",
    });
  } catch (error) {
    console.error("Certificate Error:", error);
    res.status(500).json({ message: "Failed to generate certificate data" });
  }
};
