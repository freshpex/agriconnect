import mongoose, { Schema, Document } from "mongoose";

export interface IFarmer extends Document {
  name: string;
  phone: string;
  kycVerified: boolean;
  simSwapChecked: boolean;
  locationVerified: boolean;
  farmCoordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FarmerSchema = new Schema<IFarmer>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    kycVerified: { type: Boolean, default: false },
    simSwapChecked: { type: Boolean, default: false },
    locationVerified: { type: Boolean, default: false },
    farmCoordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  { timestamps: true }
);

export const Farmer = mongoose.model<IFarmer>("Farmer", FarmerSchema);
