import { db } from "@/lib/db";
import type { GhanaRegion } from "@prisma/client";

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  _count?: { children: number };
};

export type PublicTradesperson = {
  id: string;
  bio: string | null;
  averageRating: { toFixed(fractionDigits?: number): string } | number | null;
  totalReviews: number;
  totalJobsCompleted: number;
  user: { name: string | null };
  categories: { category: { name: string } }[];
  serviceAreas: { region: string }[];
};

const FALLBACK_CATEGORIES: PublicCategory[] = [
  { id: "electrical", name: "Electrical", slug: "electrical", description: null, icon: null, color: null, sortOrder: 10, _count: { children: 0 } },
  { id: "plumbing", name: "Plumbing", slug: "plumbing", description: null, icon: null, color: null, sortOrder: 20, _count: { children: 0 } },
  { id: "painting", name: "Painting", slug: "painting", description: null, icon: null, color: null, sortOrder: 30, _count: { children: 0 } },
  { id: "building-masonry", name: "Building & Masonry", slug: "building-masonry", description: null, icon: null, color: null, sortOrder: 40, _count: { children: 0 } },
  { id: "carpentry", name: "Carpentry", slug: "carpentry", description: null, icon: null, color: null, sortOrder: 50, _count: { children: 0 } },
  { id: "tiling", name: "Tiling", slug: "tiling", description: null, icon: null, color: null, sortOrder: 60, _count: { children: 0 } },
  { id: "roofing", name: "Roofing", slug: "roofing", description: null, icon: null, color: null, sortOrder: 70, _count: { children: 0 } },
  { id: "general-repairs", name: "General Repairs & Maintenance", slug: "general-repairs", description: null, icon: null, color: null, sortOrder: 80, _count: { children: 0 } },
];

function warnPublicFallback(area: string, error: unknown): void {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[public-data] Falling back for ${area}:`, error);
  }
}

export async function getPublicCategories({
  take,
  includeCounts = false,
}: {
  take?: number;
  includeCounts?: boolean;
} = {}): Promise<PublicCategory[]> {
  try {
    const categories = await db.tradeCategory.findMany({
      where: { parentId: null, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      ...(take && { take }),
      ...(includeCounts && {
        include: {
          _count: { select: { children: true } },
        },
      }),
    });

    return categories;
  } catch (error) {
    warnPublicFallback("categories", error);
    return FALLBACK_CATEGORIES.slice(0, take);
  }
}

export async function getPublicTradespeople({
  category,
  region,
}: {
  category?: string;
  region?: GhanaRegion;
}): Promise<PublicTradesperson[]> {
  try {
    return await db.tradespersonProfile.findMany({
      where: {
        verificationStatus: "VERIFIED",
        onboardingStatus: "APPROVED",
        ...(category
          ? { categories: { some: { category: { name: category } } } }
          : {}),
        ...(region
          ? { serviceAreas: { some: { region } } }
          : {}),
      },
      select: {
        id: true,
        bio: true,
        averageRating: true,
        totalReviews: true,
        totalJobsCompleted: true,
        user: { select: { name: true } },
        categories: {
          where: { isPrimary: true },
          select: { category: { select: { name: true } } },
          take: 1,
        },
        serviceAreas: { select: { region: true }, take: 2 },
      },
      take: 24,
      orderBy: [{ averageRating: "desc" }, { totalJobsCompleted: "desc" }],
    });
  } catch (error) {
    warnPublicFallback("tradespeople", error);
    return [];
  }
}
