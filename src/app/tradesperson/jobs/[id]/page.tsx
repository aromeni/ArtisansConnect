import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { JobStatusBadge } from "@/components/jobs/job-status-badge";
import { InterestForm } from "@/components/jobs/interest-form";
import { formatBudgetDisplay, urgencyLabel } from "@/lib/utils/format";
import { getJobById, getInterestByTradesperson } from "@/server/queries/jobs";
import {
  MapPin, Clock, Briefcase, Calendar, Users, ShieldCheck, Star, ArrowLeft,
} from "lucide-react";

export default async function TradespersonJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const { id } = await params;

  const profile = await db.tradespersonProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, verificationStatus: true },
  });
  if (!profile) redirect("/onboarding/tradesperson");

  const [job, myInterest] = await Promise.all([
    getJobById(id),
    getInterestByTradesperson(id, profile.id),
  ]);

  if (!job) notFound();
  if (job.status !== "OPEN" && !myInterest) notFound();

  const budget = formatBudgetDisplay(job.budgetType, job.budgetMin, job.budgetMax);
  const isVerified = profile.verificationStatus === "VERIFIED";

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back link */}
      <Link
        href="/tradesperson/jobs"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Browse Jobs
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{job.category.name}</Badge>
          <JobStatusBadge status={job.status} />
        </div>
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {job.city ? `${job.city}, ` : ""}
            {job.region.replace(/_/g, " ")}
          </span>
          <span className="flex items-center gap-1 font-medium text-foreground">
            {budget}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {urgencyLabel(job.urgency)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {job.interestCount} interested
          </span>
        </div>
      </div>

      {/* Verification warning */}
      {!isVerified && job.status === "OPEN" && (
        <Alert variant="warning">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Verification pending</AlertTitle>
          <AlertDescription>
            You can submit a quote now, but customers may prefer verified tradespeople.{" "}
            <Link href="/tradesperson/account" className="underline font-medium">
              Check your verification status
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: description + quote form */}
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

          <Card>
            <CardHeader>
              <CardTitle>Job description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </CardContent>
          </Card>

          {/* Quote / interest form */}
          {job.status === "OPEN" && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {myInterest && !["WITHDRAWN", "DECLINED"].includes(myInterest.status)
                    ? "Your quote"
                    : "Submit a quote"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InterestForm jobId={id} existingInterest={myInterest} />
              </CardContent>
            </Card>
          )}

          {job.status !== "OPEN" && myInterest?.status === "HIRED" && (
            <Alert variant="success">
              <Star className="h-4 w-4" />
              <AlertTitle>You&apos;ve been hired!</AlertTitle>
              <AlertDescription>
                The customer has selected you for this job. Payment will be arranged shortly.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Right: job metadata */}
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
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{job.interestCount} interested</span>
              </div>
              {job.publishedAt && (
                <div className="text-xs text-muted-foreground pt-1 border-t border-border">
                  Posted{" "}
                  {new Date(job.publishedAt).toLocaleDateString("en-GH", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
