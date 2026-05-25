import { Donor } from "../models/Donor.js";
import { Donation } from "../models/Donation.js";
import { Notification } from "../models/Notification.js";
import { BloodRequest } from "../models/BloodRequest.js";
import { MatchingLog } from "../models/MatchingLog.js";
import { Recipient } from "../models/Recipient.js";
import { User } from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import { emitToUser, getIO } from "../socket/socket.js";

const daysUntilEligible = (lastDonationDate) => {
  if (!lastDonationDate) return 0;
  const nextDate = new Date(lastDonationDate);
  nextDate.setDate(nextDate.getDate() + 90);
  const diff = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

export const getDonorProfile = async (req, res) => {
  const user = await User.findById(req.user.sub).select("-passwordHash").lean();
  const donor = await Donor.findOne({ userId: req.user.sub }).lean();
  return res.json({ user, donor });
};

export const updateDonorProfile = async (req, res) => {
  const { name, phone, address, healthConditions, bloodGroup, age } = req.body;
  await User.updateOne({ _id: req.user.sub }, { name, phone, address, bloodGroup, age });
  await Donor.updateOne({ userId: req.user.sub }, { healthConditions, bloodGroup, age });
  return res.json({ message: "Donor profile updated." });
};

export const updateDonorLocation = async (req, res) => {
  const { lat, lng } = req.body;
  await Donor.updateOne({ userId: req.user.sub }, { locationLat: lat, locationLng: lng });
  return res.json({ message: "Donor location updated." });
};

export const updateDonorAvailability = async (req, res) => {
  const { isAvailable } = req.body;
  await Donor.updateOne({ userId: req.user.sub }, { isAvailable: Boolean(isAvailable) });
  return res.json({ message: "Donor availability updated." });
};

export const getDonorHistory = async (req, res) => {
  const donor = await Donor.findOne({ userId: req.user.sub });
  if (!donor) return res.status(404).json({ message: "Donor profile not found." });

  const items = await Donation.find({ donorId: donor._id }).sort({ donationDate: -1 }).lean();
  return res.json({ items });
};

export const getDonorEligibility = async (req, res) => {
  const donor = await Donor.findOne({ userId: req.user.sub }).lean();
  if (!donor) return res.status(404).json({ message: "Donor profile not found." });

  const daysLeft = daysUntilEligible(donor.lastDonationDate);
  const status = daysLeft === 0 ? "eligible" : "not_eligible";

  return res.json({
    status,
    daysLeft,
    badge: status === "eligible" ? "Eligible" : `Eligible in ${daysLeft} days`,
  });
};

export const getDonorNotifications = async (req, res) => {
  const items = await Notification.find({ userId: req.user.sub }).sort({ createdAt: -1 }).lean();
  const unreadCount = items.filter((n) => !n.readStatus).length;
  return res.json({ items, unreadCount });
};

export const markDonorNotificationRead = async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, userId: req.user.sub }, { readStatus: true });
  return res.json({ message: "Notification marked read." });
};

export const acceptMatchedRequest = async (req, res) => {
  const donor = await Donor.findOne({ userId: req.user.sub });
  if (!donor) return res.status(404).json({ message: "Donor profile not found." });

  const request = await BloodRequest.findOne({
    _id: req.params.id,
    matchedDonorId: donor._id,
    status: "matched",
  });
  if (!request) return res.status(404).json({ message: "Matched request not found (or no longer available)." });

  await MatchingLog.updateOne(
    { requestId: request._id, donorId: donor._id },
    { responseStatus: "accepted" }
  );
  await MatchingLog.updateMany(
    { requestId: request._id, donorId: { $ne: donor._id }, responseStatus: "pending" },
    { responseStatus: "declined" }
  );

  request.status = "in_progress";
  await request.save();

  const recipient = await Recipient.findById(request.recipientId).lean();
  if (recipient?.userId) {
    const recipientNotification = await Notification.create({
      userId: recipient.userId,
      requestId: request._id,
      message: "A donor has accepted your request and is on the way.",
      type: "alert",
    });
    emitToUser(recipient.userId, "notification:new", recipientNotification);
  }

  const donorNotification = await Notification.create({
    userId: req.user.sub,
    requestId: request._id,
    message: "You accepted the request. Please coordinate with the recipient/hospital.",
    type: "info",
  });
  emitToUser(req.user.sub, "notification:new", donorNotification);

  getIO()?.to(`request:${request._id}`).emit("request:status-changed", { requestId: request._id, status: request.status });

  return res.json({ message: "Request accepted.", requestId: request._id, status: request.status });
};

