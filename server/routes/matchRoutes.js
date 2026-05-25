import { Router } from "express";
import { body } from "express-validator";
import { Donor } from "../models/Donor.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { canDonateTo } from "../utils/bloodCompatibility.js";
import { haversineKm } from "../utils/distance.js";

const router = Router();

router.post(
  "/find-donors",
  [
    body("blood_group").isString(),
    body("lat").isFloat(),
    body("lng").isFloat(),
  ],
  validateRequest,
  async (req, res) => {
    const { blood_group: requestedBloodGroup, lat, lng } = req.body;

    const donors = await Donor.find({
      eligibilityStatus: "eligible",
      isAvailable: true,
      locationLat: { $ne: null },
      locationLng: { $ne: null },
    })
      .populate("userId")
      .lean();

    const ranked = donors
      .filter((d) => canDonateTo(d.bloodGroup, requestedBloodGroup))
      .map((d) => {
        const distanceKm = haversineKm(lat, lng, d.locationLat, d.locationLng);
        const daysSinceLastDonation = d.lastDonationDate
          ? Math.floor((Date.now() - new Date(d.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24))
          : 9999;

        const priorityScore = Number(
          (1000 - distanceKm * 10 + d.donationCount * 2 + daysSinceLastDonation * 0.2).toFixed(2)
        );

        return {
          donorId: d._id,
          userId: d.userId?._id,
          nameMasked: d.userId?.name ? `${d.userId.name[0]}***` : "Anonymous",
          bloodGroup: d.bloodGroup,
          distanceKm: Number(distanceKm.toFixed(2)),
          donationCount: d.donationCount,
          priorityScore,
        };
      })
      .sort((a, b) => {
        if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
        if (a.donationCount !== b.donationCount) return b.donationCount - a.donationCount;
        return b.priorityScore - a.priorityScore;
      })
      .slice(0, 10);

    return res.json({ donors: ranked });
  }
);

export default router;
