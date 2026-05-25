import mongoose from "mongoose";

const bloodInventorySchema = new mongoose.Schema(
  {
    bloodGroup: { type: String, required: true, index: true },
    unitsAvailable: { type: Number, required: true, min: 0 },
    unitsReserved: { type: Number, default: 0, min: 0 },
    expiryDate: { type: Date, required: true, index: true },
    sourceDonorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", default: null },
    addedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: String, required: true },
  },
  { timestamps: true }
);

export const BloodInventory = mongoose.model("BloodInventory", bloodInventorySchema);
