import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FAQ_SECTIONS = [
  {
    title: "Getting started",
    faqs: [
      {
        q: "Is BuildersConnect free to use?",
        a: "Posting a job is completely free for customers. Tradespeople join for free and only pay a 10% commission when they receive payment for a completed job.",
      },
      {
        q: "What trades are available on the platform?",
        a: "We cover all major home service trades: electrical, plumbing, painting, building & masonry, carpentry, tiling, roofing, air conditioning, and general repairs — plus many more.",
      },
      {
        q: "Is BuildersConnect available across all of Ghana?",
        a: "Yes. We cover all 16 regions of Ghana. Tradespeople set their service areas when signing up, and job searches filter by location.",
      },
    ],
  },
  {
    title: "For customers",
    faqs: [
      {
        q: "How do I post a job?",
        a: "Sign up for a free account, then click 'Post a Job'. Fill in the trade category, description, location, and budget. You can also attach photos. Your job will be visible to relevant verified tradespeople.",
      },
      {
        q: "How many quotes will I receive?",
        a: "It depends on the job and your location, but typically 3–8 tradespeople will express interest. You can view all of them and their profiles before deciding.",
      },
      {
        q: "Can I see reviews before hiring?",
        a: "Yes. Every tradesperson's profile shows verified ratings and reviews from real past jobs. You can also see their portfolio images and qualifications.",
      },
      {
        q: "What happens if the tradesperson doesn't show up?",
        a: "If a tradesperson fails to attend without notice, do not release payment. You can open a dispute through the Resolution Centre and our team will investigate.",
      },
    ],
  },
  {
    title: "For tradespeople",
    faqs: [
      {
        q: "How do I get my Ghana Card verified?",
        a: "During onboarding, you'll be asked to enter your Ghana Card details and upload a photo of your ID. Our team manually reviews submissions and responds within 1–2 business days.",
      },
      {
        q: "Can I quote on jobs before I'm verified?",
        a: "You can browse open jobs while your verification is pending, but customers will see your status as 'Pending'. Being verified significantly increases your chances of being hired.",
      },
      {
        q: "How and when do I receive payment?",
        a: "Once the customer confirms the job is complete, payment is released from the platform to your registered mobile money or bank account, minus the 10% commission.",
      },
      {
        q: "What if a customer is unhappy with my work?",
        a: "If a dispute is raised, don't worry — you'll be able to submit your evidence too. Our team reviews both sides and makes a fair decision based on the facts.",
      },
    ],
  },
  {
    title: "Payments & disputes",
    faqs: [
      {
        q: "Is my payment safe?",
        a: "Yes. Payments are processed by Paystack (a regulated Ghana PSP) and held at the platform level until the customer confirms the job is done. You never pay directly to a tradesperson.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept mobile money (MTN Mobile Money, Vodafone Cash, AirtelTigo Money) and bank cards through Paystack.",
      },
      {
        q: "How do I open a dispute?",
        a: "If there's a problem, go to the job in your dashboard and click 'Open Dispute'. Describe the issue, select a reason, and upload any evidence. Our team will respond within 2 business days.",
      },
      {
        q: "How long does dispute resolution take?",
        a: "We aim to resolve all disputes within 5 business days. Complex cases may take longer. Both parties are notified throughout the process.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">

      <div className="text-center">
        <h1 className="text-4xl font-extrabold">Help Centre</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Find answers to common questions about BuildersConnect.
        </p>
      </div>

      {FAQ_SECTIONS.map(({ title, faqs }) => (
        <Card key={title}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {faqs.map(({ q, a }) => (
              <div key={q} className="border-b border-border last:border-0 pb-5 last:pb-0">
                <p className="font-semibold text-sm">{q}</p>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="bg-primary-50 border border-primary-100 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold">Still need help?</h2>
        <p className="text-muted-foreground mt-2">
          Our support team is available Monday to Friday, 8am–6pm GMT.
        </p>
        <Button asChild className="mt-5">
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
