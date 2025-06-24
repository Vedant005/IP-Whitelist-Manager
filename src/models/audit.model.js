import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: [
        "WHITELIST_CREATE",
        "WHITELIST_UPDATE",
        "WHITELIST_DELETE",
        "ACCESS_GRANTED",
        "ACCESS_DENIED",
        "USER_LOGIN",
        "USER_REGISTER",
        "AUTH_FAILURE",
        "SYSTEM_ERROR",
      ],
    },
    entityId: {
      // ID of the whitelist entry or user affected
      type: mongoose.Schema.Types.ObjectId,
      refPath: "entityRef", // Dynamic reference based on entityRef field
      required: false,
    },
    entityRef: {
      // To specify which model entityId refers to
      type: String,
      required: function () {
        return this.entityId != null;
      }, // Required if entityId is present
      enum: ["WhitelistEntry", "User"],
    },
    userId: {
      // User who performed the action or tried to access
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    details: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
