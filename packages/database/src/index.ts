import mongoose from "mongoose";
import { type IUser, User } from "./model/user.js";

const connectDB = async (uri: string) => {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  }
};

export { connectDB, User, type IUser };
