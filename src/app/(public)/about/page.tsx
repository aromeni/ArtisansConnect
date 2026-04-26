import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Target, Heart, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 space-y-14">

      <div className="text-center">
        <h1 className="text-4xl font-extrabold">About BuildersConnect</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          We&apos;re building the infrastructure for trust in Ghana&apos;s home services economy.
        </p>
      </div>

      {/* Mission */}
      <section className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="flex items-center gap-2 text-primary-600 mb-4">
            <Target className="h-5 w-5" />
            <span className="font-semibold uppercase text-xs tracking-wider">Our Mission</span>
          </div>
          <h2 className="text-2xl font-bold">Making skilled trades accessible and trustworthy</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Finding a reliable tradesperson in Ghana has always been difficult. Word of mouth only goes so far.
            Customers often hire blindly, without verified credentials or fair pricing.
            Tradespeople spend hours chasing leads instead of doing great work.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            BuildersConnect changes that. We verify identities, facilitate secure payments,
            and create a track record of quality — so both sides can transact with confidence.
          </p>
        </div>
        <div className="bg-primary-950 text-white rounded-xl p-8 space-y-4">
          {[
            { icon: ShieldCheck, label: "Every tradesperson is Ghana Card verified" },
            { icon: Heart, label: "Reviews are authentic — only after completed jobs" },
            { icon: Users, label: "Built specifically for Ghana — GHS, Paystack, local trades" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-start gap-3">
              <Icon className="h-5 w-5 text-secondary-400 shrink-0 mt-0.5" />
              <p className="text-sm text-primary-100">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section>
        <h2 className="text-2xl font-bold mb-8 text-center">What we stand for</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              title: "Transparency",
              desc: "No hidden fees. No opaque algorithms. Every part of our pricing, verification process, and dispute handling is explained clearly.",
            },
            {
              title: "Local relevance",
              desc: "We are built for Ghana — Ghana Card verification, Paystack payments, GHS currency, all 16 regions, and trade categories relevant to the local market.",
            },
            {
              title: "Fair for both sides",
              desc: "We serve customers and tradespeople equally. Our dispute process, payment model, and review system are designed to be fair to both parties.",
            },
          ].map(({ title, desc }) => (
            <div key={title} className="border border-border rounded-xl p-6">
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="border-t border-border pt-10 text-center">
        <p className="text-muted-foreground max-w-md mx-auto">
          Ready to experience a better way to hire or find work in Ghana?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Button asChild size="lg">
            <Link href="/sign-up">Post a Job</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/sign-up?role=tradesperson">Join as a Tradesperson</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
