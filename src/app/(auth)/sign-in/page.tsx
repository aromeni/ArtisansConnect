import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = { title: "Sign In" };

export default function SignInPage() {
  return (
    <div className="max-w-sm w-full mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Sign in to your BuildersConnect account
        </p>
      </div>
      {/* Suspense required for useSearchParams inside SignInForm */}
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}
