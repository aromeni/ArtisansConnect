import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck,
  Star,
  Zap,
  ArrowRight,
  CheckCircle2,
  Hammer,
  Droplets,
  Bolt,
  PaintBucket,
  Layers,
  Wrench,
  Home,
  Wind,
} from "lucide-react";
import { getPublicCategories } from "@/server/queries/public";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Electrical: Bolt,
  Plumbing: Droplets,
  Painting: PaintBucket,
  "Building & Masonry": Hammer,
  Carpentry: Layers,
  Tiling: Home,
  Roofing: Home,
  "Air Conditioning & Cooling": Wind,
  "General Repairs & Maintenance": Wrench,
};

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Post your job for free",
    desc: "Describe what you need — category, location, budget, and any photos. Takes about 2 minutes.",
    colour: "bg-primary-600",
  },
  {
    step: "2",
    title: "Compare verified tradespeople",
    desc: "Receive quotes from interested tradespeople. Review their Ghana Card verification, ratings, portfolio, and price.",
    colour: "bg-primary-600",
  },
  {
    step: "3",
    title: "Pay safely and get it done",
    desc: "Pay through the platform. Funds are held securely until you confirm the job is complete.",
    colour: "bg-primary-600",
  },
];

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Ghana Card verified",
    desc: "Every tradesperson submits their Ghana Card for manual identity review before they can quote on jobs.",
  },
  {
    icon: Star,
    title: "Reviewed by real customers",
    desc: "Ratings and reviews are only unlocked after a job is marked complete — no fake testimonials.",
  },
  {
    icon: CheckCircle2,
    title: "Secure payment hold",
    desc: "Your payment is held by the platform and only released to the tradesperson when you confirm the work is done.",
  },
  {
    icon: Zap,
    title: "Dispute resolution centre",
    desc: "If anything goes wrong, raise a dispute and our team steps in to review evidence and make a fair decision.",
  },
];

const TESTIMONIALS = [
  {
    name: "Akosua Mensah",
    location: "East Legon, Accra",
    text: "I needed an electrician urgently. Within hours I had three verified quotes. I hired the one with the best reviews and the work was done perfectly. Highly recommend.",
    rating: 5,
  },
  {
    name: "Kwabena Owusu",
    location: "Kumasi",
    text: "As a plumber I was spending hours finding clients. Now jobs come to me. The platform is fair — 10% commission is reasonable for the quality of leads.",
    rating: 5,
  },
  {
    name: "Ama Boateng",
    location: "Takoradi",
    text: "I was nervous about hiring someone I didn't know. The fact that payments are held until the job is done gave me confidence. My tiles look amazing.",
    rating: 5,
  },
];

export default async function HomePage() {
  const categories = await getPublicCategories({ take: 8 });

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary-950 via-primary-800 to-primary-700 text-white overflow-hidden">
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <Badge className="mb-6 bg-secondary-500/20 text-secondary-200 border-secondary-500/30 hover:bg-secondary-500/20">
              Ghana&apos;s trusted trades marketplace
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Find trusted tradespeople{" "}
              <span className="text-secondary-400">across Ghana</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-primary-100 leading-relaxed max-w-xl">
              Professional builders, plumbers, electricians and more —
              Ghana Card verified, reviewed by real customers, and ready to work.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="bg-secondary-500 hover:bg-secondary-600 text-white text-base font-semibold px-8">
                <Link href="/sign-up">
                  Post a Job — it&apos;s free
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base">
                <Link href="/tradespeople">Browse Tradespeople</Link>
              </Button>
            </div>

            {/* Trust bar */}
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-primary-200">
              {[
                "Free to post a job",
                "Ghana Card verified pros",
                "Secure payment hold",
                "10% platform commission",
              ].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-secondary-400 shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: "2,400+", label: "Verified tradespeople" },
              { value: "8,100+", label: "Jobs completed" },
              { value: "16", label: "Regions covered" },
              { value: "4.8★", label: "Average rating" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl sm:text-3xl font-extrabold text-primary-600">{value}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How BuildersConnect works</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Post a job, compare verified tradespeople, and pay securely — all in one place.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map(({ step, title, desc, colour }) => (
            <div key={step} className="flex gap-4">
              <div
                className={`h-10 w-10 rounded-full ${colour} text-white text-sm font-bold flex items-center justify-center shrink-0`}
              >
                {step}
              </div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button asChild size="lg">
            <Link href="/sign-up">Get started — post a job free</Link>
          </Button>
        </div>
      </section>

      {/* ── Trade categories ───────────────────────────────────────────────────── */}
      <section className="bg-surface border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Popular trades</h2>
            <p className="mt-3 text-muted-foreground">
              Whatever the job, we have verified professionals ready to quote.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] ?? Wrench;
              return (
                <Link key={cat.id} href={`/categories?trade=${encodeURIComponent(cat.name)}`}>
                  <Card className="hover:border-primary-400 hover:shadow-sm transition-all cursor-pointer">
                    <CardContent className="pt-6 pb-5 flex flex-col items-center text-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary-600" />
                      </div>
                      <span className="text-sm font-medium leading-snug">{cat.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href="/categories">View all trades</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Why BuildersConnect ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Why choose BuildersConnect?</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            We built the safeguards so you can hire with confidence.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_POINTS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="outline">
            <Link href="/trust-safety">Read about Trust & Safety</Link>
          </Button>
        </div>
      </section>

      {/* ── Tradesperson CTA ───────────────────────────────────────────────────── */}
      <section className="bg-primary-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-bold">
                Are you a tradesperson or artisan?
              </h2>
              <p className="mt-3 text-primary-200 leading-relaxed">
                Join thousands of verified tradespeople earning more on BuildersConnect.
                Get matched to local jobs, receive secure payments, and grow your reputation
                with verified reviews.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-primary-200">
                {[
                  "Free to join — no subscription fees",
                  "Only pay a 10% commission when you're paid",
                  "Build your verified profile and portfolio",
                  "Receive secure payments through the platform",
                ].map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-secondary-400 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="shrink-0">
              <Button
                asChild
                size="lg"
                className="bg-secondary-500 hover:bg-secondary-600 text-white font-semibold px-8 text-base"
              >
                <Link href="/sign-up?role=tradesperson">
                  Join as a Tradesperson
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">What people are saying</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, location, text, rating }) => (
            <Card key={name} className="flex flex-col">
              <CardContent className="pt-6 flex-1 flex flex-col gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-secondary-400 text-secondary-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed flex-1">&ldquo;{text}&rdquo;</p>
                <div>
                  <p className="font-medium text-sm">{name}</p>
                  <p className="text-xs text-muted-foreground">{location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Post your job for free today and receive quotes from verified tradespeople across Ghana.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="text-base px-8">
              <Link href="/sign-up">Post a Job — it&apos;s free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link href="/how-it-works">Learn how it works</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
