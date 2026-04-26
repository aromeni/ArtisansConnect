import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/job-card";
import { getJobsByCustomer } from "@/server/queries/jobs";
import { db } from "@/lib/db";
import { parseJobStatus } from "@/lib/validation/params";
import { PlusCircle, Briefcase } from "lucide-react";

interface SearchParams { status?: string }

export default async function CustomerJobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const params = await searchParams;

  const profile = await db.customerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) redirect("/onboarding/customer");

  const jobs = await getJobsByCustomer(profile.id, parseJobStatus(params.status) ?? null);

  const STATUS_TABS = [
    { label: "All",       value: "" },
    { label: "Open",      value: "OPEN" },
    { label: "Hired",     value: "HIRED" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Drafts",    value: "DRAFT" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">My Jobs</h1>
          <p className="text-muted-foreground mt-1">{jobs.length} job{jobs.length !== 1 ? "s" : ""}</p>
        </div>
        <Button asChild>
          <Link href="/customer/jobs/post">
            <PlusCircle className="h-4 w-4" />
            Post a Job
          </Link>
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map(({ label, value }) => (
          <Link
            key={value}
            href={value ? `/customer/jobs?status=${value}` : "/customer/jobs"}
          >
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                (params.status ?? "") === value
                  ? "bg-primary-600 text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </span>
          </Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-border rounded-xl">
          <Briefcase className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No jobs yet</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Post your first job and start receiving quotes from verified tradespeople.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/customer/jobs/post">Post a Job</Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              href={`/customer/jobs/${job.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
