import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["donor", "recipient", "admin"],
      required: true,
      default: "recipient",
    },
    address: { type: String, trim: true },
    department: { type: String, trim: true },
    accessLevel: { type: String, trim: true },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    age: { type: Number, min: 18, max: 65 },
    healthConditions: { type: String, default: "" },
    hospitalName: { type: String, trim: true },
    requiredBloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    urgencyLevel: { type: String, enum: ["Low", "Medium", "High", "Critical"] },
    profilePhoto: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
