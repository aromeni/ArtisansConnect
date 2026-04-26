"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  customerOnboardingSchema,
  tradespersonOnboardingStep1Schema,
  tradespersonOnboardingStep2Schema,
} from "@/lib/validation/schemas";
import { z } from "zod";

type ActionResult = { error: string } | { success: true };

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  return session;
}

// ─── Customer Onboarding ──────────────────────────────────────────────────────

export async function completeCustomerOnboarding(
  rawData: z.infer<typeof customerOnboardingSchema>
): Promise<ActionResult> {
  const session = await requireAuth();

  if (session.user.role !== "CUSTOMER") {
    return { error: "Only customers can use this form." };
  }

  const parsed = customerOnboardingSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { phone, region, city, address } = parsed.data;

  try {
    await db.$transaction([
      db.customerProfile.update({
        where: { userId: session.user.id },
        data: { phone, region, city, address },
      }),
      db.user.update({
        where: { id: session.user.id },
        data: { onboardingComplete: true },
      }),
    ]);
  } catch {
    return { error: "Could not save your profile. Please try again." };
  }

  redirect("/customer/dashboard");
}

// ─── Tradesperson Step 1 — Profile details ────────────────────────────────────

export async function saveTradespersonProfile(
  rawData: z.infer<typeof tradespersonOnboardingStep1Schema>
): Promise<ActionResult> {
  const session = await requireAuth();

  if (session.user.role !== "TRADESPERSON") {
    return { error: "Only tradespeople can use this form." };
  }

  const parsed = tradespersonOnboardingStep1Schema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const {
    businessName,
    phone,
    bio,
    yearsOfExperience,
    categoryIds,
    primaryCategoryId,
    serviceRegions,
  } = parsed.data;

  // Verify all category IDs exist
  const categories = await db.tradeCategory.findMany({
    where: { id: { in: categoryIds }, isActive: true },
    select: { id: true },
  });
  if (categories.length !== categoryIds.length) {
    return { error: "One or more selected categories are invalid." };
  }

  try {
    const profile = await db.tradespersonProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) return { error: "Profile not found. Please contact support." };

    await db.$transaction([
      // Update core profile
      db.tradespersonProfile.update({
        where: { id: profile.id },
        data: {
          businessName: businessName ?? null,
          phone,
          bio,
          yearsOfExperience,
          onboardingStatus: "DRAFT",
        },
      }),
      // Replace categories
      db.tradespersonCategory.deleteMany({ where: { tradespersonId: profile.id } }),
      db.tradespersonCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          tradespersonId: profile.id,
          categoryId,
          isPrimary: categoryId === primaryCategoryId,
        })),
      }),
      // Replace service areas
      db.tradespersonServiceArea.deleteMany({ where: { tradespersonId: profile.id } }),
      db.tradespersonServiceArea.createMany({
        data: serviceRegions.map((region) => ({
          tradespersonId: profile.id,
          region,
        })),
      }),
    ]);
  } catch {
    return { error: "Could not save profile. Please try again." };
  }

  return { success: true };
}

// ─── Tradesperson Step 2 — Identity verification ──────────────────────────────

export async function submitTradespersonVerification(
  rawData: z.infer<typeof tradespersonOnboardingStep2Schema>
): Promise<ActionResult> {
  const session = await requireAuth();

  if (session.user.role !== "TRADESPERSON") {
    return { error: "Only tradespeople can use this form." };
  }

  const parsed = tradespersonOnboardingStep2Schema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { ghanaCardNumber, ghanaCardName, ghanaCardFrontPublicId, selfiePublicId } =
    parsed.data;

  try {
    const profile = await db.tradespersonProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, onboardingStatus: true },
    });

    if (!profile) return { error: "Profile not found." };

    // Prevent re-submission if already approved
    if (profile.onboardingStatus === "APPROVED") {
      return { error: "Your profile is already approved." };
    }

    await db.$transaction([
      // Save Ghana Card details
      db.tradespersonProfile.update({
        where: { id: profile.id },
        data: {
          ghanaCardNumber,
          ghanaCardName,
          verificationStatus: "PENDING",
          onboardingStatus: "SUBMITTED",
        },
      }),
      // Remove old verification documents if re-submitting
      db.verificationDocument.deleteMany({
        where: { tradespersonId: profile.id },
      }),
      // Create Ghana Card document record
      db.verificationDocument.create({
        data: {
          tradespersonId: profile.id,
          documentType: "GHANA_CARD_FRONT",
          publicId: ghanaCardFrontPublicId,
          url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/private/${ghanaCardFrontPublicId}`,
        },
      }),
      // Create selfie document record
      db.verificationDocument.create({
        data: {
          tradespersonId: profile.id,
          documentType: "SELFIE",
          publicId: selfiePublicId,
          url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/private/${selfiePublicId}`,
        },
      }),
      // Mark onboarding complete
      db.user.update({
        where: { id: session.user.id },
        data: { onboardingComplete: true },
      }),
    ]);
  } catch {
    return { error: "Could not submit verification. Please try again." };
  }

  redirect("/tradesperson/dashboard");
}

// ─── Onboarding document upload sign ─────────────────────────────────────────
// Dedicated signing for tradesperson's own ID documents during onboarding.
// Called client-side before uploading to Cloudinary.

export async function getOnboardingUploadSignature(folder: "ids" | "profiles") {
  const session = await requireAuth();

  if (session.user.role !== "TRADESPERSON" && folder === "ids") {
    return { error: "Unauthorized" };
  }

  const { generateSignedUploadParams } = await import("@/lib/storage/cloudinary");

  try {
    const params = await generateSignedUploadParams(folder, {
      maxBytes: 10 * 1024 * 1024,
      allowedFormats: ["jpg", "jpeg", "png", "webp"],
    });
    return { success: true, params };
  } catch {
    return { error: "Could not generate upload signature." };
  }
}
