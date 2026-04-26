import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CustomerOnboardingForm } from "@/components/onboarding/customer-onboarding-form";
import { MapPin } from "lucide-react";

export default async function CustomerOnboardingPage() {
  const session = await auth();

  if (!session?.user) redirect("/sign-in");
  if (session.user.role !== "CUSTOMER") redirect("/");
  if (session.user.onboardingComplete) redirect("/customer/dashboard");

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary-600">
          <MapPin className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Location setup</span>
        </div>
        <h1 className="text-2xl font-bold">
          Welcome, {session.user.name?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">
          Tell us where you are so we can match you with nearby tradespeople.
        </p>
      </div>

      <CustomerOnboardingForm />
    </div>
  );
}
