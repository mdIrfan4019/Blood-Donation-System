import Donation from "../models/Donation.js";
import Inventory from "../models/Inventory.js";
import BloodTest from "../models/BloodTest.js";
import User from "../models/User.js";
import { notify } from "../services/notificationService.js";

/**
 * GET pending donations
 */
export const getPendingDonations = async (req, res) => {
  const donations = await Donation.find({ status: "pending" })
    .populate("donor", "email name");

  res.json(donations);
};

/**
 * APPROVE donation → SAVE TO INVENTORY
 */
export const approveDonation = async (req, res) => {
  const donation = await Donation.findById(req.params.id);

  if (!donation) {
    return res.status(404).json({ message: "Donation not found" });
  }

  if (donation.status === "approved") {
    return res.status(400).json({ message: "Already approved" });
  }

  // ✅ 0. Check for safe blood test
  const bloodTest = await BloodTest.findOne({ donation: donation._id });
  if (!bloodTest || bloodTest.status !== "safe") {
    return res.status(400).json({
      message: "Donation cannot be approved without a 'safe' blood test result",
    });
  }

  // ✅ 1. Mark donation approved
  donation.status = "approved";
  await donation.save();

  // ✅ 2. Update inventory
  const inventory = await Inventory.findOneAndUpdate(
    { 
      hospitalId: donation.hospitalId,
      bloodGroup: donation.bloodGroup, 
      component: donation.component || "Whole Blood" 
    },
    {
      $inc: { unitsAvailable: donation.units },
      $setOnInsert: {
        expiryDate: new Date(
          Date.now() + 42 * 24 * 60 * 60 * 1000 // 42 days
        ),
      },
    },
    { new: true, upsert: true }
  );
    // console.log("Inventory updated:", inventory); // 🔥 DEBUG


  // ✅ 3. Notify Donor
  await notify({
    recipient: donation.donor,
    title: "Donation Approved",
    message: `Your ${donation.bloodGroup} ${donation.component} donation has been approved and added to our inventory. Thank you for your contribution!`,
    type: "system",
  });

  res.json({
    message: "Donation approved & added to inventory",
    donation,
    inventory,
  });
};

/**
 * RECORD blood test results
 */
export const recordBloodTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { results } = req.body;

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.status !== "pending") {
      return res.status(400).json({ message: "Only pending donations can be tested" });
    }

    // Basic logic: all must be negative to be safe
    // Exclude 'remarks' from safety check
    const checkResults = { ...results };
    delete checkResults.remarks;
    const isSafe = Object.values(checkResults).every((res) => res === "negative");
    const status = isSafe ? "safe" : "unsafe";

    const bloodTest = await BloodTest.findOneAndUpdate(
      { donation: id },
      {
        donation: id,
        results: checkResults,
        remarks: results.remarks,
        status,
        testedBy: req.user._id,
        testedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    // ✅ Update donation with test result linkage
    donation.testResult = bloodTest._id;
    if (!isSafe) {
      // Discard donation logic
      donation.status = "discarded";

      // Notify donor privately (sensitive info)
      await notify({
        recipient: donation.donor,
        title: "Medical Alert: Donation Results",
        message: "Your recent donation tests showed some issues. Please visit a consultant for further details.",
        type: "emergency",
      });
    }
    await donation.save();

    res.json({
      message: `Blood test recorded as ${status}`,
      bloodTest,
      donationStatus: donation.status,
    });
  } catch (error) {
    console.error("Record Blood Test Error:", error);
    res.status(500).json({ message: "Failed to record blood test" });
  }
};


export const rejectDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.status !== "pending") {
      return res.status(400).json({
        message: `Donation already ${donation.status}`,
      });
    }

    donation.status = "rejected";
    await donation.save();

    res.json({
      message: "Donation rejected successfully",
      donation,
    });
  } catch (error) {
    console.error("Reject Donation Error:", error);
    res.status(500).json({ message: "Failed to reject donation" });
  }
};

export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("donor", "name email phone")
      .populate("testResult")
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    console.error("Get All Donations Error:", error);
    res.status(500).json({ message: "Failed to fetch donations" });
  }
};
