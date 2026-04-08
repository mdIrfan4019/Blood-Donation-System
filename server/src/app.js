// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import connectDB from "./config/db.js";

// import authRoutes from "./routes/authRoutes.js";
// import donorRoutes from "./routes/donorRoutes.js";
// import recipientRoutes from "./routes/recipientRoutes.js";
// import hospitalRoutes from "./routes/hospitalRoutes.js";
// import bloodBankRoutes from "./routes/bloodBankRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import eligibilityRoutes from "./routes/eligibilityRoutes.js";
// import adminDonationRoutes from "./routes/adminDonationRoutes.js";
// import matchingRoutes from "./routes/matchingRoutes.js";
// import notificationRoutes from "./routes/notificationRoutes.js";
// import storyRoutes from "./routes/storyRoutes.js";
// import publicRoutes from "./routes/publicRoutes.js";

// dotenv.config();
// connectDB();

// const app = express();
// app.use(
//   cors({
//       origin: [
//     "http://localhost:5173",
//     "http://localhost:5174",
//     process.env.FRONTEND_URL, // Injects your actual live vercel domain
//   ].filter(Boolean),

//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
// // app.options("*", cors());

// app.use(express.json());

// app.use("/api/auth", authRoutes);
// app.use("/api/donor", donorRoutes);
// app.use("/api/recipient", recipientRoutes);
// app.use("/api/hospital", hospitalRoutes);
// app.use("/api/bloodbank", bloodBankRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/eligibility", eligibilityRoutes);
// app.use("/api/admin/donations", adminDonationRoutes);
// app.use("/api/matching", matchingRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/stories", storyRoutes);
// app.use("/api/public", publicRoutes);


// app.get("/", (req, res) => res.send("API is running"));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () =>
//   console.log(`🚀 Production Server heavily mounted locally/live on port ${PORT}`)
// );


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import recipientRoutes from "./routes/recipientRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import bloodBankRoutes from "./routes/bloodBankRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import eligibilityRoutes from "./routes/eligibilityRoutes.js";
import adminDonationRoutes from "./routes/adminDonationRoutes.js";
import matchingRoutes from "./routes/matchingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";

dotenv.config();
connectDB();

const app = express();


// ✅ GLOBAL CORS FIX (EXPLICIT FOR VERCEL + LOCAL)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://blood-donation-system-vert.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ HANDLE PREFLIGHT REQUESTS EXPLICITLY
app.options("(.*)", cors());


// ✅ BODY PARSER
app.use(express.json());


// ✅ DEBUG (optional - can remove later)
app.use((req, res, next) => {
  console.log("Request:", req.method, req.url);
  next();
});


// ✅ ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/donor", donorRoutes);
app.use("/api/recipient", recipientRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/bloodbank", bloodBankRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/eligibility", eligibilityRoutes);
app.use("/api/admin/donations", adminDonationRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/public", publicRoutes);


// ✅ HEALTH CHECK
app.get("/", (req, res) => {
  res.send("🚀 API is running successfully");
});


// ✅ GLOBAL ERROR HANDLER (prevents CORS missing on errors)
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: err.message });
});


// ✅ SERVER START
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});