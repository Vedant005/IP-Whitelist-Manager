import mongoose from "mongoose";
import ip from "ip";

const WhitelistEntrySchema = new mongoose.Schema(
  {
    ipAddress: {
      type: String,
      required: [true, "IP address or CIDR range is required"],
      validate: {
        validator: function (v) {
          // Validate if it's a valid IP address or CIDR range
          return ip.isV4Format(v) || ip.isV6Format(v) || ip.cidr.isValid(v);
        },
        message: (props) =>
          `${props.value} is not a valid IP address or CIDR range!`,
      },
      unique: true,
    },
    serviceName: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Update the updatedAt field on document save (if not already handled by timestamps: true)
WhitelistEntrySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export const WhitelistEntry = mongoose.model(
  "WhitelistEntry",
  WhitelistEntrySchema
);
