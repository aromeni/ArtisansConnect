/**
 * User query helpers.
 * These are read-only DB functions — mutations live in server/actions/.
 */

import { db } from "@/lib/db";
import type { UserRole } from "@prisma/client";

export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      onboardingComplete: true,
      suspended: true,
      createdAt: true,
      customerProfile: {
        select: { id: true, phone: true, region: true, city: true },
      },
      tradespersonProfile: {
        select: {
          id: true,
          businessName: true,
          phone: true,
          verificationStatus: true,
          onboardingStatus: true,
          averageRating: true,
          totalReviews: true,
          totalJobsCompleted: true,
        },
      },
    },
  });
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
      onboardingComplete: true,
      suspended: true,
    },
  });
}

export async function listUsers({
  role,
  suspended,
  page = 1,
  pageSize = 20,
}: {
  role?: UserRole;
  suspended?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const skip = (page - 1) * pageSize;
  const where = {
    ...(role && { role }),
    ...(suspended !== undefined && { suspended }),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" as const },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        suspended: true,
        onboardingComplete: true,
        createdAt: true,
        tradespersonProfile: {
          select: {
            verificationStatus: true,
            onboardingStatus: true,
          },
        },
      },
    }),
    db.user.count({ where }),
  ]);

  return { users, total, page, pageSize, hasMore: skip + users.length < total };
}
