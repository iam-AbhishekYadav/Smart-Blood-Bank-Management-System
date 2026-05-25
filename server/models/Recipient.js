import mongoose from "mongoose";

const recipientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    hospitalName: { type: String, required: true, trim: true },
    requiredBloodGroup: { type: String, required: true },
    urgencyLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      required: true,
    },
    contactNumber: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Recipient = mongoose.model("Recipient", recipientSchema);
