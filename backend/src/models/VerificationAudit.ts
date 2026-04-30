import mongoose, { Schema, Document } from "mongoose";

export type VerificationAction =
  | "kyc_match"
  | "number_verification"
  | "location_verification"
  | "sim_swap_check"
  | "trust_score";

export type VerificationOutcome =
  | "passed"
  | "failed"
  | "pending"
  | "blocked"
  | "unavailable";

export interface IVerificationAudit extends Document {
  user: mongoose.Types.ObjectId;
  action: VerificationAction;
  method?: string;
  outcome: VerificationOutcome;
  score?: number;
  decision?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationAuditSchema = new Schema<IVerificationAudit>(
  {
    user: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
    action: { type: String, required: true },
    method: { type: String },
    outcome: { type: String, required: true },
    score: { type: Number, min: 0, max: 100 },
    decision: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

VerificationAuditSchema.index({ user: 1, action: 1, createdAt: -1 });

export const VerificationAudit = mongoose.model<IVerificationAudit>(
  "VerificationAudit",
  VerificationAuditSchema
);
