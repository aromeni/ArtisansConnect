import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export default async function TradespersonPaymentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-muted-foreground mt-1">Your completed jobs and pending payouts.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <Wallet className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No earnings yet</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Your payout history will appear here after completing your first job.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
