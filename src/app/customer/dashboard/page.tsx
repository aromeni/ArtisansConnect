import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Briefcase, MessageSquare, Star } from "lucide-react";

export default async function CustomerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Good day, {firstName}!</h1>
          <p className="text-muted-foreground mt-1">
            Post a job and get quotes from verified tradespeople across Ghana.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/customer/jobs/post">
            <PlusCircle className="h-4 w-4" />
            Post a Job
          </Link>
        </Button>
      </div>

      {/* Quick stats — placeholder until real data is wired in Phase 5+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Active Jobs", value: "0", icon: Briefcase, href: "/customer/jobs" },
          { label: "Unread Messages", value: "0", icon: MessageSquare, href: "/customer/messages" },
          { label: "Reviews Given", value: "0", icon: Star, href: "/customer/account" },
        ].map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:border-primary-300 transition-colors cursor-pointer">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Getting started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardDescription>Three steps to find your tradesperson</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Post a job", desc: "Describe what you need — it's free and takes 2 minutes." },
            { step: "2", title: "Compare quotes", desc: "Review profiles, portfolios, and prices from interested tradespeople." },
            { step: "3", title: "Hire & pay safely", desc: "Pay through the platform. Funds are held until you confirm the job is done." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-3">
              <div className="h-7 w-7 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                {step}
              </div>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
