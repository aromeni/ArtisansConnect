import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-background px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary-700">
          <ShieldCheck className="h-6 w-6 text-secondary-500" />
          BuildersConnect
        </Link>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-10">{children}</main>
    </div>
  );
}
