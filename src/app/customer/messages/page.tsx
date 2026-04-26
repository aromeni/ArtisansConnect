import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default async function CustomerMessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-1">Your conversations with tradespeople.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <MessageSquare className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No messages yet</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Messages with tradespeople will appear here once you hire someone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
