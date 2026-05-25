import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { Donor } from "../models/Donor.js";
import { PasswordResetOtp } from "../models/PasswordResetOtp.js";
import { RefreshToken } from "../models/RefreshToken.js";
import { Recipient } from "../models/Recipient.js";
import { User } from "../models/User.js";
import { sendOtpEmail } from "../utils/emailService.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { hashToken } from "../utils/refreshToken.js";

const SALT_ROUNDS = 12;

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  bloodGroup: user.bloodGroup,
  phone: user.phone,
  profilePhoto: user.profilePhoto,
});

const buildTokens = (user) => {
  const payload = { sub: user._id.toString(), role: user.role, email: user.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

const persistRefreshToken = async (userId, refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  await RefreshToken.create({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(decoded.exp * 1000),
  });
};

export const register = async (req, res) => {
  const {
    role,
    fullName,
    username,
    email,
    phone,
    password,
    bloodGroup,
    age,
    address,
    healthConditions,
    hospitalName,
    requiredBloodGroup,
    urgencyLevel,
    department,
    accessLevel,
  } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ message: "Email already exists." });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    name: fullName,
    username,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    role,
    address,
    bloodGroup,
    age,
    healthConditions,
    hospitalName,
    requiredBloodGroup,
    urgencyLevel,
    department,
    accessLevel,
  });

  if (role === "donor") {
    await Donor.create({
      userId: user._id,
      bloodGroup,
      age,
      healthConditions: healthConditions ?? "",
      eligibilityStatus: "eligible",
      isAvailable: true,
    });
  }

  if (role === "recipient") {
    await Recipient.create({
      userId: user._id,
      hospitalName,
      requiredBloodGroup,
      urgencyLevel,
      contactNumber: phone,
    });
  }

  const tokens = buildTokens(user);
  await persistRefreshToken(user._id, tokens.refreshToken);
  return res.status(201).json({ user: sanitizeUser(user), ...tokens });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: "Invalid email or password." });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid email or password." });

  const tokens = buildTokens(user);
  await persistRefreshToken(user._id, tokens.refreshToken);
  return res.json({ user: sanitizeUser(user), ...tokens });
};

export const me = async (req, res) => {
  const user = await User.findById(req.user.sub).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found." });
  return res.json({ user });
};

export const logout = async (req, res) => {
  const refreshToken = req.body?.refreshToken;
  if (refreshToken) {
    await RefreshToken.updateOne(
      { tokenHash: hashToken(refreshToken), revokedAt: null },
      { revokedAt: new Date() }
    );
  }
  return res.json({ message: "Logged out successfully." });
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "Refresh token is required." });

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    const session = await RefreshToken.findOne({
      tokenHash,
      userId: decoded.sub,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({ message: "Invalid refresh session." });
    }

    await RefreshToken.updateOne({ _id: session._id }, { revokedAt: new Date() });

    const user = await User.findById(decoded.sub);
    if (!user || !user.isActive) return res.status(401).json({ message: "Unauthorized." });

    const nextTokens = buildTokens(user);
    await persistRefreshToken(user._id, nextTokens.refreshToken);

    return res.json({ user: sanitizeUser(user), ...nextTokens });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token." });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.json({ message: "If account exists, OTP has been sent." });

  const otp = String(randomInt(100000, 1000000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await PasswordResetOtp.deleteMany({ email: normalizedEmail });
  await PasswordResetOtp.create({ email: normalizedEmail, otp, expiresAt });
  await sendOtpEmail(normalizedEmail, otp);

  return res.json({ message: "If account exists, OTP has been sent." });
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const normalizedEmail = email.toLowerCase();

  const record = await PasswordResetOtp.findOne({ email: normalizedEmail, otp });
  if (!record || record.expiresAt.getTime() < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await User.updateOne({ email: normalizedEmail }, { passwordHash: hash });
  await PasswordResetOtp.deleteMany({ email: normalizedEmail });
  return res.json({ message: "Password reset successful." });
};
