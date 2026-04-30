import { checkSimSwap } from "./simSwap";
import { matchKyc } from "./kycMatch";
import { verifyLocation } from "./locationVerification";
import { NacApiError } from "./client";

export type TrustScoreDecision = "approve" | "review" | "block";

export interface TrustScoreSignal {
  name: string;
  status: "ok" | "failed" | "unavailable" | "missing";
  details?: Record<string, unknown>;
  penalty: number;
}

export interface TrustScoreInput {
  phoneNumber: string;
  kycData?: {
    nationalId: string;
    fullName: string;
    dateOfBirth: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
  numberVerified?: boolean;
}

export interface TrustScoreResult {
  score: number;
  decision: TrustScoreDecision;
  signals: TrustScoreSignal[];
}

export interface TrustScoreDeps {
  matchKyc: typeof matchKyc;
  verifyLocation: typeof verifyLocation;
  checkSimSwap: typeof checkSimSwap;
}

const SIM_SWAP_MAX_AGE_HOURS = 72;
const DEFAULT_RADIUS_METERS = 5000;

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getDecision(score: number): TrustScoreDecision {
  if (score >= 70) return "approve";
  if (score >= 40) return "review";
  return "block";
}

export function createTrustScoreEvaluator(deps: TrustScoreDeps) {
  return async function evaluateTrustScore(
    input: TrustScoreInput
  ): Promise<TrustScoreResult> {
    const signals: TrustScoreSignal[] = [];
    let score = 100;

    // SIM swap check
    try {
      const simResult = await deps.checkSimSwap(
        input.phoneNumber,
        SIM_SWAP_MAX_AGE_HOURS
      );
      if (simResult.swapped) {
        const penalty = 40;
        score -= penalty;
        signals.push({
          name: "sim_swap",
          status: "failed",
          penalty,
          details: { swapped: true, windowHours: SIM_SWAP_MAX_AGE_HOURS },
        });
      } else {
        signals.push({
          name: "sim_swap",
          status: "ok",
          penalty: 0,
          details: { swapped: false, windowHours: SIM_SWAP_MAX_AGE_HOURS },
        });
      }
    } catch (err) {
      if (err instanceof NacApiError) {
        const penalty = 15;
        score -= penalty;
        signals.push({
          name: "sim_swap",
          status: "unavailable",
          penalty,
          details: { reason: err.message },
        });
      } else {
        throw err;
      }
    }

    // KYC match
    if (input.kycData) {
      try {
        const kycResult = await deps.matchKyc({
          phoneNumber: input.phoneNumber,
          idDocument: input.kycData.nationalId,
          name: input.kycData.fullName,
          birthdate: input.kycData.dateOfBirth,
        });
        const nameMatch = kycResult.nameMatch === "true";
        const idMatch = kycResult.idDocumentMatch === "true";
        const passed = nameMatch && idMatch;
        if (!passed) {
          const penalty = 30;
          score -= penalty;
          signals.push({
            name: "kyc_match",
            status: "failed",
            penalty,
            details: { nameMatch, idMatch },
          });
        } else {
          signals.push({
            name: "kyc_match",
            status: "ok",
            penalty: 0,
            details: { nameMatch, idMatch },
          });
        }
      } catch (err) {
        if (err instanceof NacApiError) {
          const penalty = 20;
          score -= penalty;
          signals.push({
            name: "kyc_match",
            status: "unavailable",
            penalty,
            details: { reason: err.message },
          });
        } else {
          throw err;
        }
      }
    } else {
      const penalty = 20;
      score -= penalty;
      signals.push({
        name: "kyc_match",
        status: "missing",
        penalty,
      });
    }

    // Location verification
    if (input.location) {
      try {
        const result = await deps.verifyLocation(
          input.phoneNumber,
          input.location.latitude,
          input.location.longitude,
          input.location.radius || DEFAULT_RADIUS_METERS
        );
        const verified =
          result.verificationResult === "TRUE" ||
          result.verificationResult === "PARTIAL";
        if (!verified) {
          const penalty = 20;
          score -= penalty;
          signals.push({
            name: "location_verification",
            status: "failed",
            penalty,
            details: {
              result: result.verificationResult,
              matchRate: result.matchRate,
            },
          });
        } else {
          signals.push({
            name: "location_verification",
            status: "ok",
            penalty: 0,
            details: {
              result: result.verificationResult,
              matchRate: result.matchRate,
            },
          });
        }
      } catch (err) {
        if (err instanceof NacApiError) {
          const penalty = 10;
          score -= penalty;
          signals.push({
            name: "location_verification",
            status: "unavailable",
            penalty,
            details: { reason: err.message },
          });
        } else {
          throw err;
        }
      }
    } else {
      const penalty = 10;
      score -= penalty;
      signals.push({
        name: "location_verification",
        status: "missing",
        penalty,
      });
    }

    // Number verification (local signal)
    if (!input.numberVerified) {
      const penalty = 10;
      score -= penalty;
      signals.push({
        name: "number_verification",
        status: "missing",
        penalty,
      });
    } else {
      signals.push({
        name: "number_verification",
        status: "ok",
        penalty: 0,
      });
    }

    const finalScore = clampScore(score);
    return {
      score: finalScore,
      decision: getDecision(finalScore),
      signals,
    };
  };
}

export const evaluateTrustScore = createTrustScoreEvaluator({
  matchKyc,
  verifyLocation,
  checkSimSwap,
});
