// import mongoose from "mongoose";

// const donationSchema = new mongoose.Schema(
//   {
//     donor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     bloodGroup: {
//       type: String,
//       required: true,
//     },

//     units: {
//       type: Number,
//       required: true,
//     },

//     status: {
//       type: String,
//       enum: ["pending", "approved"],
//       default: "pending", // 🔥 THIS WAS MISSING
//     },

//     donationDate: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// /**
//  * 🚨 PREVENT OverwriteModelError
//  */
// export default mongoose.models.Donation ||
//   mongoose.model("Donation", donationSchema);

import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bloodGroup: {
      type: String,
      required: true,
    },
    donationType: {
      type: String,
      enum: ["camp", "hospital"],
      required: true,
    },
    state: { type: String, required: true },
    district: { type: String, required: true },
    
    // Eligibility criteria
    eligibility: {
      hb: Number,
      bp: String,
      age: Number,
      weight: Number,
      height: Number,
    },

    units: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "testing", "safe", "unsafe"],
      default: "pending",
    },

    donationDate: {
      type: Date,
      default: Date.now,
    },

    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    testResult: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodTest",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Donation ||
  mongoose.model("Donation", donationSchema);
