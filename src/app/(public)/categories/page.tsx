import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicCategories } from "@/server/queries/public";
import {
  Bolt, Droplets, PaintBucket, Hammer, Layers, Home, Wrench, Wind,
  ArrowRight,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
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

const COLOUR_MAP = [
  "bg-blue-50 text-blue-600",
  "bg-teal-50 text-teal-600",
  "bg-orange-50 text-orange-600",
  "bg-amber-50 text-amber-600",
  "bg-lime-50 text-lime-600",
  "bg-violet-50 text-violet-600",
  "bg-rose-50 text-rose-600",
  "bg-cyan-50 text-cyan-600",
  "bg-primary-50 text-primary-600",
];

export default async function CategoriesPage() {
  const categories = await getPublicCategories({ includeCounts: true });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold">All trades and services</h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Browse by trade category and find verified tradespeople ready to quote on your job.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat, i) => {
          const Icon = ICON_MAP[cat.name] ?? Wrench;
          const colour = COLOUR_MAP[i % COLOUR_MAP.length];
          const childCount = cat._count?.children ?? 0;
          return (
            <Link key={cat.id} href={`/tradespeople?category=${encodeURIComponent(cat.name)}`}>
              <Card className="hover:border-primary-400 hover:shadow-sm transition-all cursor-pointer h-full">
                <CardContent className="pt-6 pb-5 flex flex-col items-center text-center gap-3">
                  <div className={`h-12 w-12 rounded-xl ${colour} flex items-center justify-center`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="font-semibold text-sm leading-snug">{cat.name}</p>
                  {childCount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {childCount} specialisms
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-16 bg-primary-50 border border-primary-100 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold">Don&apos;t see your trade?</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Post a job with a description of what you need and we&apos;ll match you with the right professional.
        </p>
        <Button asChild className="mt-5">
          <Link href="/sign-up">
            Post a Job
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
