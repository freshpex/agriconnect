export type Role = "farmer" | "buyer" | "admin";

export type AccountTypeChangeStatus = "pending" | "approved" | "rejected";

export interface AccountTypeChangeRequest {
  requestedRole: "farmer";
  status: AccountTypeChangeStatus;
  note?: string;
  requestedAt?: string;
  reviewedAt?: string;
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

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in-transit"
  | "delivered"
  | "cancelled";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  phone: string;
  role: Role;
  accountTypeChangeRequest?: AccountTypeChangeRequest;
  kycVerified?: boolean;
  simSwapChecked?: boolean;
  numberVerified?: boolean;
  locationVerified?: boolean;
  farmCoordinates?: Coordinates;
  farmAddress?: string;
  profileImage?: string;
  rating?: number;
  totalSales?: number;
  isActive?: boolean;
  lastSeen?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FarmerSummary {
  _id: string;
  id?: string;
  name: string;
  phone: string;
  rating?: number;
  kycVerified?: boolean;
  locationVerified?: boolean;
  farmAddress?: string;
}

export interface Listing {
  _id: string;
  farmer?: FarmerSummary | string;
  cropName: string;
  category: CropCategory;
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
    images?: string[];
    category?: CropCategory;
    farmAddress?: string;
  };
  buyer: FarmerSummary;
  seller: FarmerSummary;
  quantity: number;
  unit: string;
  totalPrice: number;
  currency: string;
  status: OrderStatus;
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

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedListings {
  listings: Listing[];
  pagination: Pagination;
}

export interface PaginatedOrders {
  orders: Order[];
  pagination?: Pagination;
}

export interface PaginatedReports {
  reports: Report[];
  pagination: Pagination;
}

export interface PaginatedUsers {
  users: User[];
  pagination: Pagination;
}

export interface ApiMessage {
  message: string;
}

export type ReportTargetType = "listing" | "order" | "user" | "other";
export type ReportStatus = "open" | "reviewing" | "resolved" | "rejected";

export interface Report {
  _id: string;
  reporter: FarmerSummary;
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

export interface KycMatchResult {
  kycVerified: boolean;
  matches?: {
    name: boolean;
    idDocument: boolean;
    birthdate: boolean;
  };
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
  method?: "network" | "fallback";
}

export interface ListingFilters {
  search?: string;
  category?: CropCategory | "";
  minPrice?: number;
  maxPrice?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface CreateListingInput {
  cropName: string;
  category?: CropCategory;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  currency?: string;
  description?: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
  farmAddress?: string;
  harvestDate?: string;
}

export interface UpdateListingInput {
  cropName?: string;
  category?: CropCategory;
  quantity?: number;
  unit?: string;
  pricePerUnit?: number;
  description?: string;
  active?: boolean;
  farmAddress?: string;
  harvestDate?: string;
}
