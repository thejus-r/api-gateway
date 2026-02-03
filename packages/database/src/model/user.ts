import mongoose, { type Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  apiKey: string;
  tier: "basic" | "premium";
  createdAt: Date;
}

const UserSchema = new Schema({
  username: { type: String, required: true },
  apiKey: { type: String, required: true, unique: true, index: true },
  tier: {
    type: String,
    enum: ["basic", "premium"],
  },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>("User", UserSchema);
