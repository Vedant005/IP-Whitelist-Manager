import { AuditLog } from "../models/audit.model.js";
import { WhitelistEntry } from "../models/whitelist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllWhitelistEntries = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.search) {
    query.$or = [
      { ipAddress: { $regex: req.query.search, $options: "i" } },
      { serviceName: { $regex: req.query.search, $options: "i" } },
      { description: { $regex: req.query.search, $options: "i" } },
    ];
  }
  if (req.query.serviceName) {
    query.serviceName = { $regex: req.query.serviceName, $options: "i" };
  }

  const totalEntries = await WhitelistEntry.countDocuments(query);
  const entries = await WhitelistEntry.find(query)
    .sort({ createdAt: -1 }) // Sort by newest first
    .skip(skip)
    .limit(limit)
    .populate("createdBy", "email");

  const count = entries.length;
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        count,
        totalEntries,
        page,
        Math.ceil(totalEntries / limit),
        entries
      )
    );
});

const getWhiteListEntry = asyncHandler(async (req, res) => {
  const entry = await WhitelistEntry.findById(req.params.id).populate(
    "createdBy",
    "email"
  );

  if (!entry) {
    return res.status(404).json(new ApiError(400, "Invalid Id format"));
  }
  res.status(200).json(new ApiResponse(200, entry, "Success!"));
});

const createWhiteListEntry = async (req, res) => {
  req.body.createdBy = req.user.id;

  const entry = await WhitelistEntry.create(req.body);

  await AuditLog.create({
    eventType: "WHITELIST_CREATE",
    entityId: entry._id,
    entityRef: "WhitelistEntry",
    userId: req.user.id,
    ipAddress: req.ip || req.connection.remoteAddress,
    details: { ipAddress: entry.ipAddress, serviceName: entry.serviceName },
  });

  res.status(201).json(new ApiResponse(200, entry, "Entry created"));
};

const updateWhitelistEntry = asyncHandler(async (req, res) => {
  let entry = await WhitelistEntry.findById(req.params.id);

  if (!entry) {
    return res
      .status(404)
      .json({ success: false, message: "Whitelist entry not found" });
  }

  await delete req.body.createdBy;
  await delete req.body.createdAt;

  entry = await WhitelistEntry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await AuditLog.create({
    eventType: "WHITELIST_UPDATE",
    entityId: entry._id,
    entityRef: "WhitelistEntry",
    userId: req.user.id,
    ipAddress: req.ip || req.connection.remoteAddress,
    details: {
      oldIpAddress: entry.ipAddress,
      newIpAddress: req.body.ipAddress || entry.ipAddress,
      oldServiceName: entry.serviceName,
      newServiceName: req.body.serviceName || entry.serviceName,
    },
  });
  res.status(200).json(new ApiResponse(200, entry, "Entry updated"));
});

const deleteWhitelistEntry = asyncHandler(async (req, res) => {
  const entry = await WhitelistEntry.findById(req.params.id);

  if (!entry) {
    return res
      .status(404)
      .json({ success: false, message: "Whitelist entry not found" });
  }

  await WhitelistEntry.deleteOne({ _id: req.params.id });

  await AuditLog.create({
    eventType: "WHITELIST_DELETE",
    entityId: entry._id,
    entityRef: "WhitelistEntry",
    userId: req.user.id,
    ipAddress: req.ip || req.connection.remoteAddress,
    details: { ipAddress: entry.ipAddress, serviceName: entry.serviceName },
  });
  res.status(200).json(new ApiResponse(200, "Entry deleted"));
});

export {
  getAllWhitelistEntries,
  getWhiteListEntry,
  createWhiteListEntry,
  updateWhitelistEntry,
  deleteWhitelistEntry,
};
