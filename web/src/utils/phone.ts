import type { Country } from "../constants/countries";

export function normalizeLocalNumber(input: string): string {
  const digits = input.replace(/\D/g, "");
  return digits.startsWith("0") ? digits.slice(1) : digits;
}

export function buildFullPhone(country: Country, localNumber: string): string {
  return `${country.dial}${normalizeLocalNumber(localNumber)}`;
}

export function validatePhone(
  country: Country,
  localNumber: string
): string | null {
  const normalized = normalizeLocalNumber(localNumber);
  if (!normalized) return "Phone number is required";
  if (
    normalized.length < country.minLength - 1 ||
    normalized.length > country.maxLength
  ) {
    return `Enter ${country.minLength - 1}-${country.maxLength} digits for ${country.name}`;
  }
  return null;
}
