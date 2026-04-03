import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["Donor", "Recipient Family", "Medical Administrator", "Hospital Staff", "Verified User", "Other"],
      default: "Verified User",
    },
    text: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approve for MVP
    },
  },
  { timestamps: true }
);

export default mongoose.model("Story", storySchema);