export const rejectMatchedRequest = async (req, res) => {
  const donor = await Donor.findOne({ userId: req.user.sub });
  if (!donor) return res.status(404).json({ message: "Donor profile not found." });

  const request = await BloodRequest.findOne({
    _id: req.params.id,
    matchedDonorId: donor._id,
    status: "matched",
  });

  if (!request) return res.status(404).json({ message: "Matched request not found (or no longer available)." });

  // Mark this donor's response as declined.
  await MatchingLog.updateOne(
    { requestId: request._id, donorId: donor._id },
    { responseStatus: "declined" }
  );

  // Pick the next best pending donor candidate for this request.
  const nextLog = await MatchingLog.findOne({
    requestId: request._id,
    responseStatus: "pending",
    donorId: { $ne: donor._id },
  }).sort({ distanceKm: 1 }).lean();

  if (nextLog?.donorId) {
    const nextDonor = await Donor.findById(nextLog.donorId).lean();
    if (nextDonor?.userId) {
      request.matchedDonorId = nextDonor._id;
      request.status = "matched";
      await request.save();

      const donorNotification = await Notification.create({
        userId: nextDonor.userId,
        requestId: request._id,
        message: `New blood request matched (${request.bloodGroup}) at ${request.hospitalName}.`,
        type: "alert",
      });

      emitToUser(nextDonor.userId, "notification:new", donorNotification);
    } else {
      // If we can't find a usable donor, revert to pending.
      request.matchedDonorId = null;
      request.status = "pending";
      await request.save();
    }
  } else {
    // No donors left to match; revert to pending.
    request.matchedDonorId = null;
    request.status = "pending";
    await request.save();
  }

  getIO()?.to(`request:${request._id}`).emit("request:status-changed", { requestId: request._id, status: request.status });
  return res.json({ message: "Request rejected.", requestId: request._id, status: request.status });
};

export const deleteDonorNotification = async (req, res) => {
  await Notification.deleteOne({ _id: req.params.id, userId: req.user.sub });
  return res.json({ message: "Notification removed." });
};

export const getMatchedRequestDetails = async (req, res) => {
  const donor = await Donor.findOne({ userId: req.user.sub });
  if (!donor) return res.status(404).json({ message: "Donor profile not found." });

  const request = await BloodRequest.findOne({
    _id: req.params.id,
    matchedDonorId: donor._id,
  })
    .populate({
      path: "recipientId",
      populate: { path: "userId", select: "name phone address hospitalName" },
    })
    .lean();

  if (!request) return res.status(404).json({ message: "Request not found." });

  const recipient = request.recipientId;
  const recipientUser = recipient?.userId;

  return res.json({
    request: {
      _id: request._id,
      bloodGroup: request.bloodGroup,
      unitsRequired: request.unitsRequired,
      urgencyLevel: request.urgencyLevel,
      hospitalName: request.hospitalName,
      hospitalAddress: request.hospitalAddress,
      status: request.status,
    },
    recipient: {
      name: recipientUser?.name ?? "",
      phone: recipientUser?.phone ?? "",
      hospitalName: recipientUser?.hospitalName ?? request.hospitalName ?? "",
      address: recipientUser?.address ?? request.hospitalAddress ?? "",
    },
  });
};

export const uploadDonorPhoto = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image file uploaded." });

  const b64 = req.file.buffer.toString("base64");
  const dataUri = `data:${req.file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "smart-blood-bank/profiles",
    resource_type: "image",
  });

  await User.updateOne({ _id: req.user.sub }, { profilePhoto: result.secure_url });
  return res.json({ profilePhoto: result.secure_url });
};
