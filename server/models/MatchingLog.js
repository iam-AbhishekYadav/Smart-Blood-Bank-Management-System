import mongoose from "mongoose";

const matchingLogSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest", required: true, index: true },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true, index: true },
    distanceKm: { type: Number, default: 0 },
    responseStatus: {
      type: String,
      enum: ["accepted", "declined", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const MatchingLog = mongoose.model("MatchingLog", matchingLogSchema);
