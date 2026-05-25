import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import {
  cancelBloodRequest,
  createBloodRequest,
  findNearbyDonors,
  getRecipientProfile,
  listRecipientNotifications,
  listRecipientRequests,
  markBloodRequestFulfilled,
  uploadRecipientPhoto,
  updateRecipientProfile,
} from "../controllers/recipientController.js";

const router = Router();

router.use(requireAuth, requireRole("recipient"));

router.get("/profile", getRecipientProfile);
router.put("/profile", updateRecipientProfile);
router.post("/profile/photo", upload.single("photo"), uploadRecipientPhoto);
router.post("/request", createBloodRequest);
router.get("/requests", listRecipientRequests);
router.put("/request/:id/cancel", cancelBloodRequest);
router.put("/request/:id/fulfilled", markBloodRequestFulfilled);
router.get("/donors/nearby", findNearbyDonors);
router.get("/notifications", listRecipientNotifications);

export default router;
