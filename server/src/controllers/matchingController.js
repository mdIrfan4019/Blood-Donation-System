import BloodRequest from "../models/BloodRequest.js";
import DonorProfile from "../models/DonorProfile.js";
import Donation from "../models/Donation.js";
import { notify } from "../services/notificationService.js";
import { distanceKm } from "../services/geoService.js";

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

const DAYS_90 = 90 * 24 * 60 * 60 * 1000;

export const matchDonor = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request || request.status !== "pending") {
      return res.status(400).json({ message: "Invalid request" });
    }

    const donors = await DonorProfile.find({
      bloodGroup: { $in: compatibility[request.bloodGroup] },
      isAvailable: true,
      $or: [
        { lastDonationDate: { $exists: false } },
        { lastDonationDate: { $lte: new Date(Date.now() - DAYS_90) } },
      ],
    }).populate("user");

    if (!donors.length) {
      return res.status(404).json({ message: "No donors available" });
    }

    let best = null;
    let minDist = Infinity;

    for (const d of donors) {
      if (!d.location?.lat || !request.location?.lat) continue;

      const dist = distanceKm(
        request.location.lat,
        request.location.lng,
        d.location.lat,
        d.location.lng
      );

      if (dist < minDist) {
        minDist = dist;
        best = d;
      }
    }

    if (!best) {
      // ✅ SHORTAGE ALERT: Notify nearby donors of emergency
      await notify({
        recipient: { email: null }, // system broad (not implemented for broad yet, but log it)
        title: "BLOOD SHORTAGE ALERT",
        message: `Urgent need for ${request.bloodGroup} blood. No matching donors found in immediate area.`,
        type: "emergency",
      });
      return res.status(404).json({ message: "No donor with valid location" });
    }

    // 🔥 CREATE DONATION (THIS WAS MISSING)
    const donation = await Donation.create({
      donor: best.user._id,
      bloodGroup: best.bloodGroup,
      units: request.units || 1,
      donationDate: new Date(),
      location: request.location,
    });

    // 🔒 LOCK BOTH
    request.status = "matched";
    request.matchedDonor = best.user._id;
    await request.save();

    best.isAvailable = false;
    best.lastDonationDate = new Date();
    await best.save();

    // ✅ NOTIFY DONOR OF MATCH
    await notify({
      recipient: best.user,
      title: "URGENT: Blood Match Found",
      message: `You have been matched for an urgent blood request. A donation has been scheduled for you.`,
      type: "emergency",
    });

    res.json({
      message: "Donor matched and donation recorded",
      donor: {
        name: best.user.name,
        email: best.user.email,
      },
      donationId: donation._id,
      distanceKm: Number(minDist.toFixed(2)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Matching failed" });
  }
};
