/**
 * Tradesperson query helpers.
 */

import { db } from "@/lib/db";
import type { GhanaRegion, VerificationStatus } from "@prisma/client";

const TRADESPERSON_CARD_SELECT = {
  id: true,
  businessName: true,
  bio: true,
  yearsOfExperience: true,
  verificationStatus: true,
  averageRating: true,
  totalReviews: true,
  totalJobsCompleted: true,
  user: {
    select: { id: true, name: true, image: true },
  },
  categories: {
    select: {
      isPrimary: true,
      category: { select: { id: true, name: true, slug: true, icon: true } },
    },
  },
  serviceAreas: { select: { region: true } },
  portfolioImages: {
    select: { id: true, url: true, caption: true },
    take: 4,
    orderBy: { sortOrder: "asc" as const },
  },
} as const;

export async function getTradespersonByUserId(userId: string) {
  return db.tradespersonProfile.findUnique({
    where: { userId },
    select: {
      ...TRADESPERSON_CARD_SELECT,
      phone: true,
      onboardingStatus: true,
      ghanaCardName: true,
      payoutAccountNumber: true,
      payoutAccountName: true,
      qualifications: {
        select: {
          id: true,
          type: true,
          title: true,
          issuingBody: true,
          issueDate: true,
          expiryDate: true,
        },
        orderBy: { createdAt: "desc" as const },
      },
    },
  });
}

export async function getTradespersonById(id: string) {
  return db.tradespersonProfile.findUnique({
    where: { id },
    select: TRADESPERSON_CARD_SELECT,
  });
}

export async function listTradespeople({
  categorySlug,
  region,
  verificationStatus,
  page = 1,
  pageSize = 20,
}: {
  categorySlug?: string;
  region?: GhanaRegion;
  verificationStatus?: VerificationStatus;
  page?: number;
  pageSize?: number;
}) {
  const skip = (page - 1) * pageSize;

  const where = {
    onboardingStatus: "APPROVED" as const,
    user: { suspended: false },
    ...(verificationStatus && { verificationStatus }),
    ...(region && {
      serviceAreas: { some: { region } },
    }),
    ...(categorySlug && {
      categories: { some: { category: { slug: categorySlug } } },
    }),
  };

  const [tradespeople, total] = await Promise.all([
    db.tradespersonProfile.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: [
        { averageRating: "desc" as const },
        { totalReviews: "desc" as const },
      ],
      select: TRADESPERSON_CARD_SELECT,
    }),
    db.tradespersonProfile.count({ where }),
  ]);

  return {
    tradespeople,
    total,
    page,
    pageSize,
    hasMore: skip + tradespeople.length < total,
  };
}

export async function listPendingVerifications(page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;
  const where = { verificationStatus: "PENDING" as VerificationStatus };

  const [profiles, total] = await Promise.all([
    db.tradespersonProfile.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        ghanaCardNumber: true,
        ghanaCardName: true,
        onboardingStatus: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true, image: true } },
        verificationDocuments: {
          select: { id: true, documentType: true, publicId: true, uploadedAt: true },
          orderBy: { uploadedAt: "desc" as const },
        },
      },
    }),
    db.tradespersonProfile.count({ where }),
  ]);

  return { profiles, total, page, pageSize, hasMore: skip + profiles.length < total };
}

export async function getTradespersonReviews(tradespersonId: string, page = 1) {
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where: { tradespersonId, isPublic: true, isModerated: false },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        reviewer: { select: { name: true, image: true } },
        job: { select: { title: true, category: { select: { name: true } } } },
      },
    }),
    db.review.count({ where: { tradespersonId, isPublic: true, isModerated: false } }),
  ]);

  return { reviews, total, page, pageSize, hasMore: skip + reviews.length < total };
}
