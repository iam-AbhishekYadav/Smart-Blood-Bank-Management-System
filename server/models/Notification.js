import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest", default: null, index: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["alert", "emergency", "info", "reminder"], default: "info" },
    readStatus: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
