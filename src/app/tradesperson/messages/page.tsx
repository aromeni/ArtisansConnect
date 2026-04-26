import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default async function TradespersonMessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-1">Your conversations with customers.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <MessageSquare className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No messages yet</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Once a customer is interested in your quote, you&apos;ll be able to chat here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
