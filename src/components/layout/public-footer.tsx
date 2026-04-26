import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "Platform",
    links: [
      { href: "/how-it-works", label: "How It Works" },
      { href: "/categories", label: "All Trades" },
      { href: "/tradespeople", label: "Find Tradespeople" },
      { href: "/pricing", label: "Pricing & Fees" },
    ],
  },
  {
    title: "Join Us",
    links: [
      { href: "/sign-up", label: "Post a Job" },
      { href: "/sign-up?role=tradesperson", label: "Join as a Tradesperson" },
      { href: "/sign-in", label: "Sign In" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/trust-safety", label: "Trust & Safety" },
      { href: "/help", label: "Help Centre" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-primary-700">
              <ShieldCheck className="h-5 w-5 text-secondary-500" />
              BuildersConnect
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Ghana&apos;s trusted marketplace for home services and skilled tradespeople.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">© 2026 BuildersConnect. All rights reserved.</p>
          </div>

          {sections.map(({ title, links }) => (
            <div key={title}>
              <h3 className="text-sm font-semibold">{title}</h3>
              <ul className="mt-3 space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-muted-foreground">
          <p>Registered in Ghana · All amounts in GHS · Payments processed by Paystack</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
