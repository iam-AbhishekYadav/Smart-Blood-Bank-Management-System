import { BloodRequest } from "../models/BloodRequest.js";
import { Donor } from "../models/Donor.js";
import { Donation } from "../models/Donation.js";
import { Notification } from "../models/Notification.js";
import { Recipient } from "../models/Recipient.js";
import { User } from "../models/User.js";
import { MatchingLog } from "../models/MatchingLog.js";
import { haversineKm } from "../utils/distance.js";
import { emitToUser, getIO } from "../socket/socket.js";
import cloudinary from "../config/cloudinary.js";

export const getRecipientProfile = async (req, res) => {
  const user = await User.findById(req.user.sub).select("-passwordHash").lean();
  const recipient = await Recipient.findOne({ userId: req.user.sub }).lean();
  return res.json({ user, recipient });
};

export const updateRecipientProfile = async (req, res) => {
  const {
    name,
    phone,
    address,
    hospitalName,
    requiredBloodGroup,
    urgencyLevel,
  } = req.body;
  await User.updateOne(
    { _id: req.user.sub },
    { name, phone, address, hospitalName, requiredBloodGroup, urgencyLevel },
  );
  await Recipient.updateOne(
    { userId: req.user.sub },
    { hospitalName, requiredBloodGroup, urgencyLevel, contactNumber: phone },
  );
  return res.json({ message: "Recipient profile updated." });
};

