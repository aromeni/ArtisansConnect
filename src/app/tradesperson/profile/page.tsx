import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck, Star, Briefcase, MapPin, User } from "lucide-react";

export default async function TradespersonProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const profile = await db.tradespersonProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      categories: { include: { category: true } },
      serviceAreas: true,
      qualifications: true,
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">How customers see you on BuildersConnect.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/tradesperson/account">Edit Profile</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <User className="h-8 w-8 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold">{session.user.name}</h2>
              {profile?.verificationStatus === "VERIFIED" && (
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </Badge>
              )}
              {profile?.verificationStatus === "PENDING" && (
                <Badge variant="warning">Pending review</Badge>
              )}
            </div>
            {profile?.businessName && (
              <p className="text-sm text-muted-foreground">{profile.businessName}</p>
            )}
            {profile?.bio && (
              <p className="text-sm mt-2">{profile.bio}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Briefcase className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{profile?.totalJobsCompleted ?? 0}</p>
            <p className="text-xs text-muted-foreground">Jobs completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">
              {profile?.averageRating ? profile.averageRating.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Avg. rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <MapPin className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-2xl font-bold">{profile?.serviceAreas.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Service areas</p>
          </CardContent>
        </Card>
      </div>

      {profile?.categories && profile.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trades</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {profile.categories.map((tc) => (
              <Badge key={tc.categoryId} variant={tc.isPrimary ? "default" : "secondary"}>
                {tc.category.name}
                {tc.isPrimary && " (primary)"}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
