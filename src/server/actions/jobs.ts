"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { createJobSchema, submitInterestSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";

type ActionResult = { error: string } | { success: true; jobId?: string };

// ─── Customer: create a job (DRAFT) ──────────────────────────────────────────

export async function createJobAction(rawData: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const profile = await db.customerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return { error: "Customer profile not found" };

  const parsed = createJobSchema.safeParse(rawData);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Invalid input" };
  }

  const {
    title, description, categoryId, region, city, address,
    budgetType, budgetMin, budgetMax, urgency, propertyType,
    desiredStartDate, imagePublicIds,
  } = parsed.data;

  // Verify category exists
  const category = await db.tradeCategory.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "Invalid category" };

  const job = await db.$transaction(async (tx) => {
    const j = await tx.job.create({
      data: {
        customerId: profile.id,
        categoryId,
        title,
        description,
        region,
        city,
        address,
        budgetType,
        budgetMin: budgetMin ?? null,
        budgetMax: budgetMax ?? null,
        urgency,
        propertyType: propertyType ?? null,
        desiredStartDate: desiredStartDate ?? null,
        status: "DRAFT",
      },
    });

    if (imagePublicIds.length > 0) {
      await tx.jobImage.createMany({
        data: imagePublicIds.map((publicId, i) => ({
          jobId: j.id,
          publicId,
          url: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`,
          sortOrder: i,
        })),
      });
    }

    return j;
  });

  return { success: true, jobId: job.id };
}

// ─── Customer: publish job (DRAFT → OPEN) ────────────────────────────────────

export async function publishJobAction(jobId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) { redirect("/sign-in"); }

  const profile = await db.customerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) { redirect("/onboarding/customer"); }

  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job || job.customerId !== profile.id || job.status !== "DRAFT") {
    redirect(`/customer/jobs/${jobId}`);
  }

  await db.job.update({
    where: { id: jobId },
    data: {
      status: "OPEN",
      publishedAt: new Date(),
      // Jobs expire in 30 days
      closedAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  revalidatePath(`/customer/jobs/${jobId}`);
  redirect(`/customer/jobs/${jobId}`);
}

// ─── Customer: cancel job ────────────────────────────────────────────────────

export async function cancelJobAction(jobId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) { redirect("/sign-in"); }

  const profile = await db.customerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) { redirect("/onboarding/customer"); }

  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job || job.customerId !== profile.id || !["DRAFT", "OPEN"].includes(job.status)) {
    redirect(`/customer/jobs/${jobId}`);
  }

  await db.job.update({
    where: { id: jobId },
    data: { status: "CANCELLED", closedAt: new Date() },
  });

  revalidatePath("/customer/jobs");
  redirect("/customer/jobs");
}

// ─── Customer: shortlist a tradesperson ──────────────────────────────────────

export async function shortlistTradespersonAction(
  jobId: string,
  tradespersonId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const profile = await db.customerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return { error: "Profile not found" };

  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job || job.customerId !== profile.id) return { error: "Not authorised" };

  const interest = await db.jobInterest.findUnique({
    where: { jobId_tradespersonId: { jobId, tradespersonId } },
  });
  if (!interest) return { error: "Interest not found" };

  await db.$transaction([
    db.jobInterest.update({
      where: { id: interest.id },
      data: { status: "SHORTLISTED" },
    }),
    db.shortlist.upsert({
      where: { jobId_tradespersonId: { jobId, tradespersonId } },
      update: {},
      create: { jobId, tradespersonId, interestId: interest.id },
    }),
  ]);

  revalidatePath(`/customer/jobs/${jobId}`);
  return { success: true };
}

// ─── Customer: hire a tradesperson ───────────────────────────────────────────

export async function hireAction(
  jobId: string,
  tradespersonId: string,
  agreedAmountPesewas: number
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const profile = await db.customerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return { error: "Profile not found" };

  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job || job.customerId !== profile.id) return { error: "Not authorised" };
  if (!["OPEN", "MATCHED", "SHORTLISTED"].includes(job.status)) {
    return { error: "Job is not in a hireable state" };
  }

  const interest = await db.jobInterest.findUnique({
    where: { jobId_tradespersonId: { jobId, tradespersonId } },
  });
  if (!interest || interest.status === "WITHDRAWN" || interest.status === "DECLINED") {
    return { error: "Interest not found or already withdrawn" };
  }

  if (agreedAmountPesewas <= 0) return { error: "Agreed amount must be greater than 0" };

  await db.$transaction(async (tx) => {
    // Create hire
    await tx.hire.create({
      data: {
        jobId,
        tradespersonId,
        customerId: profile.id,
        agreedAmountPesewas,
        status: "AWAITING_PAYMENT",
      },
    });

    // Promote winning interest
    await tx.jobInterest.update({
      where: { id: interest.id },
      data: { status: "HIRED" },
    });

    // Decline all other interests
    await tx.jobInterest.updateMany({
      where: {
        jobId,
        id: { not: interest.id },
        status: { notIn: ["WITHDRAWN"] },
      },
      data: { status: "DECLINED" },
    });

    // Update job status
    await tx.job.update({
      where: { id: jobId },
      data: { status: "HIRED" },
    });
  });

  revalidatePath(`/customer/jobs/${jobId}`);
  redirect(`/customer/jobs/${jobId}`);
}

// ─── Tradesperson: submit interest / quote ────────────────────────────────────

export async function submitInterestAction(rawData: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const profile = await db.tradespersonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return { error: "Tradesperson profile not found" };

  const parsed = submitInterestSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { jobId, coverLetter, estimatedCostPesewas, estimatedDuration, availableFrom } =
    parsed.data;

  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "OPEN") return { error: "Job is not open for applications" };

  const existing = await db.jobInterest.findUnique({
    where: { jobId_tradespersonId: { jobId, tradespersonId: profile.id } },
  });
  if (existing && existing.status !== "WITHDRAWN") {
    return { error: "You have already expressed interest in this job" };
  }

  await db.$transaction(async (tx) => {
    if (existing) {
      await tx.jobInterest.update({
        where: { id: existing.id },
        data: {
          coverLetter,
          estimatedCostPesewas: estimatedCostPesewas ?? null,
          estimatedDuration: estimatedDuration ?? null,
          availableFrom: availableFrom ?? null,
          status: "PENDING",
        },
      });
    } else {
      await tx.jobInterest.create({
        data: {
          jobId,
          tradespersonId: profile.id,
          coverLetter,
          estimatedCostPesewas: estimatedCostPesewas ?? null,
          estimatedDuration: estimatedDuration ?? null,
          availableFrom: availableFrom ?? null,
          status: "PENDING",
        },
      });
      await tx.job.update({
        where: { id: jobId },
        data: { interestCount: { increment: 1 } },
      });
    }
  });

  revalidatePath(`/tradesperson/jobs/${jobId}`);
  return { success: true };
}

// ─── Tradesperson: withdraw interest ─────────────────────────────────────────

export async function withdrawInterestAction(jobId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const profile = await db.tradespersonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return { error: "Profile not found" };

  const interest = await db.jobInterest.findUnique({
    where: { jobId_tradespersonId: { jobId, tradespersonId: profile.id } },
  });
  if (!interest || interest.status === "WITHDRAWN") {
    return { error: "No active interest found" };
  }
  if (interest.status === "HIRED") {
    return { error: "Cannot withdraw — you have already been hired for this job" };
  }

  await db.$transaction([
    db.jobInterest.update({
      where: { id: interest.id },
      data: { status: "WITHDRAWN" },
    }),
    db.job.update({
      where: { id: jobId },
      data: { interestCount: { decrement: 1 } },
    }),
  ]);

  revalidatePath(`/tradesperson/jobs/${jobId}`);
  return { success: true };
}
