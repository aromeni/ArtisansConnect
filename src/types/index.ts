/**
 * BuildersConnect — Shared TypeScript Types
 *
 * These types are shared across client and server.
 * Domain-specific types live closer to their modules.
 */

// ─── User & Auth ─────────────────────────────────────────────────────────────

export type UserRole = "CUSTOMER" | "TRADESPERSON" | "ADMIN" | "SUPER_ADMIN";

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED" | "REQUIRES_REVIEW";

export type OnboardingStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  onboardingComplete: boolean;
  verificationStatus?: VerificationStatus;
}

// ─── Job ─────────────────────────────────────────────────────────────────────

export type JobStatus =
  | "DRAFT"
  | "OPEN"
  | "MATCHED"
  | "SHORTLISTED"
  | "HIRED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED"
  | "CLOSED";

export type BudgetType = "FIXED" | "RANGE" | "REQUEST_QUOTE";

export type UrgencyLevel = "FLEXIBLE" | "WITHIN_A_WEEK" | "WITHIN_A_MONTH" | "URGENT";

export type PropertyType =
  | "HOUSE"
  | "APARTMENT"
  | "COMMERCIAL"
  | "LAND"
  | "OTHER";

// ─── Interest / Application ───────────────────────────────────────────────────

export type InterestStatus =
  | "PENDING"
  | "SHORTLISTED"
  | "HIRED"
  | "DECLINED"
  | "WITHDRAWN";

// ─── Hire / Job Execution ─────────────────────────────────────────────────────

export type HireStatus =
  | "AWAITING_PAYMENT"
  | "FUNDED"
  | "IN_PROGRESS"
  | "SUBMITTED_COMPLETE"
  | "COMPLETED"
  | "DISPUTED"
  | "REFUNDED"
  | "CLOSED";

// ─── Payment ──────────────────────────────────────────────────────────────────

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "HELD"
  | "RELEASED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "FAILED";

export type PayoutStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type RefundStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface PaymentBreakdown {
  /** Amount in pesewas */
  grossAmount: number;
  /** 10% platform commission */
  commissionAmount: number;
  /** PSP fees (estimated 1.5%) */
  pspFeeAmount: number;
  /** Net amount to tradesperson */
  netPayoutAmount: number;
}

// ─── Dispute ──────────────────────────────────────────────────────────────────

export type DisputeReason =
  | "POOR_WORKMANSHIP"
  | "INCOMPLETE_WORK"
  | "PAYMENT_DISAGREEMENT"
  | "NO_SHOW"
  | "DAMAGE"
  | "MISLEADING_DESCRIPTION"
  | "ABUSIVE_BEHAVIOUR"
  | "OTHER";

export type DisputeStatus =
  | "OPEN"
  | "AWAITING_EVIDENCE"
  | "UNDER_REVIEW"
  | "RESOLVED_CUSTOMER_FAVOUR"
  | "RESOLVED_TRADESPERSON_FAVOUR"
  | "PARTIALLY_RESOLVED"
  | "CLOSED";

export type DisputeRaisedBy = "CUSTOMER" | "TRADESPERSON";

// ─── Review ───────────────────────────────────────────────────────────────────

export type ReviewerType = "CUSTOMER" | "TRADESPERSON";

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType =
  | "JOB_INTEREST_RECEIVED"
  | "JOB_SHORTLISTED"
  | "JOB_HIRED"
  | "JOB_FUNDED"
  | "JOB_COMPLETED"
  | "JOB_CANCELLED"
  | "DISPUTE_OPENED"
  | "DISPUTE_RESOLVED"
  | "MESSAGE_RECEIVED"
  | "PAYMENT_RECEIVED"
  | "PAYOUT_SENT"
  | "VERIFICATION_APPROVED"
  | "VERIFICATION_REJECTED"
  | "REVIEW_RECEIVED"
  | "ACCOUNT_SUSPENDED";

// ─── Verification ─────────────────────────────────────────────────────────────

export type DocumentType =
  | "GHANA_CARD_FRONT"
  | "GHANA_CARD_BACK"
  | "SELFIE"
  | "QUALIFICATION"
  | "CERTIFICATION"
  | "LICENCE"
  | "OTHER";

// ─── Ghana-specific ───────────────────────────────────────────────────────────

export const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Eastern",
  "Central",
  "Volta",
  "Northern",
  "Upper East",
  "Upper West",
  "Brong-Ahafo",
  "Oti",
  "Ahafo",
  "Bono East",
  "North East",
  "Savannah",
  "Western North",
] as const;

export type GhanaRegion = (typeof GHANA_REGIONS)[number];

// ─── API Response Shapes ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export type UploadFolder =
  | "profiles"
  | "ids"
  | "qualifications"
  | "portfolio"
  | "jobs"
  | "disputes"
  | "chat";

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  isPrivate: boolean;
  width?: number;
  height?: number;
  format: string;
  bytes: number;
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export type AuditAction =
  | "USER_CREATED"
  | "USER_SUSPENDED"
  | "USER_RESTORED"
  | "VERIFICATION_APPROVED"
  | "VERIFICATION_REJECTED"
  | "JOB_MODERATED"
  | "JOB_REMOVED"
  | "DISPUTE_RESOLVED"
  | "PAYMENT_RELEASED"
  | "REFUND_ISSUED"
  | "ADMIN_NOTE_ADDED";
