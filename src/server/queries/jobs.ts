/**
 * Job query helpers.
 */

import { db } from "@/lib/db";
import type { JobStatus, GhanaRegion, UrgencyLevel } from "@prisma/client";

// Public job card — used for browse listings
const JOB_CARD_SELECT = {
  id: true,
  title: true,
  description: true,
  region: true,
  city: true,
  budgetType: true,
  budgetMin: true,
  budgetMax: true,
  urgency: true,
  status: true,
  interestCount: true,
  createdAt: true,
  publishedAt: true,
  category: { select: { id: true, name: true, slug: true, icon: true, color: true } },
  images: { select: { url: true }, take: 1, orderBy: { sortOrder: "asc" as const } },
  customer: {
    select: {
      region: true,
      city: true,
      user: { select: { name: true } },
    },
  },
} as const;

// Full job detail — used for job detail page
const JOB_DETAIL_SELECT = {
  ...JOB_CARD_SELECT,
  address: true,
  propertyType: true,
  desiredStartDate: true,
  viewCount: true,
  images: {
    select: { id: true, url: true, publicId: true, caption: true, sortOrder: true },
    orderBy: { sortOrder: "asc" as const },
  },
} as const;

export async function getJobById(id: string) {
  return db.job.findUnique({
    where: { id },
    select: JOB_DETAIL_SELECT,
  });
}

export async function listOpenJobs({
  categorySlug,
  region,
  urgency,
  page = 1,
  pageSize = 20,
}: {
  categorySlug?: string;
  region?: GhanaRegion;
  urgency?: string;
  page?: number;
  pageSize?: number;
}) {
  const skip = (page - 1) * pageSize;

  const where = {
    status: "OPEN" as const,
    ...(region && { region: region as GhanaRegion }),
    ...(urgency && { urgency: urgency as UrgencyLevel }),
    ...(categorySlug && {
      category: { slug: categorySlug },
    }),
  };

  const [jobs, total] = await Promise.all([
    db.job.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: [{ urgency: "asc" as const }, { publishedAt: "desc" as const }],
      select: JOB_CARD_SELECT,
    }),
    db.job.count({ where }),
  ]);

  return { jobs, total, page, pageSize, hasMore: skip + jobs.length < total };
}

export async function getJobsByCustomer(customerId: string, status?: JobStatus | null) {
  return db.job.findMany({
    where: {
      customerId,
      ...(status && { status }),
    },
    orderBy: { updatedAt: "desc" },
    select: {
      ...JOB_CARD_SELECT,
      status: true,
      hire: {
        select: {
          id: true,
          status: true,
          agreedAmountPesewas: true,
          tradesperson: {
            select: {
              user: { select: { name: true, image: true } },
              verificationStatus: true,
            },
          },
        },
      },
    },
  });
}

export async function getJobInterests(jobId: string) {
  return db.jobInterest.findMany({
    where: { jobId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      coverLetter: true,
      estimatedCostPesewas: true,
      estimatedDuration: true,
      availableFrom: true,
      status: true,
      createdAt: true,
      tradesperson: {
        select: {
          id: true,
          businessName: true,
          bio: true,
          yearsOfExperience: true,
          verificationStatus: true,
          averageRating: true,
          totalReviews: true,
          totalJobsCompleted: true,
          user: { select: { name: true, image: true } },
          categories: {
            select: { category: { select: { name: true } }, isPrimary: true },
          },
          serviceAreas: { select: { region: true } },
          portfolioImages: {
            select: { url: true },
            take: 3,
            orderBy: { sortOrder: "asc" as const },
          },
        },
      },
    },
  });
}

// Tradesperson job board — jobs matching TP's categories + regions
export async function listOpenJobsForTradesperson(
  tradespersonProfileId: string,
  {
    page = 1,
    pageSize = 20,
    categoryId,
    region,
  }: {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    region?: GhanaRegion;
  }
) {
  const skip = (page - 1) * pageSize;

  const tpProfile = await db.tradespersonProfile.findUnique({
    where: { id: tradespersonProfileId },
    select: {
      categories: { select: { categoryId: true } },
      serviceAreas: { select: { region: true } },
    },
  });

  const myCategoryIds = tpProfile?.categories.map((c) => c.categoryId) ?? [];
  const myRegions = tpProfile?.serviceAreas.map((a) => a.region) ?? [];

  const where = {
    status: "OPEN" as const,
    ...(categoryId ? { categoryId } : { categoryId: { in: myCategoryIds } }),
    ...(region ? { region } : { region: { in: myRegions } }),
  };

  const [jobs, total] = await Promise.all([
    db.job.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: [{ urgency: "asc" as const }, { publishedAt: "desc" as const }],
      select: {
        ...JOB_CARD_SELECT,
        interests: {
          where: { tradespersonId: tradespersonProfileId },
          select: { id: true, status: true },
        },
      },
    }),
    db.job.count({ where }),
  ]);

  return { jobs, total, page, pageSize, hasMore: skip + jobs.length < total };
}

// Interest/application list for a tradesperson
export async function getTradespersonInterests(tradespersonProfileId: string) {
  return db.jobInterest.findMany({
    where: { tradespersonId: tradespersonProfileId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      status: true,
      estimatedCostPesewas: true,
      createdAt: true,
      updatedAt: true,
      job: {
        select: {
          ...JOB_CARD_SELECT,
          status: true,
          hire: {
            select: { id: true, status: true, agreedAmountPesewas: true },
          },
        },
      },
    },
  });
}

// Single interest by tradesperson for a job
export async function getInterestByTradesperson(
  jobId: string,
  tradespersonProfileId: string
) {
  return db.jobInterest.findUnique({
    where: { jobId_tradespersonId: { jobId, tradespersonId: tradespersonProfileId } },
    select: {
      id: true,
      coverLetter: true,
      estimatedCostPesewas: true,
      estimatedDuration: true,
      availableFrom: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function getCategories(activeOnly = true) {
  return db.tradeCategory.findMany({
    where: {
      parentId: null,
      ...(activeOnly && { isActive: true }),
    },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
      color: true,
      sortOrder: true,
      children: {
        where: activeOnly ? { isActive: true } : {},
        select: { id: true, name: true, slug: true, icon: true },
        orderBy: { sortOrder: "asc" as const },
      },
    },
  });
}
