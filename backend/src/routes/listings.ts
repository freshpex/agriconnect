import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { createListingRules, updateListingRules } from "../validators";
import {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  getMyListings,
} from "../controllers/listing.controller";

const router = Router();

// Public routes
router.get("/", asyncHandler(getListings));

// Protected routes — specific paths before parameterized paths
router.get("/user/mine", authenticate, asyncHandler(getMyListings));
router.post(
  "/",
  authenticate,
  validate(createListingRules),
  asyncHandler(createListing)
);
router.put(
  "/:id",
  authenticate,
  validate(updateListingRules),
  asyncHandler(updateListing)
);
router.delete("/:id", authenticate, asyncHandler(deleteListing));

// Public: single listing (after /user/mine to avoid conflict)
router.get("/:id", asyncHandler(getListing));

export default router;