export const createBloodRequest = async (req, res) => {
  const recipient = await Recipient.findOne({ userId: req.user.sub });
  if (!recipient)
    return res.status(404).json({ message: "Recipient profile not found." });

  const request = await BloodRequest.create({
    recipientId: recipient._id,
    bloodGroup: req.body.bloodGroup,
    unitsRequired: req.body.unitsRequired,
    urgencyLevel: req.body.urgencyLevel,
    hospitalName: req.body.hospitalName,
    hospitalAddress: req.body.hospitalAddress,
    doctorNote: req.body.doctorNote ?? "",
    requesterLat: req.body.lat,
    requesterLng: req.body.lng,
    status: "matching",
  });

  const donorCandidates = await Donor.find({
    bloodGroup: req.body.bloodGroup,
    eligibilityStatus: "eligible",
    isAvailable: true,
  })
    .populate("userId")
    .lean();

  const recipientLat = Number(req.body.lat);
  const recipientLng = Number(req.body.lng);
  const ranked = donorCandidates
    .filter((d) => d.userId && d.userId.isActive !== false)
    .map((d) => ({
      donorId: d._id,
      donorUserId: d.userId._id,
      distanceKm:
        Number.isFinite(recipientLat) &&
        Number.isFinite(recipientLng) &&
        typeof d.locationLat === "number" &&
        typeof d.locationLng === "number"
          ? Number(
              haversineKm(
                recipientLat,
                recipientLng,
                d.locationLat,
                d.locationLng,
              ).toFixed(2),
            )
          : 999,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 10);

  if (ranked.length > 0) {
    request.status = "matched";
    request.matchedDonorId = ranked[0].donorId;
    await request.save();

    await MatchingLog.insertMany(
      ranked.map((m) => ({
        requestId: request._id,
        donorId: m.donorId,
        distanceKm: m.distanceKm,
        responseStatus: "pending",
      })),
    );

    const donorNotifications = await Notification.insertMany(
      ranked.map((m) => ({
        userId: m.donorUserId,
        requestId: request._id,
        message: `New blood request matched (${req.body.bloodGroup}) at ${req.body.hospitalName}.`,
        type: "alert",
      })),
    );

    donorNotifications.forEach((n) =>
      emitToUser(n.userId, "notification:new", n),
    );

    const recipientNotification = await Notification.create({
      userId: req.user.sub,
      message: `${ranked.length} donor(s) matched for ${req.body.bloodGroup}.`,
      type: "info",
    });
    emitToUser(req.user.sub, "notification:new", recipientNotification);
  } else {
    request.status = "pending";
    await request.save();
  }

  getIO()?.emit("request:status-changed", {
    requestId: request._id,
    status: request.status,
  });
  return res.status(201).json({ request, matchedDonors: ranked.length });
};

export const listRecipientRequests = async (req, res) => {
  const recipient = await Recipient.findOne({ userId: req.user.sub });
  if (!recipient)
    return res.status(404).json({ message: "Recipient profile not found." });

  const items = await BloodRequest.find({ recipientId: recipient._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "matchedDonorId",
      select: "userId bloodGroup age",
      populate: { path: "userId", select: "name phone address profilePhoto" },
    })
    .lean();

  const enriched = items.map((r) => {
    const donorUser = r.matchedDonorId?.userId;
    const donor =
      (r.status === "in_progress" || r.status === "fulfilled") && donorUser
        ? {
            id: r.matchedDonorId?._id,
            name: donorUser?.name ?? "",
            phone: donorUser?.phone ?? "",
            address: donorUser?.address ?? "",
            profilePhoto: donorUser?.profilePhoto ?? "",
            bloodGroup: r.matchedDonorId?.bloodGroup ?? "",
            age: r.matchedDonorId?.age ?? null,
          }
        : null;

    return { ...r, donor };
  });

  return res.json({ items: enriched });
};

export const cancelBloodRequest = async (req, res) => {
  const recipient = await Recipient.findOne({ userId: req.user.sub });
  if (!recipient)
    return res.status(404).json({ message: "Recipient profile not found." });

  const request = await BloodRequest.findOne({
    _id: req.params.id,
    recipientId: recipient._id,
    status: { $in: ["pending", "matching"] },
  });

  if (!request)
    return res
      .status(400)
      .json({ message: "Only pending/matching requests can be cancelled." });

  request.status = "cancelled";
  await request.save();

  await Notification.updateMany(
    { userId: req.user.sub, requestId: request._id, readStatus: false },
    { readStatus: true },
  );

  getIO()?.emit("request:status-changed", {
    requestId: request._id,
    status: request.status,
  });
  return res.json({ message: "Request cancelled.", request });
};

export const markBloodRequestFulfilled = async (req, res) => {
  const recipient = await Recipient.findOne({ userId: req.user.sub });
  if (!recipient)
    return res.status(404).json({ message: "Recipient profile not found." });

  const request = await BloodRequest.findOne({
    _id: req.params.id,
    recipientId: recipient._id,
    status: "in_progress",
  });
  if (!request)
    return res.status(404).json({ message: "In-progress request not found." });
  if (!request.matchedDonorId)
    return res
      .status(400)
      .json({ message: "No donor is assigned to this request." });

  const donor = await Donor.findById(request.matchedDonorId);
  if (!donor)
    return res.status(404).json({ message: "Assigned donor not found." });

  await Donation.create({
    donorId: donor._id,
    bloodGroup: request.bloodGroup,
    unitsDonated: request.unitsRequired,
    donationDate: new Date(),
    hospitalName: request.hospitalName,
  });

  donor.donationCount = (donor.donationCount ?? 0) + 1;
  donor.lastDonationDate = new Date();
  donor.eligibilityStatus = "not_eligible";
  donor.isAvailable = false;
  await donor.save();

  request.status = "fulfilled";
  request.fulfilledAt = new Date();
  await request.save();

  await Notification.updateMany(
    { userId: req.user.sub, requestId: request._id, readStatus: false },
    { readStatus: true },
  );

  const recipientNotification = await Notification.create({
    userId: req.user.sub,
    requestId: request._id,
    message: "Request marked fulfilled. Thank you for saving lives.",
    type: "info",
    readStatus: true,
  });
  emitToUser(req.user.sub, "notification:new", recipientNotification);

  if (donor.userId) {
    const donorNotification = await Notification.create({
      userId: donor.userId,
      requestId: request._id,
      message: "Donation recorded. Thank you for donating blood.",
      type: "info",
    });
    emitToUser(donor.userId, "notification:new", donorNotification);
  }

  getIO()?.emit("request:status-changed", {
    requestId: request._id,
    status: request.status,
  });
  return res.json({
    message: "Request fulfilled.",
    requestId: request._id,
    status: request.status,
  });
};

export const findNearbyDonors = async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const bloodGroup = String(req.query.bloodGroup ?? "");
  const maxDistanceKm = Number(req.query.maxDistanceKm ?? 50);

  const donors = await Donor.find({
    bloodGroup,
    eligibilityStatus: "eligible",
    isAvailable: true,
    locationLat: { $ne: null },
    locationLng: { $ne: null },
  })
    .populate("userId")
    .lean();

  const items = donors
    .map((d) => {
      const distanceKm = haversineKm(lat, lng, d.locationLat, d.locationLng);
      return {
        donorId: d._id,
        nameMasked: d.userId?.name ? `${d.userId.name[0]}***` : "Anonymous",
        bloodGroup: d.bloodGroup,
        distanceKm: Number(distanceKm.toFixed(2)),
        isAvailable: d.isAvailable,
      };
    })
    .filter((d) => d.distanceKm <= maxDistanceKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return res.json({ donors: items });
};

export const listRecipientNotifications = async (req, res) => {
  const items = await Notification.find({ userId: req.user.sub })
    .sort({ createdAt: -1 })
    .lean();
  const unreadCount = items.filter((n) => !n.readStatus).length;
  return res.json({ items, unreadCount });
};

export const notifyRequestMatched = async ({
  recipientUserId,
  donorUserId,
  requestId,
}) => {
  const recipientNotification = await Notification.create({
    userId: recipientUserId,
    message: "A donor has accepted your request and is on the way.",
    type: "alert",
  });
  const donorNotification = await Notification.create({
    userId: donorUserId,
    message: "You are matched with a recipient request.",
    type: "alert",
  });

  emitToUser(recipientUserId, "notification:new", recipientNotification);
  emitToUser(donorUserId, "notification:new", donorNotification);
  getIO()
    ?.to(`request:${requestId}`)
    .emit("request:status-changed", { requestId, status: "matched" });
};

export const uploadRecipientPhoto = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "No image file uploaded." });

  const b64 = req.file.buffer.toString("base64");
  const dataUri = `data:${req.file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "smart-blood-bank/profiles",
    resource_type: "image",
  });

  await User.updateOne(
    { _id: req.user.sub },
    { profilePhoto: result.secure_url },
  );
  return res.json({ profilePhoto: result.secure_url });
};
