import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IFarmer extends Document {
  name: string;
  phone: string;
  password: string;
  role: "farmer" | "buyer";
  accountTypeChangeRequest?: {
    requestedRole: "farmer";
    status: "pending" | "approved" | "rejected";
    note?: string;
    requestedAt: Date;
    reviewedAt?: Date;
  };
  kycVerified: boolean;
  kycData?: {
    nationalId: string;
    fullName: string;
    dateOfBirth: string;
    verifiedAt: Date;
  };
  simSwapChecked: boolean;
  simSwapLastCheck?: Date;
  numberVerified: boolean;
  locationVerified: boolean;
  farmCoordinates?: {
    latitude: number;
    longitude: number;
  };
  farmAddress?: string;
  profileImage?: string;
  rating: number;
  totalSales: number;
  isActive: boolean;
  lastSeen?: Date;
  deviceInfo?: {
    phoneNumber: string;
    networkAccessId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const FarmerSchema = new Schema<IFarmer>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["farmer", "buyer"], default: "farmer" },
    accountTypeChangeRequest: {
      requestedRole: { type: String, enum: ["farmer"] },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
      },
      note: { type: String, trim: true, maxlength: 500 },
      requestedAt: Date,
      reviewedAt: Date,
    },
    kycVerified: { type: Boolean, default: false },
    kycData: {
      nationalId: String,
      fullName: String,
      dateOfBirth: String,
      verifiedAt: Date,
    },
    simSwapChecked: { type: Boolean, default: false },
    simSwapLastCheck: Date,
    numberVerified: { type: Boolean, default: false },
    locationVerified: { type: Boolean, default: false },
    farmCoordinates: {
      latitude: Number,
      longitude: Number,
    },
    farmAddress: String,
    profileImage: String,
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalSales: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    lastSeen: Date,
    deviceInfo: {
      phoneNumber: String,
      networkAccessId: String,
    },
  },
  { timestamps: true }
);

FarmerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

FarmerSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Farmer = mongoose.model<IFarmer>("Farmer", FarmerSchema);
