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

  const result = await matchKyc({
    phoneNumber: farmer.phone,
    idDocument: nationalId,
    name: fullName,
    birthdate: dateOfBirth,
  });

  const nameMatched = result.nameMatch === "true";
  const idMatched = result.idDocumentMatch === "true";
  const dobMatched = result.birthdateMatch === "true";
  const passed = nameMatched && idMatched;

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

  res.json({
    kycVerified: passed,
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

  const result = await verifyNumber(farmer.phone);

  farmer.numberVerified = result.devicePhoneNumberVerified;
  await farmer.save();

  res.json({
    numberVerified: result.devicePhoneNumberVerified,
    message: result.devicePhoneNumberVerified
      ? "Phone number verified at network level"
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

  const result = await verifyLocation(
    farmer.phone,
    parseFloat(latitude),
    parseFloat(longitude),
    radius ? parseInt(radius) : 5000
  );

  const verified = result.verificationResult === "TRUE";

  farmer.locationVerified = verified;
  if (verified) {
    farmer.farmCoordinates = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
  }
  await farmer.save();

  res.json({
    locationVerified: verified,
    verificationResult: result.verificationResult,
    matchRate: result.matchRate,
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

  const result = await checkDeviceStatus(farmer.phone);

  res.json({
    userId,
    reachabilityStatus: result.reachabilityStatus,
    isOnline:
      result.reachabilityStatus === "CONNECTED_DATA" ||
      result.reachabilityStatus === "CONNECTED_SMS",
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
