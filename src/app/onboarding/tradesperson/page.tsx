import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { TradespersonOnboardingForm } from "@/components/onboarding/tradesperson-onboarding-form";
import { HardHat } from "lucide-react";

export default async function TradespersonOnboardingPage() {
  const session = await auth();

  if (!session?.user) redirect("/sign-in");
  if (session.user.role !== "TRADESPERSON") redirect("/");
  if (session.user.onboardingComplete) redirect("/tradesperson/dashboard");

  // Fetch active categories for the category picker
  const categories = await db.tradeCategory.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true, icon: true },
  });

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary-600">
          <HardHat className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Tradesperson profile</span>
        </div>
        <h1 className="text-2xl font-bold">
          Welcome, {session.user.name?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">
          Complete your profile so customers can find you. Verified tradespeople get
          significantly more enquiries.
        </p>
      </div>

      <TradespersonOnboardingForm categories={categories} />
    </div>
  );
}
