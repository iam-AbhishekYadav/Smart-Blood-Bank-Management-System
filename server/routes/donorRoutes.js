import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import {
  acceptMatchedRequest,
  rejectMatchedRequest,
  getDonorEligibility,
  getDonorHistory,
  getDonorNotifications,
  getDonorProfile,
  deleteDonorNotification,
  getMatchedRequestDetails,
  markDonorNotificationRead,
  uploadDonorPhoto,
  updateDonorAvailability,
  updateDonorLocation,
  updateDonorProfile,
} from "../controllers/donorController.js";

const router = Router();

router.use(requireAuth, requireRole("donor"));

router.get("/profile", getDonorProfile);
router.put("/profile", updateDonorProfile);
router.put("/location", updateDonorLocation);
router.put("/availability", updateDonorAvailability);
router.get("/history", getDonorHistory);
router.get("/eligibility", getDonorEligibility);
router.get("/notifications", getDonorNotifications);
router.put("/notifications/:id/read", markDonorNotificationRead);
router.put("/requests/:id/accept", acceptMatchedRequest);
router.put("/requests/:id/reject", rejectMatchedRequest);
router.get("/requests/:id", getMatchedRequestDetails);
router.delete("/notifications/:id", deleteDonorNotification);
router.post("/profile/photo", upload.single("photo"), uploadDonorPhoto);

export default router;
