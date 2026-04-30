export const CROP_CATEGORIES = [
  { value: "grains", label: "🌾 Grains", emoji: "🌾" },
  { value: "vegetables", label: "🥬 Vegetables", emoji: "🥬" },
  { value: "fruits", label: "🍎 Fruits", emoji: "🍎" },
  { value: "tubers", label: "🥔 Tubers", emoji: "🥔" },
  { value: "legumes", label: "🫘 Legumes", emoji: "🫘" },
  { value: "spices", label: "🌶️ Spices", emoji: "🌶️" },
  { value: "cash-crops", label: "☕ Cash Crops", emoji: "☕" },
  { value: "other", label: "📦 Other", emoji: "📦" },
] as const;

export const UNIT_OPTIONS = [
  "kg",
  "g",
  "lb",
  "oz",
  "bags",
  "sacks",
  "crates",
  "cartons",
  "boxes",
  "baskets",
  "bunches",
  "bundles",
  "trays",
  "pieces",
  "dozens",
  "cobs",
  "pods",
  "stems",
  "tubers",
  "heaps",
  "mudu",
  "paint buckets",
  "jerrycans",
  "bottles",
  "litres",
  "liters",
  "tons",
  "tonnes",
] as const;

export const ORDER_STATUS_LABELS: Record<
  string,
  { label: string; color: string }
> = {
  pending: { label: "Pending", color: "#f59e0b" },
  confirmed: { label: "Confirmed", color: "#3b82f6" },
  "in-transit": { label: "In Transit", color: "#8b5cf6" },
  delivered: { label: "Delivered", color: "#22c55e" },
  cancelled: { label: "Cancelled", color: "#ef4444" },
};

export function formatCurrency(amount: number, _currency = "NGN"): string {
  return `₦${amount.toLocaleString()}`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
}

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { data?: { error?: string } } })
      .response;
    return response?.data?.error || "Something went wrong";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}
