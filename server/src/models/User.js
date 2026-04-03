import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { 
      type: String, 
      unique: true, 
      sparse: true,
      default: undefined // Ensure it's not "" by default
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "donor", "hospital", "doctor", "nurse", "tester", "receptionist"],
      default: "donor",
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Points to the hospital user this staff belongs to
    },
    isBlocked: {
  type: Boolean,
  default: false,
},

  },
  { timestamps: true }
);

// --------------------
// HASH PASSWORD (NO next())
// --------------------
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// --------------------
// MATCH PASSWORD
// --------------------
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);

