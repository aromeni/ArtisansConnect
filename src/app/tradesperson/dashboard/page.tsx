import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Search, Clock, Star, ShieldCheck } from "lucide-react";

export default async function TradespersonDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const profile = await db.tradespersonProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      verificationStatus: true,
      onboardingStatus: true,
      averageRating: true,
      totalReviews: true,
      totalJobsCompleted: true,
    },
  });

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Good day, {firstName}!</h1>
          <p className="text-muted-foreground mt-1">Browse and respond to jobs across Ghana.</p>
        </div>
        <Button asChild size="lg">
          <Link href="/tradesperson/jobs">
            <Search className="h-4 w-4" />
            Browse Jobs
          </Link>
        </Button>
      </div>

      {/* Verification status banner */}
      {profile?.verificationStatus === "PENDING" && (
        <Alert variant="warning">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Verification pending</AlertTitle>
          <AlertDescription>
            Your Ghana Card is under review. You can browse jobs while you wait —
            verification usually takes 1–2 business days.
          </AlertDescription>
        </Alert>
      )}

      {profile?.verificationStatus === "VERIFIED" && (
        <Alert variant="success">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Identity verified</AlertTitle>
          <AlertDescription>
            Your verified badge is now showing on your profile.
          </AlertDescription>
        </Alert>
      )}

      {profile?.verificationStatus === "REJECTED" && (
        <Alert variant="destructive">
          <AlertTitle>Verification not approved</AlertTitle>
          <AlertDescription>
            We couldn&apos;t verify your identity. Please{" "}
            <Link href="/tradesperson/account" className="underline font-medium">
              re-submit your documents
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Jobs Completed", value: profile?.totalJobsCompleted ?? 0, icon: Clock },
          { label: "Avg. Rating", value: profile?.averageRating ? `${profile.averageRating}★` : "—", icon: Star },
          { label: "Reviews", value: profile?.totalReviews ?? 0, icon: Star },
          { label: "Verification", value: profile?.verificationStatus ?? "—", icon: ShieldCheck, badge: true },
        ].map(({ label, value, icon: Icon, badge }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <Icon className="h-4 w-4 text-muted-foreground mb-2" />
              {badge ? (
                <Badge
                  variant={
                    value === "VERIFIED" ? "success"
                    : value === "PENDING" ? "warning"
                    : "destructive"
                  }
                  className="mt-1"
                >
                  {String(value)}
                </Badge>
              ) : (
                <p className="text-2xl font-bold">{String(value)}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder for recent job activity — wired in Phase 5 */}
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <Search className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No activity yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Start by browsing open jobs. Express interest and customers will compare your profile.
            </p>
            <Button asChild variant="outline">
              <Link href="/tradesperson/jobs">Browse open jobs</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
