import mongoose from "mongoose";

const donorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bloodGroup: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
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

    medicalHistory: {
      type: [String],
      default: [],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    lastDonationDate: Date,

    // ✅ LOCATION (BEST PRACTICE)
    location: {
      address: {
        type: String,
        required: true, // shown to user
      },
      lat: {
        type: Number, // used internally
        required: true,
      },
      lng: {
        type: Number, // used internally
        required: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("DonorProfile", donorProfileSchema);
