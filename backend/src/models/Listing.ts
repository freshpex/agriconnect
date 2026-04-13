import mongoose, { Schema, Document } from "mongoose";

export interface IListing extends Document {
  farmer: mongoose.Types.ObjectId;
  cropName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  currency: string;
  description?: string;
  locationVerified: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    farmer: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
    cropName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, default: "kg" },
    pricePerUnit: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "NGN" },
    description: { type: String, trim: true },
    locationVerified: { type: Boolean, default: false },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ListingSchema.index({ coordinates: "2dsphere" });

export const Listing = mongoose.model<IListing>("Listing", ListingSchema);
