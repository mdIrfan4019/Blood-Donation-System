import Inventory from "../models/Inventory.js";

export const viewInventory = async (req, res) => {
  const items = await Inventory.find();
  res.json(items);
};
