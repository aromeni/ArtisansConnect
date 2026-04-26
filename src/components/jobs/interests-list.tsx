"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Star, Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { shortlistTradespersonAction, hireAction } from "@/server/actions/jobs";

type Interest = {
  id: string;
  coverLetter: string | null;
  estimatedCostPesewas: number | null;
  estimatedDuration: string | null;
  availableFrom: Date | null;
  status: string;
  createdAt: Date;
  tradesperson: {
    id: string;
    businessName: string | null;
    bio: string | null;
    yearsOfExperience: number | null;
    verificationStatus: string;
    averageRating: { toNumber(): number } | number | null;
    totalReviews: number;
    totalJobsCompleted: number;
    user: { name: string | null; image: string | null };
    categories: { category: { name: string }; isPrimary: boolean }[];
  };
};

interface InterestsListProps {
  jobId: string;
  interests: Interest[];
  jobStatus: string;
}

export function InterestsList({ jobId, interests, jobStatus }: InterestsListProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hireConfirm, setHireConfirm] = useState<{ tradespersonId: string; amount: number } | null>(null);
  const [hireAmount, setHireAmount] = useState<string>("");

  const isJobHireable = ["OPEN", "MATCHED", "SHORTLISTED"].includes(jobStatus);

  async function handleShortlist(tradespersonId: string) {
    setLoading(tradespersonId);
    setError(null);
    const result = await shortlistTradespersonAction(jobId, tradespersonId);
    if ("error" in result) setError(result.error);
    setLoading(null);
  }

  async function openHireDialog(interest: Interest) {
    const amount = interest.estimatedCostPesewas ?? 0;
    setHireAmount(amount ? String(amount / 100) : "");
    setHireConfirm({ tradespersonId: interest.tradesperson.id, amount });
  }

  async function confirmHire() {
    if (!hireConfirm) return;
    const pesewas = Math.round(parseFloat(hireAmount) * 100);
    if (!pesewas || pesewas <= 0) {
      setError("Enter a valid agreed amount");
      return;
    }
    setLoading("hire");
    setError(null);
    const result = await hireAction(jobId, hireConfirm.tradespersonId, pesewas);
    if (result && "error" in result) {
      setError(result.error);
      setLoading(null);
    }
    // On success, hireAction redirects — no cleanup needed
  }

  if (interests.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p className="font-medium">No applications yet</p>
        <p className="text-sm mt-1">
          Tradespeople matching your job will be able to express interest once the job is published.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded px-3 py-2">
          {error}
        </p>
      )}

      {/* Hire confirmation dialog */}
      {hireConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl border border-border shadow-lg p-6 max-w-sm w-full space-y-4">
            <h3 className="font-semibold text-lg">Confirm hire</h3>
            <p className="text-sm text-muted-foreground">
              Enter the agreed payment amount. This will be held by the platform until you confirm the job is complete.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1.5">Agreed amount (GHS)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={hireAmount}
                onChange={(e) => setHireAmount(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. 500"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button
                onClick={confirmHire}
                loading={loading === "hire"}
                className="flex-1"
              >
                Confirm & Hire
              </Button>
              <Button
                variant="outline"
                onClick={() => { setHireConfirm(null); setError(null); }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {interests.map((interest) => {
        const isExpanded = expanded === interest.id;
        const tp = interest.tradesperson;
        const primaryCat = tp.categories.find((c) => c.isPrimary)?.category.name;
        const isShortlisted = interest.status === "SHORTLISTED";
        const isHired = interest.status === "HIRED";
        const isDeclined = ["DECLINED", "WITHDRAWN"].includes(interest.status);

        return (
          <Card
            key={interest.id}
            className={`${isHired ? "border-primary-300 bg-primary-50/20" : isDeclined ? "opacity-50" : ""}`}
          >
            <CardContent className="pt-5 pb-4 space-y-3">
              {/* Header row */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0 font-bold text-primary-700">
                  {tp.user.name?.charAt(0) ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-sm">{tp.user.name}</span>
                    {tp.verificationStatus === "VERIFIED" && (
                      <ShieldCheck className="h-4 w-4 text-primary-600 shrink-0" />
                    )}
                    {isHired && <Badge variant="success">Hired</Badge>}
                    {isShortlisted && <Badge variant="warning">Shortlisted</Badge>}
                  </div>
                  {primaryCat && (
                    <p className="text-xs text-muted-foreground">{primaryCat}</p>
                  )}
                </div>

                {/* Quote */}
                <div className="text-right shrink-0">
                  {interest.estimatedCostPesewas ? (
                    <p className="font-semibold text-sm">
                      GHS {(interest.estimatedCostPesewas / 100).toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Quote TBD</p>
                  )}
                  {interest.estimatedDuration && (
                    <p className="text-xs text-muted-foreground">{interest.estimatedDuration}</p>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-secondary-400 text-secondary-400" />
                  {tp.averageRating
                    ? (typeof tp.averageRating === "number"
                        ? tp.averageRating
                        : tp.averageRating.toNumber()
                      ).toFixed(1)
                    : "New"}
                  {tp.totalReviews > 0 && ` (${tp.totalReviews})`}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {tp.totalJobsCompleted} jobs
                </span>
                {tp.yearsOfExperience != null && <span>{tp.yearsOfExperience} yrs exp</span>}
              </div>

              {/* Expandable cover letter */}
              {interest.coverLetter && (
                <div>
                  <p className={`text-sm text-muted-foreground ${isExpanded ? "" : "line-clamp-2"}`}>
                    {interest.coverLetter}
                  </p>
                  <button
                    className="text-xs text-primary-600 flex items-center gap-1 mt-1 hover:underline"
                    onClick={() => setExpanded(isExpanded ? null : interest.id)}
                  >
                    {isExpanded ? (
                      <><ChevronUp className="h-3 w-3" /> Show less</>
                    ) : (
                      <><ChevronDown className="h-3 w-3" /> Read more</>
                    )}
                  </button>
                </div>
              )}

              {/* Actions */}
              {isJobHireable && !isHired && !isDeclined && (
                <div className="flex gap-2 pt-1">
                  {!isShortlisted && (
                    <Button
                      variant="outline"
                      size="sm"
                      loading={loading === tp.id}
                      onClick={() => handleShortlist(tp.id)}
                    >
                      Shortlist
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => openHireDialog(interest)}
                  >
                    Hire
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
