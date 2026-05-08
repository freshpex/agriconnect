import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { Order } from "../models/Order";
import { Listing } from "../models/Listing";
import { createQodSession } from "../services/nac";

/**
 * Place a new order for a listing.
 * Uses atomic findOneAndUpdate to prevent overselling under concurrency.
 */
export const createOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { listingId, quantity, deliveryAddress, notes, clientRequestId } =
    req.body;

  if (clientRequestId) {
    const existingOrder = await Order.findOne({
      buyer: req.user!.id,
      clientRequestId,
    })
      .populate("listing", "cropName pricePerUnit images category farmAddress")
      .populate("buyer", "name phone")
      .populate("seller", "name phone farmAddress")
      .lean();

    if (existingOrder) {
      res.json({ order: existingOrder });
      return;
    }
  }

  const listing = await Listing.findById(listingId);
  if (!listing) throw new ApiError("Listing not found", 404);
  if (!listing.active) throw new ApiError("Listing is no longer active", 400);
  if (listing.farmer.toString() === req.user!.id) {
    throw new ApiError("Cannot order your own listing", 400);
  }

  // Atomic stock reduction — prevents overselling under concurrent requests
  const updated = await Listing.findOneAndUpdate(
    {
      _id: listingId,
      active: true,
      quantity: { $gte: quantity },
    },
    {
      $inc: { quantity: -quantity },
    },
    { new: true }
  );

  if (!updated) {
    throw new ApiError("Requested quantity exceeds available stock", 400);
  }

  // Deactivate listing if stock is now zero
  if (updated.quantity <= 0) {
    updated.active = false;
    await updated.save();
  }

  const totalPrice = quantity * listing.pricePerUnit;

  // Boost network quality for the transaction
  let qodSessionId: string | undefined;
  try {
    const session = await createQodSession(req.user!.phone, 300);
    qodSessionId = session.sessionId;
  } catch {
    console.warn("QoD session creation failed, proceeding without boost");
  }

  const order = await Order.create({
    listing: listing._id,
    buyer: req.user!.id,
    seller: listing.farmer,
    quantity,
    unit: listing.unit,
    totalPrice,
    currency: listing.currency,
    buyerPhone: req.user!.phone,
    deliveryAddress,
    notes,
    clientRequestId,
    qodSessionId,
  });

  const populated = await Order.findById(order._id)
    .populate("listing", "cropName pricePerUnit images category farmAddress")
    .populate("buyer", "name phone")
    .populate("seller", "name phone farmAddress")
    .lean();

  res.status(201).json({ order: populated });
};

/**
 * Get orders for the logged-in user (buyer OR seller) with pagination.
 */
export const getMyOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { role, status, page = "1", limit = "20" } = req.query;

  const filter: Record<string, unknown> = {};

  if (role === "seller") {
    filter.seller = req.user!.id;
  } else {
    filter.buyer = req.user!.id;
  }

  if (status) {
    filter.status = status;
  }

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("listing", "cropName pricePerUnit images category")
      .populate("buyer", "name phone")
      .populate("seller", "name phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.json({
    orders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
};

/**
 * Get a single order by ID (buyer or seller only).
 */
export const getOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const order = await Order.findById(req.params.id)
    .populate("listing", "cropName pricePerUnit images category farmAddress")
    .populate("buyer", "name phone")
    .populate("seller", "name phone farmAddress")
    .lean();

  if (!order) throw new ApiError("Order not found", 404);

  const userId = req.user!.id;
  if (
    order.buyer._id.toString() !== userId &&
    order.seller._id.toString() !== userId
  ) {
    throw new ApiError("Not authorized to view this order", 403);
  }

  res.json({ order });
};

/**
 * Update order status (seller can confirm/dispatch, buyer can mark delivered).
 */
export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError("Order not found", 404);

  const userId = req.user!.id;
  const isSeller = order.seller.toString() === userId;
  const isBuyer = order.buyer.toString() === userId;
  const { status } = req.body;

  // Validate status transitions
  if (status === "confirmed" && isSeller && order.status === "pending") {
    order.status = "confirmed";
    order.confirmedAt = new Date();
  } else if (
    status === "in-transit" &&
    isSeller &&
    order.status === "confirmed"
  ) {
    order.status = "in-transit";
  } else if (
    status === "delivered" &&
    isBuyer &&
    order.status === "in-transit"
  ) {
    order.status = "delivered";
    order.deliveredAt = new Date();
  } else if (
    status === "cancelled" &&
    (isSeller || isBuyer) &&
    ["pending", "confirmed"].includes(order.status)
  ) {
    order.status = "cancelled";

    // Restore listing stock atomically on cancellation
    await Listing.findByIdAndUpdate(order.listing, {
      $inc: { quantity: order.quantity },
      $set: { active: true },
    });
  } else {
    throw new ApiError("Invalid status transition", 400);
  }

  await order.save();

  const populated = await Order.findById(order._id)
    .populate("listing", "cropName pricePerUnit images category farmAddress")
    .populate("buyer", "name phone")
    .populate("seller", "name phone farmAddress")
    .lean();

  res.json({ order: populated });
};
