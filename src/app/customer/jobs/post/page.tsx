import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { JobPostForm } from "@/components/jobs/job-post-form";

export default async function PostJobPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const [categories, profile] = await Promise.all([
    db.tradeCategory.findMany({
      where: { parentId: null, isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    db.customerProfile.findUnique({
      where: { userId: session.user.id },
      select: { region: true },
    }),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Post a Job</h1>
        <p className="text-muted-foreground mt-1">
          Describe what you need and receive quotes from verified tradespeople.
        </p>
      </div>

      <JobPostForm
        categories={categories}
        defaultRegion={profile?.region ?? undefined}
      />
    </div>
  );
}
