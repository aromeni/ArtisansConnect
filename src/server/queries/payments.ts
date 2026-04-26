/**
 * Payment query helpers.
 */

import { db } from "@/lib/db";
import type { PaymentStatus } from "@prisma/client";

export async function getPaymentByJobId(jobId: string) {
  return db.payment.findUnique({
    where: { jobId },
    select: {
      id: true,
      paystackReference: true,
      grossAmountPesewas: true,
      commissionPesewas: true,
      pspFeePesewas: true,
      netPayoutPesewas: true,
      status: true,
      channel: true,
      paidAt: true,
      hold: {
        select: { id: true, amountPesewas: true, releasedAt: true, releaseReason: true },
      },
      payout: {
        select: { id: true, status: true, amountPesewas: true, completedAt: true },
      },
      commission: {
        select: { id: true, amountPesewas: true, rate: true, collectedAt: true },
      },
    },
  });
}

export async function getPaymentByReference(reference: string) {
  return db.payment.findUnique({
    where: { paystackReference: reference },
    include: {
      job: { select: { id: true, title: true, status: true } },
      hire: { select: { id: true, status: true, tradespersonId: true } },
      hold: true,
    },
  });
}

export async function listPaymentsForAdmin({
  status,
  page = 1,
  pageSize = 20,
}: {
  status?: PaymentStatus;
  page?: number;
  pageSize?: number;
}) {
  const skip = (page - 1) * pageSize;
  const where = status ? { status } : {};

  const [payments, total] = await Promise.all([
    db.payment.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        paystackReference: true,
        grossAmountPesewas: true,
        commissionPesewas: true,
        netPayoutPesewas: true,
        status: true,
        channel: true,
        paidAt: true,
        createdAt: true,
        job: { select: { id: true, title: true } },
        customer: { select: { user: { select: { name: true, email: true } } } },
        hold: { select: { releasedAt: true } },
        payout: { select: { status: true, completedAt: true } },
      },
    }),
    db.payment.count({ where }),
  ]);

  return { payments, total, page, pageSize, hasMore: skip + payments.length < total };
}

export async function getCustomerPaymentHistory(customerId: string) {
  return db.payment.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      grossAmountPesewas: true,
      status: true,
      paidAt: true,
      channel: true,
      job: { select: { id: true, title: true } },
      payout: { select: { status: true } },
      refunds: { select: { id: true, amountPesewas: true, status: true } },
    },
  });
}

export async function getTradespersonPayoutHistory(tradespersonId: string) {
  return db.payout.findMany({
    where: { tradespersonId },
    orderBy: { initiatedAt: "desc" },
    select: {
      id: true,
      amountPesewas: true,
      status: true,
      initiatedAt: true,
      completedAt: true,
      payment: {
        select: {
          grossAmountPesewas: true,
          commissionPesewas: true,
          job: { select: { id: true, title: true } },
        },
      },
    },
  });
}

export async function getPlatformMetrics() {
  const [
    totalGrossRevenue,
    totalCommission,
    pendingPayouts,
    activeDisputes,
  ] = await Promise.all([
    db.payment.aggregate({
      where: { status: { in: ["HELD", "RELEASED"] } },
      _sum: { grossAmountPesewas: true },
    }),
    db.commission.aggregate({
      _sum: { amountPesewas: true },
    }),
    db.payout.count({ where: { status: "PENDING" } }),
    db.dispute.count({ where: { status: { in: ["OPEN", "AWAITING_EVIDENCE", "UNDER_REVIEW"] } } }),
  ]);

  return {
    totalGrossRevenuePesewas: totalGrossRevenue._sum.grossAmountPesewas ?? 0,
    totalCommissionPesewas: totalCommission._sum.amountPesewas ?? 0,
    pendingPayouts,
    activeDisputes,
  };
}
