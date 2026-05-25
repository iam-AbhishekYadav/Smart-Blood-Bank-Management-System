import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true, index: true },
    bloodGroup: { type: String, required: true },
    unitsDonated: { type: Number, required: true, min: 1 },
    donationDate: { type: Date, required: true, index: true },
    hospitalName: { type: String, required: true },
    verifiedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export const Donation = mongoose.model("Donation", donationSchema);
