import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { JobStatusBadge } from "@/components/jobs/job-status-badge";
import { InterestsList } from "@/components/jobs/interests-list";
import { formatBudgetDisplay, urgencyLabel } from "@/lib/utils/format";
import { getJobById, getJobInterests } from "@/server/queries/jobs";
import { publishJobAction, cancelJobAction } from "@/server/actions/jobs";
import {
  MapPin, Clock, Briefcase, Calendar, ShieldCheck,
  Users, CreditCard, ArrowLeft,
} from "lucide-react";

export default async function CustomerJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const { id } = await params;

  const profile = await db.customerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) redirect("/onboarding/customer");

  const [job, interests] = await Promise.all([
    getJobById(id),
    getJobInterests(id),
  ]);

  if (!job) notFound();

  // Security: customers can only view their own jobs.
  const ownerCheck = await db.job.findFirst({
    where: { id, customerId: profile.id },
    select: { id: true },
  });
  if (!ownerCheck) notFound();

  const hire = await db.hire.findUnique({
    where: { jobId: id },
    include: {
      tradesperson: {
        include: {
          user: { select: { name: true, email: true } },
          categories: { where: { isPrimary: true }, include: { category: true }, take: 1 },
        },
      },
    },
  });

  const budget = formatBudgetDisplay(job.budgetType, job.budgetMin, job.budgetMax);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back link */}
      <Link
        href="/customer/jobs"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        My Jobs
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{job.category.name}</Badge>
            <JobStatusBadge status={job.status} />
          </div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
        </div>

        {/* Draft actions */}
        {job.status === "DRAFT" && (
          <div className="flex gap-2">
            <form action={publishJobAction.bind(null, id)}>
              <Button type="submit">Publish Job</Button>
            </form>
            <form action={cancelJobAction.bind(null, id)}>
              <Button type="submit" variant="outline" className="text-destructive border-destructive/30">
                Delete Draft
              </Button>
            </form>
          </div>
        )}

        {job.status === "OPEN" && (
          <form action={cancelJobAction.bind(null, id)}>
            <Button type="submit" variant="outline" size="sm" className="text-destructive border-destructive/30">
              Close Job
            </Button>
          </form>
        )}
      </div>

      {/* Draft warning */}
      {job.status === "DRAFT" && (
        <Alert>
          <Briefcase className="h-4 w-4" />
          <AlertTitle>This job is a draft</AlertTitle>
          <AlertDescription>
            It&apos;s not visible to tradespeople yet. Publish it when you&apos;re ready.
          </AlertDescription>
        </Alert>
      )}

      {/* Hired — payment prompt */}
      {job.status === "HIRED" && hire && (
        <Alert variant="warning">
          <CreditCard className="h-4 w-4" />
          <AlertTitle>Awaiting payment</AlertTitle>
          <AlertDescription>
            You&apos;ve hired <strong>{hire.tradesperson.user.name}</strong> for{" "}
            <strong>GHS {(hire.agreedAmountPesewas / 100).toLocaleString()}</strong>.
            Payment processing will be available in the next phase.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: job details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {job.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {job.images.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.url}
                  alt=""
                  className="h-40 w-60 object-cover rounded-lg border border-border shrink-0"
                />
              ))}
            </div>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </CardContent>
          </Card>

          {/* Interests / Applications */}
          {["OPEN", "MATCHED", "SHORTLISTED", "HIRED"].includes(job.status) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    Applications
                    {interests.length > 0 && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({interests.length})
                      </span>
                    )}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InterestsList
                  jobId={id}
                  interests={interests}
                  jobStatus={job.status}
                />
              </CardContent>
            </Card>
          )}

          {/* Hired tradesperson card */}
          {job.status === "HIRED" && hire && (
            <Card className="border-primary-200 bg-primary-50/20">
              <CardHeader>
                <CardTitle>Hired tradesperson</CardTitle>
              </CardHeader>
              <CardContent className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 shrink-0">
                  {hire.tradesperson.user.name?.charAt(0) ?? "?"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{hire.tradesperson.user.name}</p>
                    {hire.tradesperson.verificationStatus === "VERIFIED" && (
                      <ShieldCheck className="h-4 w-4 text-primary-600" />
                    )}
                  </div>
                  {hire.tradesperson.categories[0] && (
                    <p className="text-sm text-muted-foreground">
                      {hire.tradesperson.categories[0].category.name}
                    </p>
                  )}
                  <p className="text-sm mt-2">
                    Agreed amount:{" "}
                    <strong>GHS {(hire.agreedAmountPesewas / 100).toLocaleString()}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: metadata */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>
                  {job.city ? `${job.city}, ` : ""}
                  {job.region.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium">{budget}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{urgencyLabel(job.urgency)}</span>
              </div>
              {job.desiredStartDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>
                    Start:{" "}
                    {new Date(job.desiredStartDate).toLocaleDateString("en-GH", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{job.interestCount} interested</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
