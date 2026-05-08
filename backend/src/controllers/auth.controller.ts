import { Response } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import config from "../config";
import { Farmer, type IFarmer } from "../models/Farmer";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { checkSimSwap } from "../services/nac";
import { recordVerificationAudit } from "../utils/verificationAudit";

const jwtOptions = { expiresIn: config.jwt.expiresIn } as SignOptions;

function serializeUser(farmer: IFarmer) {
  return {
    id: farmer._id,
    name: farmer.name,
    phone: farmer.phone,
    role: farmer.role,
    accountTypeChangeRequest: farmer.accountTypeChangeRequest,
    kycVerified: farmer.kycVerified,
    simSwapChecked: farmer.simSwapChecked,
    simSwapLastCheck: farmer.simSwapLastCheck,
    numberVerified: farmer.numberVerified,
    locationVerified: farmer.locationVerified,
    farmAddress: farmer.farmAddress,
    farmCoordinates: farmer.farmCoordinates,
    profileImage: farmer.profileImage,
    rating: farmer.rating,
    totalSales: farmer.totalSales,
    isActive: farmer.isActive,
    lastSeen: farmer.lastSeen,
    createdAt: farmer.createdAt,
    updatedAt: farmer.updatedAt,
  };
}

export const register = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { name, phone, password, role } = req.body;

  const existing = await Farmer.findOne({ phone });
  if (existing) {
    throw new ApiError("Phone number already registered", 409);
  }

  let simSwapOutcome: "passed" | "failed" | "unavailable" = "passed";
  let simSwapChecked = false;

  // SIM Swap fraud check before registration
  try {
    const simResult = await checkSimSwap(phone, 72);
    if (simResult.swapped) {
      simSwapOutcome = "failed";
      throw new ApiError(
        "Registration blocked: SIM swap detected recently. Please try again later or contact support.",
        403
      );
    }
    simSwapChecked = true;
  } catch (err) {
    // If Nokia API is unavailable, allow registration but flag it
    if (err instanceof ApiError) throw err;
    console.warn("SIM Swap check unavailable during registration:", phone);
    simSwapOutcome = "unavailable";
  }

  const farmer = await Farmer.create({
    name,
    phone,
    password,
    role: role || "farmer",
    simSwapChecked,
    simSwapLastCheck: simSwapChecked ? new Date() : undefined,
    deviceInfo: { phoneNumber: phone },
  });

  await recordVerificationAudit({
    userId: farmer._id.toString(),
    action: "sim_swap_check",
    outcome: simSwapOutcome,
    method: "network",
    metadata: { windowHours: 72 },
  });

  const token = jwt.sign(
    { id: farmer._id, phone: farmer.phone, role: farmer.role },
    config.jwt.secret as Secret,
    jwtOptions
  );

  res.status(201).json({
    token,
    user: serializeUser(farmer),
  });
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { phone, password } = req.body;

  const farmer = await Farmer.findOne({ phone }).select("+password");
  if (!farmer) {
    throw new ApiError("Invalid phone or password", 401);
  }

  if (!farmer.isActive) {
    throw new ApiError("Account deactivated", 403);
  }

  const isMatch = await farmer.comparePassword(password);
  if (!isMatch) {
    throw new ApiError("Invalid phone or password", 401);
  }

  let loginSimSwapOutcome: "passed" | "failed" | "unavailable" = "passed";

  // SIM Swap check on login to detect account takeover
  try {
    const simResult = await checkSimSwap(phone, 24);
    if (simResult.swapped) {
      loginSimSwapOutcome = "failed";
      throw new ApiError(
        "Login blocked: SIM swap detected. Verify your identity.",
        403
      );
    }
    farmer.simSwapChecked = true;
    farmer.simSwapLastCheck = new Date();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.warn("SIM Swap check unavailable during login:", phone);
    loginSimSwapOutcome = "unavailable";
  }

  farmer.lastSeen = new Date();
  await farmer.save();

  await recordVerificationAudit({
    userId: farmer._id.toString(),
    action: "sim_swap_check",
    outcome: loginSimSwapOutcome,
    method: "network",
    metadata: { windowHours: 24 },
  });

  const token = jwt.sign(
    { id: farmer._id, phone: farmer.phone, role: farmer.role },
    config.jwt.secret as Secret,
    jwtOptions
  );

  res.json({
    token,
    user: serializeUser(farmer),
  });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const farmer = await Farmer.findById(req.user!.id);
  if (!farmer) throw new ApiError("User not found", 404);

  res.json({ user: serializeUser(farmer) });
};
