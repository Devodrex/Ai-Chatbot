import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("Connecting to Mongo...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected 🚀");
  } catch (err) {
    console.error("DB error:", err.message);
    process.exit(1);
  }
};