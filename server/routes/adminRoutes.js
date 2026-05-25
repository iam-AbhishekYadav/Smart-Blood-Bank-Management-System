import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import {
  addInventory,
  approveUser,
  broadcastEmergency,
  deleteUser,
  generateReports,
  getDashboardStats,
  getDonations,
  getInventory,
  getLogs,
  getRequestDetails,
  getRequests,
  getUsers,
  suspendUser,
  updateInventory,
} from "../controllers/adminController.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/dashboard/stats", getDashboardStats);
router.get("/users", getUsers);
router.put("/users/:id/approve", approveUser);
router.put("/users/:id/suspend", suspendUser);
router.delete("/users/:id", deleteUser);
router.get("/inventory", getInventory);
router.post("/inventory/add", addInventory);
router.put("/inventory/:id", updateInventory);
router.get("/requests", getRequests);
router.get("/requests/:id", getRequestDetails);
router.get("/donations", getDonations);
router.post("/emergency/broadcast", broadcastEmergency);
router.get("/reports/generate", generateReports);
router.get("/logs", getLogs);

export default router;
