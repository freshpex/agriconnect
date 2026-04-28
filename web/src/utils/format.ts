import type { CropCategory, FarmerSummary, Listing } from "../types";
import { CROP_CATEGORIES } from "../constants/crops";

export function formatCurrency(amount: number, currency = "NGN"): string {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatDate(value?: string): string {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function timeAgo(value: string): string {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

export function getCategoryLabel(category?: CropCategory): string {
  return (
    CROP_CATEGORIES.find((item) => item.value === category)?.label || "Other"
  );
}

export function getFarmer(listing: Listing): FarmerSummary | null {
  return typeof listing.farmer === "object" && listing.farmer !== null
    ? listing.farmer
    : null;
}

export function initials(name?: string): string {
  if (!name) return "AC";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getApiError(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = error as {
      response?: { data?: { error?: string; message?: string } };
    };
    return (
      response.response?.data?.error ||
      response.response?.data?.message ||
      "Something went wrong"
    );
  }

  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
