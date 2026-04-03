import jwt from "jsonwebtoken";
import User from "../models/User.js";

// --------------------
// AUTH CHECK
// --------------------
export const protect = async (req, res, next) => {
  if (!req.headers.authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, invalid header" });
  }

  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (req.user.isBlocked) {
  return res.status(403).json({ message: "Your account is blocked by admin" });
}

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid" });
  }
};

// --------------------
// ROLE CHECK
// --------------------
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};
