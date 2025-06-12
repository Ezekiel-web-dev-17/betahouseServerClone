import mongoose from "mongoose";
import { DB_URI } from "../config/env.js";

if (!DB_URI) {
  console.log(`!!!!!PROVIDE DB_URI.!!!!!!`);
}

export const connectDb = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(DB_URI);

    console.log(`Connected to MONGODB😊😊`);
  } catch (error) {
    console.log("Error connecting...", error);
    process.exit(1);
  }
};
