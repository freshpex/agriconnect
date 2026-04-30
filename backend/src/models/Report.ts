import mongoose, { Schema, Document } from "mongoose";

export type ReportTargetType = "listing" | "order" | "user" | "other";
export type ReportStatus = "open" | "reviewing" | "resolved" | "rejected";

export interface IReport extends Document {
  reporter: mongoose.Types.ObjectId;
  targetType: ReportTargetType;
  targetId?: mongoose.Types.ObjectId;
  reason: string;
  description?: string;
  status: ReportStatus;
  resolutionNote?: string;
  resolvedAt?: Date;
  assignedTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
    targetType: {
      type: String,
      enum: ["listing", "order", "user", "other"],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId },
    reason: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    status: {
      type: String,
      enum: ["open", "reviewing", "resolved", "rejected"],
      default: "open",
    },
    resolutionNote: { type: String, maxlength: 1000 },
    resolvedAt: Date,
    assignedTo: { type: Schema.Types.ObjectId, ref: "Farmer" },
  },
  { timestamps: true }
);

ReportSchema.index({ reporter: 1, status: 1, createdAt: -1 });
ReportSchema.index({ targetType: 1, targetId: 1 });

export const Report = mongoose.model<IReport>("Report", ReportSchema);
