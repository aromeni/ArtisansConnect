import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: { default: "Sign In", template: "%s | BuildersConnect" },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — branding panel (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between bg-primary-700 p-12 text-white">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <ShieldCheck className="h-7 w-7 text-secondary-400" />
          BuildersConnect
        </Link>

        <div className="space-y-6">
          <blockquote className="text-2xl font-medium leading-relaxed">
            &ldquo;Find trusted tradespeople across Ghana — verified, reviewed, and ready to work.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-sm font-bold">
              AO
            </div>
            <div>
              <p className="font-semibold">Ama Owusu</p>
              <p className="text-primary-200 text-sm">Homeowner, Accra</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Verified Tradespeople", value: "2,400+" },
            { label: "Jobs Completed", value: "18,000+" },
            { label: "Ghana Regions", value: "16" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-secondary-300">{stat.value}</p>
              <p className="text-xs text-primary-200 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="lg:hidden mb-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary-700">
            <ShieldCheck className="h-6 w-6 text-secondary-500" />
            BuildersConnect
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
