export type AccountTypeChangeStatus = "pending" | "approved" | "rejected";

export interface AccountTypeChangeRequest {
  requestedRole: "farmer";
  status: AccountTypeChangeStatus;
  note?: string;
  requestedAt?: string;
  reviewedAt?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: "farmer" | "buyer";
  accountTypeChangeRequest?: AccountTypeChangeRequest;
  kycVerified: boolean;
  simSwapChecked: boolean;
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
  lastSeen?: string;
  createdAt: string;
}

export interface Listing {
  _id: string;
  farmer: {
    _id: string;
    name: string;
    phone: string;
    rating: number;
    kycVerified: boolean;
    locationVerified: boolean;
    farmAddress?: string;
  };
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
  harvestDate?: string;
  trustScore?: number;
  trustDecision?: "approve" | "review" | "block";
  reviewStatus?: "pending" | "approved" | "rejected";
  active: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  listing: {
    _id: string;
    cropName: string;
    pricePerUnit: number;
    images: string[];
    category: string;
    farmAddress?: string;
  };
  buyer: { _id: string; name: string; phone: string };
  seller: { _id: string; name: string; phone: string; farmAddress?: string };
  quantity: number;
  unit: string;
  totalPrice: number;
  currency: string;
  status: "pending" | "confirmed" | "in-transit" | "delivered" | "cancelled";
  qodSessionId?: string;
  buyerPhone: string;
  deliveryAddress?: string;
  notes?: string;
  confirmedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  listings: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface KycMatchResult {
  kycVerified: boolean;
  matches: { name: boolean; idDocument: boolean; birthdate: boolean };
  message: string;
}

export interface LocationVerifyResult {
  locationVerified: boolean;
  verificationResult: string;
  matchRate?: number;
  message: string;
}

export interface DeviceStatusResult {
  userId: string;
  reachabilityStatus: string;
  isOnline: boolean;
}

export type ReportTargetType = "listing" | "order" | "user" | "other";
export type ReportStatus = "open" | "reviewing" | "resolved" | "rejected";

export interface Report {
  _id: string;
  reporter: {
    _id: string;
    name: string;
    phone: string;
  };
  targetType: ReportTargetType;
  targetId?: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportCreateInput {
  targetType: ReportTargetType;
  targetId?: string;
  reason: string;
  description?: string;
}

export type CropCategory =
  | "grains"
  | "vegetables"
  | "fruits"
  | "tubers"
  | "legumes"
  | "spices"
  | "cash-crops"
  | "other";
