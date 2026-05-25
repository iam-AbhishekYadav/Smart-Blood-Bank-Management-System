import mongoose from "mongoose";

const donorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bloodGroup: { type: String, required: true },
    age: { type: Number, required: true },
    healthConditions: { type: String, default: "" },
    lastDonationDate: { type: Date },
    eligibilityStatus: {
      type: String,
      enum: ["eligible", "not_eligible", "pending"],
      default: "pending",
    },
    isAvailable: { type: Boolean, default: false },
    locationLat: { type: Number },
    locationLng: { type: Number },
    donationCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Donor = mongoose.model("Donor", donorSchema);
