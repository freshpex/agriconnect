import mongoose, { Schema, Document } from "mongoose";

export interface IListing extends Document {
  farmer: mongoose.Types.ObjectId;
  cropName: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  currency: string;
  description?: string;
  images: string[];
  locationVerified: boolean;
  coordinates?: {
    type: string;
    coordinates: [number, number];
  };
  farmAddress?: string;
  harvestDate?: Date;
  trustScore?: number;
  trustDecision?: "approve" | "review" | "block";
  reviewStatus?: "pending" | "approved" | "rejected";
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNote?: string;
  active: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const CROP_CATEGORIES = [
  "grains",
  "vegetables",
  "fruits",
  "tubers",
  "legumes",
  "spices",
  "cash-crops",
  "other",
];

const ListingSchema = new Schema<IListing>(
  {
    farmer: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
    cropName: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: CROP_CATEGORIES,
      default: "other",
    },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, default: "kg" },
    pricePerUnit: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "NGN" },
    description: { type: String, trim: true, maxlength: 500 },
    images: [{ type: String }],
    locationVerified: { type: Boolean, default: false },
    coordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] },
    },
    farmAddress: String,
    harvestDate: Date,
    trustScore: { type: Number, min: 0, max: 100 },
    trustDecision: {
      type: String,
      enum: ["approve", "review", "block"],
    },
    reviewStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "Farmer" },
    reviewedAt: Date,
    reviewNote: { type: String, maxlength: 500 },
    active: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ListingSchema.index({ coordinates: "2dsphere" });
ListingSchema.index({ cropName: "text", description: "text" });
ListingSchema.index({ category: 1, active: 1 });
ListingSchema.index({ farmer: 1 });

export const Listing = mongoose.model<IListing>("Listing", ListingSchema);
