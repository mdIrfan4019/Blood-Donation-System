import Inventory from "../models/Inventory.js";

/* ============================
   GET INVENTORY
============================ */
export const viewInventory = async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch inventory",
    });
  }
};

/* ============================
   ADD UNITS TO INVENTORY
   (USED BY ADMIN ONLY)
============================ */
export const addToInventory = async ({ bloodGroup, units }) => {
  await Inventory.findOneAndUpdate(
    { bloodGroup },
    { $inc: { unitsAvailable: units } },
    { upsert: true, new: true }
  );
};
