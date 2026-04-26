"use server";

import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { signUpSchema, signInSchema } from "@/lib/validation/schemas";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

type ActionResult = { error: string } | { success: true };

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export async function signUpAction(
  rawData: z.infer<typeof signUpSchema>
): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password, name, role } = parsed.data;

  const existing = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          passwordHash,
          role,
          onboardingComplete: false,
        },
      });

      if (role === "CUSTOMER") {
        await tx.customerProfile.create({ data: { userId: user.id } });
      } else {
        await tx.tradespersonProfile.create({ data: { userId: user.id } });
      }
    });
  } catch {
    return { error: "Could not create account. Please try again." };
  }

  // Auto sign-in after account creation — throws NEXT_REDIRECT on success
  const redirectTo =
    role === "CUSTOMER" ? "/onboarding/customer" : "/onboarding/tradesperson";

  try {
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created but sign-in failed. Please sign in manually." };
    }
    throw error; // re-throw NEXT_REDIRECT
  }

  return { success: true };
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

export async function signInAction(
  rawData: z.infer<typeof signInSchema> & { redirectTo?: string }
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: rawData.redirectTo ?? "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error; // re-throw NEXT_REDIRECT
  }

  return { success: true };
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
