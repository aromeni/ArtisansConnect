"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitInterestAction, withdrawInterestAction } from "@/server/actions/jobs";

const clientSchema = z.object({
  coverLetter: z.string().min(30, "Must be at least 30 characters").max(2000),
  estimatedCostGHS: z.string().optional(),
  estimatedDuration: z.string().max(100).optional(),
});

type FormValues = z.infer<typeof clientSchema>;

interface InterestFormProps {
  jobId: string;
  existingInterest?: {
    status: string;
    coverLetter: string | null;
    estimatedCostPesewas: number | null;
    estimatedDuration: string | null;
  } | null;
}

export function InterestForm({ jobId, existingInterest }: InterestFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const hasActiveInterest =
    existingInterest &&
    !["WITHDRAWN", "DECLINED"].includes(existingInterest.status);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      coverLetter: existingInterest?.coverLetter ?? "",
      estimatedCostGHS: existingInterest?.estimatedCostPesewas
        ? String(existingInterest.estimatedCostPesewas / 100)
        : "",
      estimatedDuration: existingInterest?.estimatedDuration ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const estimatedCostPesewas = values.estimatedCostGHS
      ? Math.round(parseFloat(values.estimatedCostGHS) * 100)
      : undefined;

    const result = await submitInterestAction({
      jobId,
      coverLetter: values.coverLetter,
      estimatedCostPesewas,
      estimatedDuration: values.estimatedDuration || undefined,
    });

    if ("error" in result) {
      setServerError(result.error);
    } else {
      setSubmitted(true);
    }
  }

  async function handleWithdraw() {
    setWithdrawing(true);
    const result = await withdrawInterestAction(jobId);
    if ("error" in result) {
      setServerError(result.error);
      setWithdrawing(false);
    }
  }

  if (submitted || (hasActiveInterest && !submitted)) {
    const isHired = existingInterest?.status === "HIRED";
    const isShortlisted = existingInterest?.status === "SHORTLISTED";

    if (hasActiveInterest && !submitted) {
      return (
        <div className="space-y-4">
          <div className={`rounded-lg border p-4 ${isHired ? "border-success bg-success/5" : isShortlisted ? "border-warning bg-warning/5" : "border-primary-200 bg-primary-50/30"}`}>
            <p className="font-medium text-sm">
              {isHired
                ? "You've been hired for this job!"
                : isShortlisted
                ? "You've been shortlisted — the customer is interested."
                : "Your quote has been submitted."}
            </p>
            {existingInterest?.estimatedCostPesewas && (
              <p className="text-sm text-muted-foreground mt-1">
                Your quote: GHS {(existingInterest.estimatedCostPesewas / 100).toLocaleString()}
              </p>
            )}
            {existingInterest?.coverLetter && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
                {existingInterest.coverLetter}
              </p>
            )}
          </div>

          {!isHired && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={handleWithdraw}
              loading={withdrawing}
            >
              Withdraw application
            </Button>
          )}

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-primary-200 bg-primary-50/30 p-4">
        <p className="font-medium text-sm text-primary-700">Quote submitted successfully!</p>
        <p className="text-sm text-muted-foreground mt-1">
          The customer will be notified. You&apos;ll receive a message if you&apos;re shortlisted or hired.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded px-3 py-2">
          {serverError}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="coverLetter" required>
          Cover letter
        </Label>
        <Textarea
          id="coverLetter"
          rows={5}
          placeholder="Introduce yourself and explain why you're the right person for this job. Mention your relevant experience and how you'd approach it..."
          {...register("coverLetter")}
          error={errors.coverLetter?.message}
        />
        <p className="text-xs text-muted-foreground">Minimum 30 characters</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="estimatedCostGHS">Your quote (GHS)</Label>
          <Input
            id="estimatedCostGHS"
            type="number"
            min="1"
            step="0.01"
            placeholder="e.g. 500"
            {...register("estimatedCostGHS")}
          />
          <p className="text-xs text-muted-foreground">Optional — leave blank if you need to assess first</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="estimatedDuration">Estimated duration</Label>
          <Input
            id="estimatedDuration"
            type="text"
            placeholder="e.g. 2 days, 1 week"
            maxLength={100}
            {...register("estimatedDuration")}
          />
        </div>
      </div>

      <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
        Submit quote
      </Button>
    </form>
  );
}
