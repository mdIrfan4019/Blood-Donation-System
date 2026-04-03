import mongoose from "mongoose";

const hospitalProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
    },
    emergencyContact: {
      type: String,
    },
    hospitalType: {
      type: String,
      enum: ["Public", "Private", "Charity"],
      default: "Public",
    },
    licenseNumber: {
      type: String,
      required: true,
    },
    totalBeds: {
      type: Number,
      default: 0,
    },
    icuBeds: {
      type: Number,
      default: 0,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("HospitalProfile", hospitalProfileSchema);
