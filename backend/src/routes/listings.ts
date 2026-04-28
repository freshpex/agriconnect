import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
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
router.get(
  "/user/mine",
  authenticate,
  requireRole("farmer"),
  asyncHandler(getMyListings)
);
router.post(
  "/",
  authenticate,
  requireRole("farmer"),
  validate(createListingRules),
  asyncHandler(createListing)
);
router.put(
  "/:id",
  authenticate,
  requireRole("farmer"),
  validate(updateListingRules),
  asyncHandler(updateListing)
);
router.delete(
  "/:id",
  authenticate,
  requireRole("farmer"),
  asyncHandler(deleteListing)
);

// Public: single listing (after /user/mine to avoid conflict)
router.get("/:id", asyncHandler(getListing));

export default router;
