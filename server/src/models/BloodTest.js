import mongoose from "mongoose";

const bloodTestSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      required: true,
      unique: true,
    },
    results: {
      hiv: { type: String, enum: ["negative", "positive"], required: true },
      hepatitisB: { type: String, enum: ["negative", "positive"], required: true },
      hepatitisC: { type: String, enum: ["negative", "positive"], required: true },
      malaria: { type: String, enum: ["negative", "positive"], required: true },
      syphilis: { type: String, enum: ["negative", "positive"], required: true },
      otherSeriousDiseases: { type: String, enum: ["negative", "positive"], default: "negative" },
    },
    remarks: {
      type: String,
    },
    status: {
      type: String,
      enum: ["safe", "unsafe"],
      required: true,
    },
    testedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    testedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("BloodTest", bloodTestSchema);
