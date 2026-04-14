import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { Listing } from "../models/Listing";
import { Farmer } from "../models/Farmer";
import { checkSimSwap } from "../services/nac";

/**
 * Create a new produce listing.
 * Per myidea.md: SIM Swap check before listing creation,
 * and propagate farmer's locationVerified to the listing.
 */
export const createListing = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  // SIM Swap check before listing creation (per myidea.md requirement)
  const farmer = await Farmer.findById(req.user!.id);
  if (!farmer) throw new ApiError("User not found", 404);

  try {
    const simResult = await checkSimSwap(farmer.phone, 24);
    if (simResult.swapped) {
      throw new ApiError(
        "Listing creation blocked: SIM swap detected. Verify your identity.",
        403
      );
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.warn(
      "SIM Swap check unavailable during listing creation:",
      farmer.phone
    );
  }

  const {
    cropName,
    category,
    quantity,
    unit,
    pricePerUnit,
    currency,
    description,
    images,
    latitude,
    longitude,
    farmAddress,
    harvestDate,
  } = req.body;

  const listingData: Record<string, unknown> = {
    farmer: req.user!.id,
    cropName,
    category,
    quantity,
    unit,
    pricePerUnit,
    currency,
    description,
    images: images || [],
    farmAddress,
    harvestDate,
    locationVerified: farmer.locationVerified || false,
  };

  if (latitude && longitude) {
    listingData.coordinates = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };
  }

  const listing = await Listing.create(listingData);

  res.status(201).json({ listing });
};

/**
 * Get all active listings with search, filter, and pagination.
 */
export const getListings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    latitude,
    longitude,
    radius,
    page = "1",
    limit = "20",
  } = req.query;

  const filter: Record<string, unknown> = { active: true };

  // Text search
  if (search) {
    filter.$text = { $search: search as string };
  }

  // Category filter
  if (category) {
    filter.category = category;
  }

  // Price range
  if (minPrice || maxPrice) {
    filter.pricePerUnit = {};
    if (minPrice)
      (filter.pricePerUnit as Record<string, number>).$gte = parseFloat(
        minPrice as string
      );
    if (maxPrice)
      (filter.pricePerUnit as Record<string, number>).$lte = parseFloat(
        maxPrice as string
      );
  }

  // Geo-proximity
  if (latitude && longitude) {
    const radiusKm = radius ? parseFloat(radius as string) : 50;
    filter.coordinates = {
      $nearSphere: {
        $geometry: {
          type: "Point",
          coordinates: [
            parseFloat(longitude as string),
            parseFloat(latitude as string),
          ],
        },
        $maxDistance: radiusKm * 1000,
      },
    };
  }

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .populate("farmer", "name phone rating kycVerified locationVerified")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Listing.countDocuments(filter),
  ]);

  res.json({
    listings,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
};

/**
 * Get single listing by ID.
 */
export const getListing = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const listing = await Listing.findById(req.params.id)
    .populate(
      "farmer",
      "name phone rating kycVerified locationVerified farmAddress"
    )
    .lean();

  if (!listing) throw new ApiError("Listing not found", 404);

  // Increment views
  await Listing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  res.json({ listing });
};

/**
 * Update own listing.
 */
export const updateListing = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) throw new ApiError("Listing not found", 404);
  if (listing.farmer.toString() !== req.user!.id) {
    throw new ApiError("Not authorized to update this listing", 403);
  }

  const allowed = [
    "cropName",
    "category",
    "quantity",
    "unit",
    "pricePerUnit",
    "description",
    "active",
    "farmAddress",
    "harvestDate",
  ];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      (listing as unknown as Record<string, unknown>)[key] = req.body[key];
    }
  }

  await listing.save();

  res.json({ listing });
};

/**
 * Soft-delete own listing (deactivate instead of removing).
 * Orders referencing this listing remain intact.
 */
export const deleteListing = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) throw new ApiError("Listing not found", 404);
  if (listing.farmer.toString() !== req.user!.id) {
    throw new ApiError("Not authorized to delete this listing", 403);
  }

  listing.active = false;
  await listing.save();

  res.json({ message: "Listing deleted" });
};

/**
 * Get logged-in farmer's listings with pagination.
 */
export const getMyListings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { page = "1", limit = "20" } = req.query;

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const filter = { farmer: req.user!.id };

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Listing.countDocuments(filter),
  ]);

  res.json({
    listings,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
};
