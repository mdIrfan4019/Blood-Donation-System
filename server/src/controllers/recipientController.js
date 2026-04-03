import BloodRequest from "../models/BloodRequest.js";

export const createRequest = async (req, res) => {
  try {
    const request = await BloodRequest.create({
      ...req.body,
      requester: req.user._id,
    });

    res.status(201).json(request);
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ message: "Failed to create blood request" });
  }
};

export const myRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({
      requester: req.user._id,
    }).populate("matchedDonor", "name email");

    res.json(requests);
  } catch (error) {
    console.error("My requests error:", error);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};
