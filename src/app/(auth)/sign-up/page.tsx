import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = { title: "Create Account" };

export default function SignUpPage() {
  return (
    <div className="max-w-sm w-full mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Join BuildersConnect</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Ghana&apos;s trusted marketplace for home services
        </p>
      </div>
      <SignUpForm />
    </div>
  );
}
