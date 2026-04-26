import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-14">

      <div className="text-center">
        <h1 className="text-4xl font-extrabold">Simple, transparent pricing</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          No subscriptions. No hidden fees. You only pay when the job is done.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="border-primary-200 bg-primary-50/30">
          <CardHeader>
            <CardTitle>For Customers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-extrabold">Free</div>
            <p className="text-muted-foreground text-sm">
              There is no cost to post a job, receive quotes, or compare tradespeople.
            </p>
            <ul className="space-y-2">
              {[
                "Post unlimited jobs",
                "Receive and compare quotes",
                "In-platform chat with tradespeople",
                "Payment holds until job completion",
                "Dispute resolution included",
                "Reviews and ratings",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary-600 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild className="w-full mt-2">
              <Link href="/sign-up">
                Post a job for free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>For Tradespeople</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-3xl font-extrabold">10%</span>
              <span className="text-muted-foreground ml-2 text-sm">commission per completed job</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Free to join and free to quote. You only pay when you get paid.
            </p>
            <ul className="space-y-2">
              {[
                "Free account and profile",
                "Free Ghana Card verification",
                "Upload portfolio images",
                "Browse and quote on jobs",
                "Secure in-platform payments",
                "10% commission on job value only",
                "No monthly subscription fees",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-secondary-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="w-full mt-2">
              <Link href="/sign-up?role=tradesperson">
                Join as a tradesperson
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment breakdown example */}
      <div className="border border-border rounded-xl p-8">
        <h2 className="text-xl font-bold mb-6">Example payment breakdown</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Here&apos;s how a GHS 1,000 job is handled through the platform:
        </p>

        <div className="space-y-3 max-w-sm">
          {[
            { label: "Customer pays", value: "GHS 1,000.00", highlight: false },
            { label: "Platform commission (10%)", value: "− GHS 100.00", highlight: false },
            { label: "Payment processor fee (~1.5%)", value: "− GHS 15.00", highlight: false, note: "Paystack fee, approximate" },
            { label: "Tradesperson receives", value: "≈ GHS 885.00", highlight: true },
          ].map(({ label, value, highlight, note }) => (
            <div
              key={label}
              className={`flex justify-between items-start gap-4 py-2 ${highlight ? "border-t border-border font-semibold" : ""}`}
            >
              <div>
                <span className="text-sm">{label}</span>
                {note && <p className="text-xs text-muted-foreground">{note}</p>}
              </div>
              <span className={`text-sm shrink-0 ${highlight ? "text-primary-600" : ""}`}>{value}</span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          * Paystack fees are approximate and may vary by payment method (card, mobile money). The exact fee is disclosed at payment time.
        </p>
      </div>

      {/* FAQ */}
      <div className="space-y-5">
        <h2 className="text-xl font-bold">Pricing questions</h2>
        {[
          {
            q: "When is the commission charged?",
            a: "Only when the customer confirms the job is complete and the payment is released. No commission is charged on disputes that result in a full refund.",
          },
          {
            q: "Are there any listing or quoting fees?",
            a: "No. Customers post jobs for free. Tradespeople can browse and quote on as many jobs as they like without any cost.",
          },
          {
            q: "What if a job is disputed and partially refunded?",
            a: "Platform commission is calculated on the net amount released to the tradesperson. If the payment is partially refunded, commission is reduced proportionally.",
          },
          {
            q: "Are there premium tiers or featured placements?",
            a: "Not currently. All verified tradespeople are shown fairly based on rating, reviews, and job completion history.",
          },
        ].map(({ q, a }) => (
          <div key={q} className="border-b border-border pb-5">
            <p className="font-semibold text-sm">{q}</p>
            <p className="text-sm text-muted-foreground mt-1.5">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
