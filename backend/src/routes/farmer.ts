import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { kycMatchRules, verifyLocationRules } from "../validators";
import {
  verifyKyc,
  verifyPhoneNumber,
  verifyFarmLocation,
  getDeviceReachability,
  updateProfile,
  requestFarmerAccess,
} from "../controllers/farmer.controller";

const router = Router();

// All farmer routes require authentication
router.use(authenticate);

router.put("/profile", asyncHandler(updateProfile));
router.post("/request-farmer-access", asyncHandler(requestFarmerAccess));
router.post("/verify-kyc", validate(kycMatchRules), asyncHandler(verifyKyc));
router.post("/verify-number", asyncHandler(verifyPhoneNumber));
router.post(
  "/verify-location",
  validate(verifyLocationRules),
  asyncHandler(verifyFarmLocation)
);
router.get("/device-status/:userId", asyncHandler(getDeviceReachability));

export default router;
