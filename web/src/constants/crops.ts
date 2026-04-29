import type { CropCategory } from "../types";

export const CROP_CATEGORIES: Array<{
  value: CropCategory;
  label: string;
  accent: string;
}> = [
  { value: "grains", label: "Grains", accent: "bg-sun-100 text-sun-800" },
  {
    value: "vegetables",
    label: "Vegetables",
    accent: "bg-leaf-100 text-leaf-800",
  },
  { value: "fruits", label: "Fruits", accent: "bg-rose-100 text-rose-800" },
  { value: "tubers", label: "Tubers", accent: "bg-earth-100 text-earth-800" },
  {
    value: "legumes",
    label: "Legumes",
    accent: "bg-emerald-100 text-emerald-800",
  },
  { value: "spices", label: "Spices", accent: "bg-orange-100 text-orange-800" },
  {
    value: "cash-crops",
    label: "Cash crops",
    accent: "bg-sky-100 text-sky-800",
  },
  { value: "other", label: "Other", accent: "bg-stone-100 text-stone-700" },
];

export const CURRENCY_OPTIONS = ["NGN", "GHS", "KES", "ZAR", "TZS", "UGX"];
export const UNIT_OPTIONS = ["kg", "bags", "crates", "tonnes", "bundles"];
