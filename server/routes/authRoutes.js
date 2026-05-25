import { Router } from "express";
import { body } from "express-validator";
import {
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  register,
  resetPassword,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router.post(
  "/register",
  [
    body("role").isIn(["donor", "recipient", "admin"]),
    body("fullName").isString().isLength({ min: 2 }),
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").isString().isLength({ min: 8 })],
  validateRequest,
  login
);

router.post("/logout", logout);
router.post("/refresh", [body("refreshToken").isString()], validateRequest, refresh);

router.post("/forgot-password", [body("email").isEmail()], validateRequest, forgotPassword);
router.post(
  "/reset-password",
  [
    body("email").isEmail(),
    body("otp").isString().isLength({ min: 6, max: 6 }),
    body("newPassword").isLength({ min: 8 }),
  ],
  validateRequest,
  resetPassword
);

router.get("/me", requireAuth, me);

router.get("/google", (_req, res) =>
  res.status(501).json({ message: "Google OAuth will be configured in Phase 3." })
);
router.get("/github", (_req, res) =>
  res.status(501).json({ message: "GitHub OAuth will be configured in Phase 3." })
);

export default router;
