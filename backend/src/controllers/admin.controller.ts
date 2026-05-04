import type { FilterQuery } from "mongoose";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { ApiError } from "../middleware/errorHandler";
import { Farmer, IFarmer } from "../models/Farmer";

type UserRole = IFarmer["role"];
type FarmerAccessReviewStatus = "approved" | "rejected";
type AccountTypeChangeStatus = "pending" | "approved" | "rejected";

function isUserRole(value: unknown): value is UserRole {
  return value === "farmer" || value === "buyer" || value === "admin";
}

function isAccountTypeChangeStatus(
  value: unknown
): value is AccountTypeChangeStatus {
  return value === "pending" || value === "approved" || value === "rejected";
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializeUser(user: IFarmer) {
  const normalizedId = user._id.toString();
  return {
    id: normalizedId,
    _id: normalizedId,
    name: user.name,
    phone: user.phone,
    role: user.role,
    accountTypeChangeRequest: user.accountTypeChangeRequest,
    kycVerified: user.kycVerified,
    simSwapChecked: user.simSwapChecked,
    numberVerified: user.numberVerified,
    locationVerified: user.locationVerified,
    farmAddress: user.farmAddress,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastSeen: user.lastSeen,
  };
}

export const getUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { role, requestStatus, search, page = "1", limit = "20" } = req.query;

  const filter: FilterQuery<IFarmer> = {};

  if (isUserRole(role)) {
    filter.role = role;
  }

  if (isAccountTypeChangeStatus(requestStatus)) {
    filter["accountTypeChangeRequest.status"] = requestStatus;
  }

  if (typeof search === "string" && search.trim()) {
    const normalizedSearch = search.trim();
    const safeSearchPattern = escapeRegex(normalizedSearch);
    const matcher = new RegExp(safeSearchPattern, "i");
    filter.$or = [{ name: matcher }, { phone: matcher }];
  }

  const pageNum = Math.max(1, Number.parseInt(String(page), 10) || 1);
  const limitNum = Math.min(
    50,
    Math.max(1, Number.parseInt(String(limit), 10) || 20)
  );
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    Farmer.find(filter)
      .select(
        "name phone role accountTypeChangeRequest kycVerified simSwapChecked numberVerified locationVerified isActive farmAddress createdAt lastSeen"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Farmer.countDocuments(filter),
  ]);

  const normalizedUsers = users.map((user) => {
    const normalizedId = String(user._id);
    return {
      ...user,
      _id: normalizedId,
      id: normalizedId,
    };
  });

  res.json({
    users: normalizedUsers,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
};

export const updateUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { role, isActive } = req.body as {
    role?: UserRole;
    isActive?: boolean;
  };

  const currentUserId = req.user?.id;
  if (currentUserId && id === currentUserId) {
    if (role && role !== "admin") {
      throw new ApiError("You cannot remove your own admin role", 400);
    }
    if (isActive === false) {
      throw new ApiError("You cannot deactivate your own account", 400);
    }
  }

  const user = await Farmer.findById(id);
  if (!user) throw new ApiError("User not found", 404);

  if (role) {
    user.role = role;

    if (role === "farmer" && user.accountTypeChangeRequest?.status === "pending") {
      user.accountTypeChangeRequest.status = "approved";
      user.accountTypeChangeRequest.reviewedAt = new Date();
    }
  }

  if (typeof isActive === "boolean") {
    user.isActive = isActive;
  }

  await user.save();

  res.json({ user: serializeUser(user) });
};

export const reviewFarmerAccessRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { status, note } = req.body as {
    status: FarmerAccessReviewStatus;
    note?: string;
  };

  const user = await Farmer.findById(id);
  if (!user) throw new ApiError("User not found", 404);

  if (user.role === "admin") {
    throw new ApiError("Admin accounts cannot request farmer access", 400);
  }

  if (!user.accountTypeChangeRequest || user.accountTypeChangeRequest.status !== "pending") {
    throw new ApiError("No pending farmer access request for this user", 400);
  }

  const trimmedNote = typeof note === "string" ? note.trim().slice(0, 500) : "";

  user.accountTypeChangeRequest.status = status;
  user.accountTypeChangeRequest.reviewedAt = new Date();
  if (trimmedNote) {
    user.accountTypeChangeRequest.note = trimmedNote;
  }

  if (status === "approved") {
    user.role = "farmer";
  }

  await user.save();

  res.json({ user: serializeUser(user) });
};
