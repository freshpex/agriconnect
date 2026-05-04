import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import {
  getUsers,
  reviewFarmerAccessRequest,
  updateUser,
} from "../controllers/admin.controller";
import {
  reviewFarmerAccessRequestRules,
  updateUserRules,
} from "../validators";

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get("/users", asyncHandler(getUsers));
router.patch("/users/:id", validate(updateUserRules), asyncHandler(updateUser));
router.patch(
  "/users/:id/farmer-access",
  validate(reviewFarmerAccessRequestRules),
  asyncHandler(reviewFarmerAccessRequest)
);

export default router;
