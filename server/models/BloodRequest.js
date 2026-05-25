import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipient", required: true, index: true },
    bloodGroup: { type: String, required: true },
    unitsRequired: { type: Number, required: true, min: 1 },
    urgencyLevel: { type: String, enum: ["Low", "Medium", "High", "Critical"], required: true },
    hospitalName: { type: String, required: true },
    hospitalAddress: { type: String, required: true },
    doctorNote: { type: String, default: "" },
    requesterLat: { type: Number },
    requesterLng: { type: Number },
    matchedDonorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", default: null },
    status: {
      type: String,
      enum: ["pending", "matching", "matched", "in_progress", "fulfilled", "cancelled"],
      default: "pending",
      index: true,
    },
    fulfilledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);
