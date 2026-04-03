import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      required: true,
    },
    component: {
      type: String,
      enum: ["Whole Blood", "Plasma", "Platelets", "RBC", "Cryoprecipitate"],
      default: "Whole Blood",
    },
    unitsAvailable: {
      type: Number,
      default: 0,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    temperature: {
      type: String, // String to support ranges like "2-6°C"
    },
    expiryDate: Date,
  },
  { timestamps: true }
);

inventorySchema.index({ bloodGroup: 1, component: 1, hospitalId: 1 }, { unique: true });

export default mongoose.models.Inventory ||
  mongoose.model("Inventory", inventorySchema);
