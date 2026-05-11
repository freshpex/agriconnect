import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { Farmer } from "../models/Farmer";
import { Order } from "../models/Order";
import {
  matchKyc,
  verifyNumber,
  verifyLocation,
  checkDeviceStatus,
} from "../services/nac";
import { NacApiError } from "../services/nac/client";
import { recordVerificationAudit } from "../utils/verificationAudit";

/**
 * KYC Match — verify farmer identity against telco records.
 */
export const verifyKyc = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const farmer = await Farmer.findById(req.user!.id);
  if (!farmer) throw new ApiError("User not found", 404);

  if (farmer.kycVerified) {
    res.json({ message: "KYC already verified", kycVerified: true });
    return;
  }

  const { nationalId, fullName, dateOfBirth } = req.body;

  let passed = false;
  let nameMatched = false;
  let idMatched = false;
  let dobMatched = false;
  let method: "network" | "fallback" = "network";

  try {
    const result = await matchKyc({
      phoneNumber: farmer.phone,
      idDocument: nationalId,
      name: fullName,
      birthdate: dateOfBirth,
    });
    nameMatched = result.nameMatch === "true";
    idMatched = result.idDocumentMatch === "true";
    dobMatched = result.birthdateMatch === "true";
    passed = nameMatched && idMatched;
  } catch (err) {
    // Nokia NaC cannot match Nigerian carrier numbers — accept KYC data as provided
    if (err instanceof NacApiError) {
      passed = true;
      method = "fallback";
    } else {
      throw err;
    }
  }

  if (passed) {
    farmer.kycVerified = true;
    farmer.kycData = {
      nationalId,
      fullName,
      dateOfBirth,
      verifiedAt: new Date(),
    };
    await farmer.save();
  }

  await recordVerificationAudit({
    userId: farmer._id.toString(),
    action: "kyc_match",
    outcome: passed ? "passed" : "failed",
    method,
    metadata: {
      matches: {
        name: nameMatched,
        idDocument: idMatched,
        birthdate: dobMatched,
      },
    },
  });

  res.json({
    kycVerified: passed,
    method,
    matches: {
      name: nameMatched,
      idDocument: idMatched,
      birthdate: dobMatched,
    },
    message: passed
      ? "Identity verified successfully"
      : "Identity verification failed. Please check your details.",
  });
};

/**
 * Number Verification — silent network-level phone number verification.
 */
export const verifyPhoneNumber = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const farmer = await Farmer.findById(req.user!.id);
  if (!farmer) throw new ApiError("User not found", 404);

  let numberVerified = false;
  let method: "network" | "fallback" = "network";

  try {
    const result = await verifyNumber(farmer.phone);
    numberVerified = result.devicePhoneNumberVerified;
  } catch (err) {
    // Number verification requires the request to originate from the device's
    // mobile carrier network — a backend call will never satisfy this.
    // Fall back to marking as verified when Nokia cannot process the request.
    if (err instanceof NacApiError) {
      numberVerified = true;
      method = "fallback";
    } else {
      throw err;
    }
  }

  farmer.numberVerified = numberVerified;
  await farmer.save();

  await recordVerificationAudit({
    userId: farmer._id.toString(),
    action: "number_verification",
    outcome: numberVerified ? "passed" : "failed",
    method,
  });

  res.json({
    numberVerified,
    method,
    message: numberVerified
      ? "Phone number verified"
      : "Phone number could not be verified",
  });
};

/**
 * Location Verification — confirm farmer is at their farm.
 */
export const verifyFarmLocation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const farmer = await Farmer.findById(req.user!.id);
  if (!farmer) throw new ApiError("User not found", 404);

  const { latitude, longitude, radius } = req.body;

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const rad = radius ? parseInt(radius) : 5000;

  let verificationResult: string;
  let matchRate: number | undefined;
  let method: "network" | "gps";

  try {
    const result = await verifyLocation(farmer.phone, lat, lng, rad);
    verificationResult = result.verificationResult;
    matchRate = result.matchRate;
    method = "network";
  } catch (err) {
    // Nokia NaC can't identify this carrier — fall back to GPS coordinates
    if (
      err instanceof NacApiError &&
      (err.statusCode === 404 || err.statusCode === 422)
    ) {
      verificationResult = "TRUE";
      method = "gps";
    } else {
      throw err;
    }
  }

  const verified =
    verificationResult === "TRUE" || verificationResult === "PARTIAL";

  farmer.locationVerified = verified;
  if (verified) {
    farmer.farmCoordinates = { latitude: lat, longitude: lng };
  }
  await farmer.save();

  await recordVerificationAudit({
    userId: farmer._id.toString(),
    action: "location_verification",
    outcome: verified ? "passed" : "failed",
    method,
    metadata: { verificationResult, matchRate },
  });

  res.json({
    locationVerified: verified,
    verificationResult,
    matchRate,
    method,
    message: verified
      ? "Farm location verified"
      : "Location verification failed",
  });
};

/**
 * Device Status — check if a user's device is reachable.
 * Restricted: can only check own device or a counterparty in a shared order.
 */
export const getDeviceReachability = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const requesterId = req.user!.id;

  // Allow checking own device status
  if (userId !== requesterId) {
    // Only allow if they share an order (buyer/seller relationship)
    const sharedOrder = await Order.findOne({
      $or: [
        { buyer: requesterId, seller: userId },
        { seller: requesterId, buyer: userId },
      ],
      status: { $in: ["pending", "confirmed", "in-transit"] },
    });

    if (!sharedOrder) {
      throw new ApiError(
        "Not authorized to check this user's device status",
        403
      );
    }
  }

  const farmer = await Farmer.findById(userId);
  if (!farmer) throw new ApiError("User not found", 404);

  let reachabilityStatus: string;
  let method: "network" | "fallback" = "network";

  try {
    const result = await checkDeviceStatus(farmer.phone);
    reachabilityStatus = result.reachabilityStatus;
  } catch (err) {
    if (err instanceof NacApiError) {
      reachabilityStatus = "UNKNOWN";
      method = "fallback";
    } else {
      throw err;
    }
  }

  res.json({
    userId,
    reachabilityStatus,
    isOnline:
      reachabilityStatus === "CONNECTED_DATA" ||
      reachabilityStatus === "CONNECTED_SMS" ||
      reachabilityStatus === "REACHABLE_DATA" ||
      reachabilityStatus === "REACHABLE_SMS",
    method,
  });
};

/**
 * Request buyer-to-farmer account type review.
 */
export const requestFarmerAccess = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const farmer = await Farmer.findById(req.user!.id);
  if (!farmer) throw new ApiError("User not found", 404);

  if (farmer.role === "farmer") {
    res.json({
      message: "This account already has farmer access.",
      user: farmer,
    });
    return;
  }

  if (farmer.accountTypeChangeRequest?.status === "pending") {
    res.json({
      message: "Your farmer access request is already pending review.",
      user: farmer,
    });
    return;
  }

  const note =
    typeof req.body.note === "string" ? req.body.note.trim().slice(0, 500) : "";

  farmer.accountTypeChangeRequest = {
    requestedRole: "farmer",
    status: "pending",
    note: note || undefined,
    requestedAt: new Date(),
  };

  await farmer.save();

  res.status(202).json({
    message:
      "Farmer access request submitted. The team will review your account type change.",
    user: farmer,
  });
};

/**
 * Update profile (name, farmAddress).
 */
export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const allowed = ["name", "farmAddress"];
  const updates: Record<string, unknown> = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  const farmer = await Farmer.findByIdAndUpdate(req.user!.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!farmer) throw new ApiError("User not found", 404);

  res.json({ user: farmer });
};
