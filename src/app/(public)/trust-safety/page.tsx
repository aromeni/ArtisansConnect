import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, CreditCard, MessageSquare, UserCheck, AlertTriangle, Lock } from "lucide-react";

const PILLARS = [
  {
    icon: UserCheck,
    title: "Ghana Card Identity Verification",
    points: [
      "Every tradesperson must submit their Ghana Card details and a photo ID before being approved.",
      "Our operations team manually reviews each submission — there are no shortcuts.",
      "Approved tradespeople receive a verified badge displayed on their profile.",
      "Rejected submissions can be resubmitted with corrected documents.",
      "Customer accounts require a valid email and phone number.",
    ],
  },
  {
    icon: CreditCard,
    title: "Secure Payment Architecture",
    points: [
      "Customer payments are processed by Paystack — a regulated Ghanaian payment processor.",
      "Funds are held at the platform level and only released when the customer confirms job completion.",
      "Tradespeople never receive payment before you're satisfied with the work.",
      "All amounts are in Ghana Cedis (GHS) with no hidden conversion fees.",
      "Platform commission is 10% — deducted automatically before payout.",
    ],
  },
  {
    icon: MessageSquare,
    title: "Safe In-Platform Communication",
    points: [
      "All chat between customers and tradespeople happens inside BuildersConnect.",
      "We strongly discourage sharing contact details before a hire is confirmed.",
      "Chat history is preserved and available to our dispute team if needed.",
      "Image and file sharing is restricted to job-related content.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Dispute Resolution Centre",
    points: [
      "Either party can open a dispute for any completed or in-progress job.",
      "Supported dispute reasons: poor workmanship, incomplete work, no-show, damage, misleading description, and more.",
      "Both sides can upload evidence: photos, messages, documents.",
      "Our team reviews evidence and makes a decision within 5 business days.",
      "Payments are held during the entire dispute process.",
      "Outcomes can include full release, partial refund, or full refund.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Review Integrity",
    points: [
      "Reviews can only be submitted after a job is marked complete by both parties.",
      "Only the customer who hired a tradesperson can review them for that job.",
      "Reviews are not editable after submission.",
      "Suspected fake or abusive reviews are investigated and may be removed.",
    ],
  },
  {
    icon: Lock,
    title: "Data Privacy and Document Security",
    points: [
      "Ghana Card images are stored as private, encrypted assets — they are never publicly accessible.",
      "Sensitive documents are only viewable by authorised platform staff via signed, expiring URLs.",
      "We do not sell or share your personal data with third parties.",
      "Account deletion requests are processed within 30 days.",
    ],
  },
];

export default function TrustSafetyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">

      <div className="text-center">
        <h1 className="text-4xl font-extrabold">Trust & Safety</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          We take the safety of our users seriously. Here&apos;s exactly how BuildersConnect
          protects both customers and tradespeople.
        </p>
      </div>

      <div className="space-y-8">
        {PILLARS.map(({ icon: Icon, title, points }) => (
          <Card key={title}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{title}</h2>
                  <ul className="mt-3 space-y-2">
                    {points.map((p) => (
                      <li key={p} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary-500 shrink-0 mt-0.5">•</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-primary-50 border border-primary-100 rounded-xl p-8 text-center">
        <ShieldCheck className="h-10 w-10 text-primary-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold">Still have concerns?</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Our team is available to answer safety questions or take reports of suspicious behaviour.
        </p>
        <Button asChild className="mt-5">
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </div>
  );
}
