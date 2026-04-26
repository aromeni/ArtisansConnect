/**
 * Dispute query helpers.
 */

import { db } from "@/lib/db";
import type { DisputeStatus } from "@prisma/client";

export async function getDisputeById(id: string) {
  return db.dispute.findUnique({
    where: { id },
    select: {
      id: true,
      raisedByType: true,
      reason: true,
      description: true,
      status: true,
      resolution: true,
      resolvedAt: true,
      createdAt: true,
      updatedAt: true,
      job: {
        select: {
          id: true,
          title: true,
          category: { select: { name: true } },
          customer: { select: { user: { select: { name: true, email: true } } } },
        },
      },
      hire: {
        select: {
          id: true,
          agreedAmountPesewas: true,
          tradesperson: { select: { user: { select: { name: true, email: true } } } },
        },
      },
      raisedBy: { select: { name: true, email: true } },
      resolvedBy: { select: { name: true } },
      evidence: {
        select: { id: true, url: true, description: true, createdAt: true,
          uploadedBy: { select: { name: true } } },
        orderBy: { createdAt: "asc" as const },
      },
      adminNotes: {
        select: { id: true, content: true, createdAt: true,
          author: { select: { name: true } } },
        orderBy: { createdAt: "asc" as const },
      },
    },
  });
}

export async function getDisputeByJobId(jobId: string) {
  return db.dispute.findUnique({
    where: { jobId },
    select: {
      id: true,
      status: true,
      reason: true,
      raisedByType: true,
      createdAt: true,
    },
  });
}

export async function listDisputesForAdmin({
  status,
  page = 1,
  pageSize = 20,
}: {
  status?: DisputeStatus;
  page?: number;
  pageSize?: number;
}) {
  const skip = (page - 1) * pageSize;
  const where = status ? { status } : {};

  const [disputes, total] = await Promise.all([
    db.dispute.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        raisedByType: true,
        reason: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        job: { select: { id: true, title: true } },
        raisedBy: { select: { name: true, email: true } },
        hire: {
          select: {
            agreedAmountPesewas: true,
            tradesperson: { select: { user: { select: { name: true } } } },
          },
        },
      },
    }),
    db.dispute.count({ where }),
  ]);

  return { disputes, total, page, pageSize, hasMore: skip + disputes.length < total };
}
