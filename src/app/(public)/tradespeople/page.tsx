import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { parseGhanaRegion } from "@/lib/validation/params";
import { getPublicCategories, getPublicTradespeople } from "@/server/queries/public";
import { ShieldCheck, Star, MapPin, ArrowRight } from "lucide-react";

interface SearchParams {
  category?: string;
  region?: string;
}

export default async function TradespersonDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const region = parseGhanaRegion(params.region);

  const [tradespeople, categories] = await Promise.all([
    getPublicTradespeople({ category: params.category, region }),
    getPublicCategories({ take: 8 }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold">Find a Tradesperson</h1>
        <p className="text-muted-foreground mt-2">
          Browse verified professionals. All have passed Ghana Card identity review.
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/tradespeople">
          <Badge
            variant={!params.category ? "default" : "outline"}
            className="cursor-pointer text-sm px-3 py-1"
          >
            All trades
          </Badge>
        </Link>
        {categories.slice(0, 8).map((c) => (
          <Link key={c.name} href={`/tradespeople?category=${encodeURIComponent(c.name)}`}>
            <Badge
              variant={params.category === c.name ? "default" : "outline"}
              className="cursor-pointer text-sm px-3 py-1"
            >
              {c.name}
            </Badge>
          </Link>
        ))}
      </div>

      {tradespeople.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No tradespeople found for this filter.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/tradespeople">Clear filters</Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tradespeople.map((tp) => (
            <Card key={tp.id} className="hover:border-primary-300 hover:shadow-sm transition-all">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  {/* Avatar placeholder */}
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center shrink-0 text-primary-700 font-bold text-lg">
                    {tp.user.name?.charAt(0) ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold truncate">{tp.user.name}</p>
                      <ShieldCheck className="h-4 w-4 text-primary-600 shrink-0" aria-label="Identity verified" />
                    </div>
                    {tp.categories[0] && (
                      <p className="text-sm text-muted-foreground">{tp.categories[0].category.name}</p>
                    )}
                  </div>
                </div>

                {tp.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{tp.bio}</p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-secondary-400 text-secondary-400" />
                    <span className="font-medium text-foreground">
                      {tp.averageRating ? tp.averageRating.toFixed(1) : "New"}
                    </span>
                    {tp.totalReviews > 0 && (
                      <span className="text-muted-foreground">({tp.totalReviews})</span>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    {tp.totalJobsCompleted} job{tp.totalJobsCompleted !== 1 ? "s" : ""}
                  </span>
                </div>

                {tp.serviceAreas.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {tp.serviceAreas.map((a) => a.region.replace(/_/g, " ")).join(", ")}
                  </div>
                )}

                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/sign-up">
                    View profile & get a quote
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-12 border-t border-border pt-10 text-center">
        <h2 className="text-xl font-bold">Can&apos;t find the right fit?</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Post your job and let verified tradespeople come to you with quotes.
        </p>
        <Button asChild className="mt-5">
          <Link href="/sign-up">Post a Job — it&apos;s free</Link>
        </Button>
      </div>
    </div>
  );
}
