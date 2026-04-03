import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Patient from "./models/Patient.js";
dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/test");
    console.log("Connected to MongoDB");

    const users = await User.find({ role: { $in: ["doctor", "receptionist", "hospital"] } });
    console.log(`\nFound ${users.length} Users (Hospitals & Staff)`);
    users.forEach(u => {
      console.log(`- ID: ${u._id}, Name: ${u.name}, Role: ${u.role}, HospitalId: ${u.hospitalId || 'N/A'}`);
    });

    const patients = await Patient.find({});
    console.log(`\nFound ${patients.length} Patients`);
    patients.forEach(p => {
      console.log(`- ID: ${p._id}, Name: ${p.name}, HospitalId: ${p.hospitalId}, RegisteredBy: ${p.registeredBy || 'N/A'}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Data Check Error:", err);
    process.exit(1);
  }
};

checkData();
