import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { JobCard } from "@/components/jobs/job-card";
import { listOpenJobsForTradesperson } from "@/server/queries/jobs";
import { getCategories } from "@/server/queries/jobs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { parseGhanaRegion } from "@/lib/validation/params";
import { Search } from "lucide-react";

interface SearchParams {
  categoryId?: string;
  region?: string;
  page?: string;
}

export default async function TradespersonJobBoardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const params = await searchParams;

  const profile = await db.tradespersonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) redirect("/onboarding/tradesperson");

  const [{ jobs, total, hasMore }, categories] = await Promise.all([
    listOpenJobsForTradesperson(profile.id, {
      page: params.page ? parseInt(params.page) : 1,
      categoryId: params.categoryId,
      region: parseGhanaRegion(params.region),
    }),
    getCategories(),
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Browse Jobs</h1>
        <p className="text-muted-foreground mt-1">
          {total} open job{total !== 1 ? "s" : ""} matching your trade categories and service areas
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <Link href="/tradesperson/jobs">
          <Badge variant={!params.categoryId ? "default" : "outline"} className="cursor-pointer">
            All categories
          </Badge>
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/tradesperson/jobs?categoryId=${c.id}`}>
            <Badge
              variant={params.categoryId === c.id ? "default" : "outline"}
              className="cursor-pointer"
            >
              {c.name}
            </Badge>
          </Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-border rounded-xl">
          <Search className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No open jobs right now</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Jobs matching your trade categories and service areas will appear here.
            Make sure your profile is complete and your service areas are up to date.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              href={`/tradesperson/jobs/${job.id}`}
              myInterest={job.interests[0] ?? null}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Link
            href={`/tradesperson/jobs?page=${(parseInt(params.page ?? "1")) + 1}${params.categoryId ? `&categoryId=${params.categoryId}` : ""}`}
            className="text-sm font-medium text-primary-600 hover:underline"
          >
            Load more jobs
          </Link>
        </div>
      )}
    </div>
  );
}
