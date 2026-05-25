import { AdminLog } from "../models/AdminLog.js";
import { BloodInventory } from "../models/BloodInventory.js";
import { BloodRequest } from "../models/BloodRequest.js";
import { Donation } from "../models/Donation.js";
import { Donor } from "../models/Donor.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { emitToUser, getIO } from "../socket/socket.js";

const logAction = async (adminId, actionType, description) => {
  await AdminLog.create({ adminId, actionType, description });
};

export const getDashboardStats = async (_req, res) => {
  const [totalRegisteredDonors, totalActiveDonors, pendingBloodRequests, totalDonationsThisMonth] = await Promise.all([
    Donor.countDocuments(),
    Donor.countDocuments({ isAvailable: true }),
    BloodRequest.countDocuments({ status: { $in: ["pending", "matching"] } }),
    Donation.countDocuments({
      donationDate: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    }),
  ]);

  const inventoryAgg = await BloodInventory.aggregate([
    { $group: { _id: null, units: { $sum: "$unitsAvailable" } } },
  ]);
  const bloodUnitsInInventory = inventoryAgg[0]?.units ?? 0;
  const emergencyAlertsSentToday = await Notification.countDocuments({
    type: "emergency",
    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  });

  return res.json({
    totalRegisteredDonors,
    totalActiveDonors,
    pendingBloodRequests,
    totalDonationsThisMonth,
    bloodUnitsInInventory,
    emergencyAlertsSentToday,
  });
};

export const getUsers = async (req, res) => {
  const { role, bloodGroup, isActive, search } = req.query;
  const query = {};

  if (role) query.role = role;
  if (bloodGroup) query.bloodGroup = bloodGroup;
  if (typeof isActive === "string") query.isActive = isActive === "true";
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const items = await User.find(query).select("-passwordHash").sort({ createdAt: -1 }).lean();
  return res.json({ items });
};

export const approveUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true }).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found." });
  await logAction(req.user.sub, "approve_user", `Approved user ${user.email}`);
  return res.json({ user });
};

export const suspendUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found." });
  await logAction(req.user.sub, "suspend_user", `Suspended user ${user.email}`);
  return res.json({ user });
};

export const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  await logAction(req.user.sub, "delete_user", `Deleted user ${user.email}`);
  return res.json({ message: "User deleted." });
};

export const getInventory = async (_req, res) => {
  const items = await BloodInventory.find().sort({ createdAt: -1 }).lean();
  return res.json({ items });
};

export const addInventory = async (req, res) => {
  const entry = await BloodInventory.create({
    bloodGroup: req.body.bloodGroup,
    unitsAvailable: req.body.unitsAvailable,
    unitsReserved: req.body.unitsReserved ?? 0,
    expiryDate: req.body.expiryDate,
    location: req.body.location,
    sourceDonorId: req.body.sourceDonorId ?? null,
    addedByAdmin: req.user.sub,
  });
  await logAction(req.user.sub, "add_inventory", `Added ${entry.unitsAvailable} units for ${entry.bloodGroup}`);
  getIO()?.emit("inventory:updated", { inventoryId: entry._id });
  return res.status(201).json({ entry });
};

export const updateInventory = async (req, res) => {
  const entry = await BloodInventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!entry) return res.status(404).json({ message: "Inventory entry not found." });
  await logAction(req.user.sub, "update_inventory", `Updated inventory ${entry._id}`);
  getIO()?.emit("inventory:updated", { inventoryId: entry._id });
  return res.json({ entry });
};

export const getRequests = async (_req, res) => {
  const items = await BloodRequest.find().sort({ createdAt: -1 }).lean();
  return res.json({ items });
};

export const getRequestDetails = async (req, res) => {
  const request = await BloodRequest.findById(req.params.id)
    .populate({
      path: "recipientId",
      populate: { path: "userId", select: "name email phone address hospitalName" },
    })
    .populate({
      path: "matchedDonorId",
      populate: { path: "userId", select: "name email phone address profilePhoto" },
    })
    .lean();

  if (!request) return res.status(404).json({ message: "Request not found." });

  const recipientUser = request.recipientId?.userId;
  const donorUser = request.matchedDonorId?.userId;

  return res.json({
    request: {
      _id: request._id,
      bloodGroup: request.bloodGroup,
      unitsRequired: request.unitsRequired,
      urgencyLevel: request.urgencyLevel,
      hospitalName: request.hospitalName,
      hospitalAddress: request.hospitalAddress,
      doctorNote: request.doctorNote ?? "",
      status: request.status,
      createdAt: request.createdAt,
      fulfilledAt: request.fulfilledAt ?? null,
    },
    recipient: recipientUser
      ? {
          name: recipientUser.name ?? "",
          email: recipientUser.email ?? "",
          phone: recipientUser.phone ?? "",
          address: recipientUser.address ?? "",
          hospitalName: recipientUser.hospitalName ?? request.hospitalName ?? "",
        }
      : null,
    donor: donorUser
      ? {
          name: donorUser.name ?? "",
          email: donorUser.email ?? "",
          phone: donorUser.phone ?? "",
          address: donorUser.address ?? "",
          profilePhoto: donorUser.profilePhoto ?? "",
        }
      : null,
  });
};

export const getDonations = async (_req, res) => {
  const items = await Donation.find().sort({ donationDate: -1 }).lean();
  return res.json({ items });
};

export const broadcastEmergency = async (req, res) => {
  const { bloodGroup, hospital, message, radiusKm } = req.body;
  const recipients = await User.find({ role: "donor", isActive: true }).select("_id").lean();

  const docs = recipients.map((user) => ({
    userId: user._id,
    message: `Emergency: ${bloodGroup} needed at ${hospital}. ${message}`,
    type: "emergency",
  }));

  if (docs.length > 0) {
    await Notification.insertMany(docs);
    docs.forEach((doc) => emitToUser(doc.userId, "emergency:broadcast", doc));
  }

  await logAction(
    req.user.sub,
    "broadcast_emergency",
    `Broadcasted emergency for ${bloodGroup} at ${hospital} radius ${radiusKm ?? "N/A"}km`
  );

  getIO()?.emit("emergency:broadcast", {
    bloodGroup,
    hospital,
    message,
    radiusKm,
    sentCount: docs.length,
  });

  return res.status(201).json({ sentCount: docs.length });
};

export const generateReports = async (req, res) => {
  const { type = "summary" } = req.query;
  await logAction(req.user.sub, "generate_report", `Generated ${type} report`);
  return res.json({ message: `${type} report generated.` });
};

export const getLogs = async (_req, res) => {
  const items = await AdminLog.find().sort({ createdAt: -1 }).limit(200).lean();
  return res.json({ items });
};
