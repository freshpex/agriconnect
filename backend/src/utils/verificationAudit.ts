import {
  VerificationAudit,
  VerificationOutcome,
  VerificationAction,
} from "../models/VerificationAudit";

interface VerificationAuditInput {
  userId: string;
  action: VerificationAction;
  outcome: VerificationOutcome;
  method?: string;
  score?: number;
  decision?: string;
  metadata?: Record<string, unknown>;
}

export async function recordVerificationAudit(
  input: VerificationAuditInput
): Promise<void> {
  try {
    await VerificationAudit.create({
      user: input.userId,
      action: input.action,
      outcome: input.outcome,
      method: input.method,
      score: input.score,
      decision: input.decision,
      metadata: input.metadata,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Audit] Failed to record verification audit", error);
    }
  }
}
