import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Define Schemas inline to avoid import issues in stand-alone script
const userSchema = new mongoose.Schema({
  name: String,
  role: String,
  hospitalId: mongoose.Schema.Types.ObjectId
});
const patientSchema = new mongoose.Schema({
  name: String,
  hospitalId: mongoose.Schema.Types.ObjectId,
  bloodGroup: String
});

const User = mongoose.model("User", userSchema);
const Patient = mongoose.model("Patient", patientSchema);

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/test");
    console.log("Connected to MongoDB");

    const users = await User.find({ role: { $in: ["doctor", "receptionist", "hospital"] } });
    console.log(`\n--- Users (Found: ${users.length}) ---`);
    users.forEach(u => {
      console.log(`ID: ${u._id}, Name: ${u.name}, Role: ${u.role}, HospitalId: ${u.hospitalId || 'OWNER'}`);
    });

    const patients = await Patient.find({});
    console.log(`\n--- Patients (Found: ${patients.length}) ---`);
    patients.forEach(p => {
      console.log(`ID: ${p._id}, Name: ${p.name}, HospitalId: ${p.hospitalId}, BloodGroup: ${p.bloodGroup}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Data Check Error:", err);
    process.exit(1);
  }
};

checkData();
