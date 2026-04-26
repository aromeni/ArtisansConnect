import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

// ─── Tailwind class merging ───────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency formatting ──────────────────────────────────────────────────────

/**
 * Format pesewas (integer) to human-readable GHS.
 * e.g. 15000 → "GH₵ 150.00"
 */
export function formatGHS(pesewas: number): string {
  const cedis = pesewas / 100;
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(cedis);
}

/**
 * Convert GHS (decimal string or number) to pesewas integer.
 * e.g. 150.00 → 15000
 */
export function toPesewas(cedis: number | string): number {
  return Math.round(Number(cedis) * 100);
}

/**
 * Compute the platform commission breakdown.
 * All values returned in pesewas.
 */
export function computePaymentBreakdown(grossPesewas: number) {
  const commissionAmount = Math.round(grossPesewas * 0.1);
  const pspFeeAmount = Math.round(grossPesewas * 0.015);
  const netPayoutAmount = grossPesewas - commissionAmount - pspFeeAmount;
  return {
    grossAmount: grossPesewas,
    commissionAmount,
    pspFeeAmount,
    netPayoutAmount,
  };
}

// ─── Date / time formatting ───────────────────────────────────────────────────

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "d MMM yyyy");
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "d MMM yyyy, h:mm a");
}

// ─── Phone formatting ─────────────────────────────────────────────────────────

/**
 * Normalise Ghanaian phone numbers to +233XXXXXXXXX format.
 * Accepts: 0XXXXXXXXX, +233XXXXXXXXX, 233XXXXXXXXX
 */
export function normaliseGhanaPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("233") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return `+233${digits.slice(1)}`;
  }
  if (digits.length === 9) {
    return `+233${digits}`;
  }
  return `+${digits}`;
}

// ─── String utilities ─────────────────────────────────────────────────────────

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export function getPaginationParams(
  searchParams: URLSearchParams,
  defaultPageSize = 20
) {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize") ?? defaultPageSize))
  );
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip, take: pageSize };
}

// ─── URL / file helpers ───────────────────────────────────────────────────────

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function isImageFile(filename: string): boolean {
  return ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(
    getFileExtension(filename)
  );
}

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
