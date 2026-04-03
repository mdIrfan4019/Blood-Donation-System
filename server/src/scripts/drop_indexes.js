import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const dropIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/test");
    console.log("Connected to MongoDB");

    const collections = await mongoose.connection.db.listCollections().toArray();
    const inventoryExists = collections.some(c => c.name === "inventories");

    if (inventoryExists) {
      console.log("Dropping all indexes on 'inventories' collection...");
      await mongoose.connection.db.collection("inventories").dropIndexes();
      console.log("Successfully dropped all indexes on 'inventories'. Mongoose will recreate them.");
    } else {
      console.log("'inventories' collection not found.");
    }

    await mongoose.disconnect();
    console.log("Disconnected.");
    process.exit(0);
  } catch (err) {
    console.error("Error dropping indexes:", err);
    process.exit(1);
  }
};

dropIndexes();
