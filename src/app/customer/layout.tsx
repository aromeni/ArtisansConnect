import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOutAction } from "@/server/actions/auth";
import { ShieldCheck, LayoutDashboard, Briefcase, MessageSquare, CreditCard, LogOut } from "lucide-react";

const nav = [
  { href: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customer/jobs", label: "My Jobs", icon: Briefcase },
  { href: "/customer/messages", label: "Messages", icon: MessageSquare },
  { href: "/customer/payments", label: "Payments", icon: CreditCard },
];

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CUSTOMER") redirect("/sign-in");
  if (!session.user.onboardingComplete) redirect("/onboarding/customer");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background px-4 h-14 flex items-center justify-between">
        <Link href="/customer/dashboard" className="flex items-center gap-2 font-bold text-primary-700">
          <ShieldCheck className="h-5 w-5 text-secondary-500" />
          BuildersConnect
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-sm text-muted-foreground">
            {session.user.name}
          </span>
          <form action={signOutAction}>
            <button type="submit" className="text-muted-foreground hover:text-foreground transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar — desktop */}
        <aside className="hidden md:flex flex-col w-56 border-r border-border bg-surface py-6 px-3 gap-1 shrink-0">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </aside>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden border-t border-border bg-background flex">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 py-2 text-xs text-muted-foreground hover:text-primary-600 transition-colors"
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
