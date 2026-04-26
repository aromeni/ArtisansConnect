import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, ShieldCheck, Star, CreditCard, MessageSquare } from "lucide-react";

const CUSTOMER_STEPS = [
  {
    n: "01",
    title: "Create a free account",
    desc: "Sign up in under a minute. No credit card needed. Just your name, email, and phone number.",
  },
  {
    n: "02",
    title: "Post your job",
    desc: "Describe what you need — select a trade category, your location, a budget, and add photos if helpful. It's completely free.",
  },
  {
    n: "03",
    title: "Receive quotes",
    desc: "Verified tradespeople in your area will express interest and submit their quotes. You'll be notified as they come in.",
  },
  {
    n: "04",
    title: "Compare and choose",
    desc: "Review each tradesperson's profile, Ghana Card verification badge, past reviews, portfolio images, and price. Shortlist your favourites and hire the best fit.",
  },
  {
    n: "05",
    title: "Chat and confirm scope",
    desc: "Use the in-platform chat to clarify details, share images, and agree on the exact scope before committing.",
  },
  {
    n: "06",
    title: "Pay securely",
    desc: "Pay through BuildersConnect. Your payment is held by the platform and only released to the tradesperson once you confirm the job is done.",
  },
  {
    n: "07",
    title: "Leave a review",
    desc: "After the job is complete, leave a rating and review. Your feedback helps the whole community hire with confidence.",
  },
];

const TRADESPERSON_STEPS = [
  {
    n: "01",
    title: "Create your profile",
    desc: "Sign up, add your trade categories, service areas, bio, and upload your Ghana Card for identity verification.",
  },
  {
    n: "02",
    title: "Get verified",
    desc: "Our team manually reviews your Ghana Card submission. Once verified, you'll receive a verified badge on your profile.",
  },
  {
    n: "03",
    title: "Build your portfolio",
    desc: "Upload photos of past work, add qualifications and certifications, and set your years of experience.",
  },
  {
    n: "04",
    title: "Browse and quote on jobs",
    desc: "Browse open jobs in your area and trade categories. Express interest and submit a quote directly from the job page.",
  },
  {
    n: "05",
    title: "Get hired",
    desc: "If the customer selects you, you'll both be connected. Confirm the scope, chat directly, and agree on timing.",
  },
  {
    n: "06",
    title: "Complete the job",
    desc: "Do great work. Mark the job as complete when done and wait for the customer to confirm.",
  },
  {
    n: "07",
    title: "Get paid",
    desc: "Once the customer confirms completion, the platform releases your payment minus the 10% platform commission.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-20">

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold">How BuildersConnect works</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A transparent, step-by-step marketplace connecting customers with verified tradespeople across Ghana.
        </p>
      </div>

      {/* For customers */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center">C</div>
          <h2 className="text-2xl font-bold">For Customers</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {CUSTOMER_STEPS.map(({ n, title, desc }) => (
            <div key={n} className="flex gap-4">
              <span className="text-2xl font-extrabold text-primary-200 leading-none w-8 shrink-0">{n}</span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/sign-up">
              Post a job — it&apos;s free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* For tradespeople */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-8 rounded-full bg-secondary-500 text-white text-sm font-bold flex items-center justify-center">T</div>
          <h2 className="text-2xl font-bold">For Tradespeople</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {TRADESPERSON_STEPS.map(({ n, title, desc }) => (
            <div key={n} className="flex gap-4">
              <span className="text-2xl font-extrabold text-secondary-200 leading-none w-8 shrink-0">{n}</span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Button asChild size="lg" variant="outline">
            <Link href="/sign-up?role=tradesperson">
              Join as a tradesperson
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Platform guarantees */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-10">Our platform guarantees</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, title: "Identity verified", desc: "Every tradesperson is verified via Ghana Card review." },
            { icon: Star, title: "Authentic reviews", desc: "Reviews are only posted after a job is marked complete." },
            { icon: CreditCard, title: "Payment protection", desc: "Funds are held until you confirm the work is done." },
            { icon: MessageSquare, title: "Dispute support", desc: "We step in if there's a disagreement. Fair for both sides." },
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <CardContent className="pt-6 flex flex-col gap-3">
                <Icon className="h-6 w-6 text-primary-600" />
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ preview */}
      <section className="bg-surface rounded-xl border border-border p-8">
        <h2 className="text-xl font-bold mb-6">Common questions</h2>
        <div className="space-y-5">
          {[
            {
              q: "Is it free to post a job?",
              a: "Yes — posting a job is completely free for customers. BuildersConnect charges a 10% commission only when a tradesperson is paid for completed work.",
            },
            {
              q: "How does payment hold work?",
              a: "When you confirm a hire, you pay the agreed amount into the platform. The funds are held and only released to the tradesperson once you mark the job as complete. This protects both sides.",
            },
            {
              q: "What if I'm not happy with the work?",
              a: "If there's a dispute, either party can open a case in our Resolution Centre. Our team reviews evidence and makes a decision. Payments are held during the dispute process.",
            },
            {
              q: "How is the tradesperson verified?",
              a: "Tradespeople submit their Ghana Card details and a photo of their ID. Our team manually reviews each submission before approving their verified badge.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">{q}</p>
                <p className="text-sm text-muted-foreground mt-1">{a}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/help" className="text-sm font-medium text-primary-600 hover:underline">
            View full Help Centre →
          </Link>
        </div>
      </section>
    </div>
  );
}
