/**
 * Shared Zod schemas.
 * Used for form validation (client) and server action validation (server).
 * Keep schemas close to their domain but export everything from here.
 */

import { z } from "zod";

// ─── Primitives ───────────────────────────────────────────────────────────────

export const ghanaPhoneSchema = z
  .string()
  .min(9)
  .max(15)
  .regex(/^(\+233|0|233)?[235][0-9]{8}$/, "Enter a valid Ghanaian phone number");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number");

export const positiveIntSchema = z.number().int().positive();

export const pesewasSchema = z
  .number()
  .int()
  .positive("Amount must be greater than 0");

// ─── Auth schemas ─────────────────────────────────────────────────────────────

export const signUpSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: passwordSchema,
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  role: z.enum(["CUSTOMER", "TRADESPERSON"]),
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

// ─── Customer onboarding ──────────────────────────────────────────────────────

export const customerOnboardingSchema = z.object({
  phone: ghanaPhoneSchema,
  region: z.enum([
    "GREATER_ACCRA", "ASHANTI", "WESTERN", "EASTERN", "CENTRAL",
    "VOLTA", "NORTHERN", "UPPER_EAST", "UPPER_WEST", "BRONG_AHAFO",
    "OTI", "AHAFO", "BONO_EAST", "NORTH_EAST", "SAVANNAH", "WESTERN_NORTH",
  ]),
  city: z.string().min(1).max(100).optional(),
  address: z.string().max(300).optional(),
});

// ─── Tradesperson onboarding ─────────────────────────────────────────────────

export const tradespersonOnboardingStep1Schema = z.object({
  businessName: z.string().max(200).optional(),
  phone: ghanaPhoneSchema,
  bio: z.string().min(50, "Bio must be at least 50 characters").max(1000),
  yearsOfExperience: z.number().int().min(0).max(60),
  categoryIds: z.array(z.string().cuid()).min(1, "Select at least one trade category"),
  primaryCategoryId: z.string().cuid(),
  serviceRegions: z
    .array(z.enum([
      "GREATER_ACCRA", "ASHANTI", "WESTERN", "EASTERN", "CENTRAL",
      "VOLTA", "NORTHERN", "UPPER_EAST", "UPPER_WEST", "BRONG_AHAFO",
      "OTI", "AHAFO", "BONO_EAST", "NORTH_EAST", "SAVANNAH", "WESTERN_NORTH",
    ]))
    .min(1, "Select at least one service region"),
});

export const tradespersonOnboardingStep2Schema = z.object({
  ghanaCardNumber: z
    .string()
    .regex(/^GHA-[0-9]{9}-[0-9]$/, "Enter a valid Ghana Card number (GHA-XXXXXXXXX-X)"),
  ghanaCardName: z.string().min(2).max(200),
  // Document public IDs come from Cloudinary upload — validated as non-empty strings
  ghanaCardFrontPublicId: z.string().min(1, "Ghana Card front image is required"),
  selfiePublicId: z.string().min(1, "Selfie photo is required"),
});

// ─── Job posting ──────────────────────────────────────────────────────────────

export const createJobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z
    .string()
    .min(30, "Description must be at least 30 characters")
    .max(5000),
  categoryId: z.string().cuid("Select a valid category"),
  region: z.enum([
    "GREATER_ACCRA", "ASHANTI", "WESTERN", "EASTERN", "CENTRAL",
    "VOLTA", "NORTHERN", "UPPER_EAST", "UPPER_WEST", "BRONG_AHAFO",
    "OTI", "AHAFO", "BONO_EAST", "NORTH_EAST", "SAVANNAH", "WESTERN_NORTH",
  ]),
  city: z.string().max(100).optional(),
  address: z.string().max(300).optional(),
  budgetType: z.enum(["FIXED", "RANGE", "REQUEST_QUOTE"]),
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().optional(),
  urgency: z.enum(["FLEXIBLE", "WITHIN_A_WEEK", "WITHIN_A_MONTH", "URGENT"]).default("FLEXIBLE"),
  propertyType: z.enum(["HOUSE", "APARTMENT", "COMMERCIAL", "LAND", "OTHER"]).optional(),
  desiredStartDate: z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
  imagePublicIds: z.array(z.string()).max(5).default([]),
}).refine((data) => {
  if (data.budgetType === "FIXED" && !data.budgetMin) return false;
  if (data.budgetType === "RANGE" && (!data.budgetMin || !data.budgetMax)) return false;
  return true;
}, {
  message: "Budget details are required for the selected budget type",
  path: ["budgetMin"],
});

// ─── Job interest / proposal ─────────────────────────────────────────────────

export const submitInterestSchema = z.object({
  jobId: z.string().cuid(),
  coverLetter: z
    .string()
    .min(30, "Cover letter must be at least 30 characters")
    .max(2000),
  estimatedCostPesewas: z.number().int().positive().optional(),
  estimatedDuration: z.string().max(100).optional(),
  availableFrom: z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
});

// ─── Dispute ──────────────────────────────────────────────────────────────────

export const createDisputeSchema = z.object({
  jobId: z.string().cuid(),
  reason: z.enum([
    "POOR_WORKMANSHIP",
    "INCOMPLETE_WORK",
    "PAYMENT_DISAGREEMENT",
    "NO_SHOW",
    "DAMAGE",
    "MISLEADING_DESCRIPTION",
    "ABUSIVE_BEHAVIOUR",
    "OTHER",
  ]),
  description: z
    .string()
    .min(50, "Please describe the issue in at least 50 characters")
    .max(3000),
  evidencePublicIds: z.array(z.string()).max(10).default([]),
});

// ─── Review ───────────────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  jobId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

// ─── Admin actions ────────────────────────────────────────────────────────────

export const verificationDecisionSchema = z.object({
  tradespersonId: z.string().cuid(),
  decision: z.enum(["VERIFIED", "REJECTED", "REQUIRES_REVIEW"]),
  notes: z.string().max(500).optional(),
});

export const resolveDisputeSchema = z.object({
  disputeId: z.string().cuid(),
  status: z.enum([
    "RESOLVED_CUSTOMER_FAVOUR",
    "RESOLVED_TRADESPERSON_FAVOUR",
    "PARTIALLY_RESOLVED",
  ]),
  resolution: z.string().min(20, "Resolution notes are required").max(3000),
});

export const addAdminNoteSchema = z.object({
  content: z.string().min(1).max(2000),
  jobId: z.string().cuid().optional(),
  disputeId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
});
