import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  listing: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  quantity: number;
  unit: string;
  totalPrice: number;
  currency: string;
  status: "pending" | "confirmed" | "in-transit" | "delivered" | "cancelled";
  qodSessionId?: string;
  buyerPhone: string;
  deliveryAddress?: string;
  notes?: string;
  confirmedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    buyer: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
    seller: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    totalPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "NGN" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in-transit", "delivered", "cancelled"],
      default: "pending",
    },
    qodSessionId: String,
    buyerPhone: { type: String, required: true },
    deliveryAddress: String,
    notes: { type: String, maxlength: 300 },
    confirmedAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

OrderSchema.index({ buyer: 1, status: 1 });
OrderSchema.index({ seller: 1, status: 1 });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
