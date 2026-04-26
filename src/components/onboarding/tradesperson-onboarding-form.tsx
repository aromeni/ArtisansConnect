"use client";

import { useState, useTransition, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import {
  tradespersonOnboardingStep1Schema,
  tradespersonOnboardingStep2Schema,
} from "@/lib/validation/schemas";
import {
  saveTradespersonProfile,
  submitTradespersonVerification,
} from "@/server/actions/onboarding";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GHANA_REGIONS_DISPLAY } from "@/lib/utils/regions";
import { Check, Upload, X, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Step1Values = z.infer<typeof tradespersonOnboardingStep1Schema>;
type Step2Values = z.infer<typeof tradespersonOnboardingStep2Schema>;

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

interface Props {
  categories: Category[];
}

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Your profile", "Verify identity", "Submitted"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const step = (i + 1) as 1 | 2 | 3;
        const done = current > step;
        const active = current === step;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold border-2 transition-colors",
                  done && "bg-primary-600 border-primary-600 text-white",
                  active && "bg-white border-primary-600 text-primary-600",
                  !done && !active && "bg-white border-border text-muted-foreground"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : step}
              </div>
              <span className={cn("text-xs font-medium hidden sm:block",
                active ? "text-primary-600" : "text-muted-foreground"
              )}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("h-0.5 flex-1 mx-2 transition-colors", done ? "bg-primary-600" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Document upload widget ────────────────────────────────────────────────────

function DocumentUpload({
  label,
  hint,
  onUploaded,
  folder,
}: {
  label: string;
  hint: string;
  onUploaded: (publicId: string, url: string) => void;
  folder: "ids" | "profiles";
}) {
  const { upload, uploading, progress, error, reset } = useCloudinaryUpload();
  const [preview, setPreview] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file));
    try {
      const result = await upload(file, folder);
      onUploaded(result.publicId, result.secureUrl);
      setDone(true);
    } catch {
      setPreview(null);
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <p className="text-xs text-muted-foreground">{hint}</p>

      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed p-8",
            "transition-colors hover:border-primary-400 hover:bg-primary-50 cursor-pointer",
            error ? "border-red-400 bg-red-50" : "border-border bg-surface"
          )}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm font-medium">Click to upload</span>
          <span className="text-xs text-muted-foreground">JPG, PNG, WebP up to 10 MB</span>
        </button>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-border">
          <div className="relative h-44 w-full bg-muted">
            <Image src={preview} alt={label} fill className="object-cover" />
          </div>
          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm font-medium">{progress}%</span>
            </div>
          )}
          {done && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
              <CheckCircle2 className="h-3 w-3" /> Uploaded
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={() => { setPreview(null); setDone(false); reset(); }}
              className="absolute top-2 left-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Region multi-select ───────────────────────────────────────────────────────

function RegionMultiSelect({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  error?: boolean;
}) {
  function toggle(region: string) {
    onChange(
      value.includes(region) ? value.filter((r) => r !== region) : [...value, region]
    );
  }

  return (
    <div className="space-y-2">
      <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-xl border p-3",
        error ? "border-red-400" : "border-border"
      )}>
        {GHANA_REGIONS_DISPLAY.map(({ value: v, label }) => (
          <button
            key={v}
            type="button"
            onClick={() => toggle(v)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left transition-colors",
              value.includes(v)
                ? "bg-primary-600 text-white font-medium"
                : "bg-muted hover:bg-primary-50 hover:text-primary-700"
            )}
          >
            {value.includes(v) && <Check className="h-3 w-3 shrink-0" />}
            {label}
          </button>
        ))}
      </div>
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground">{value.length} region{value.length !== 1 ? "s" : ""} selected</p>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function TradespersonOnboardingForm({ categories }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isPending, startTransition] = useTransition();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [primaryCategoryId, setPrimaryCategoryId] = useState<string>("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // Step 2 upload state
  const [cardFrontPublicId, setCardFrontPublicId] = useState("");
  const [selfiePublicId, setSelfiePublicId] = useState("");

  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(tradespersonOnboardingStep1Schema),
  });

  const step2Form = useForm<Step2Values>({
    resolver: zodResolver(tradespersonOnboardingStep2Schema),
  });

  function toggleCategory(id: string) {
    const next = selectedCategories.includes(id)
      ? selectedCategories.filter((c) => c !== id)
      : [...selectedCategories, id];
    setSelectedCategories(next);
    if (!next.includes(primaryCategoryId)) setPrimaryCategoryId(next[0] ?? "");
  }

  function handleStep1Submit(data: Step1Values) {
    startTransition(async () => {
      const result = await saveTradespersonProfile({
        ...data,
        categoryIds: selectedCategories,
        primaryCategoryId,
        serviceRegions: selectedRegions as Step1Values["serviceRegions"],
      });
      if (result && "error" in result) {
        step1Form.setError("root", { message: result.error });
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function handleStep2Submit(data: Step2Values) {
    if (!cardFrontPublicId) {
      step2Form.setError("ghanaCardFrontPublicId", { message: "Ghana Card image is required" });
      return;
    }
    if (!selfiePublicId) {
      step2Form.setError("selfiePublicId", { message: "Selfie photo is required" });
      return;
    }

    startTransition(async () => {
      const result = await submitTradespersonVerification({
        ...data,
        ghanaCardFrontPublicId: cardFrontPublicId,
        selfiePublicId,
      });
      if (result && "error" in result) {
        step2Form.setError("root", { message: result.error });
      }
      // On success, server action redirects to /tradesperson/dashboard
    });
  }

  // ── Step 3: confirmation ───────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="text-center py-12 space-y-4">
        <ShieldCheck className="h-16 w-16 text-primary-600 mx-auto" />
        <h2 className="text-2xl font-bold">Application submitted!</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Our team will review your Ghana Card details within 1–2 business days.
          You&apos;ll receive an email once verified.
        </p>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator current={step} />

      {/* ── Step 1: Profile ────────────────────────────────────────────────── */}
      {step === 1 && (
        <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-6">
          {step1Form.formState.errors.root && (
            <Alert variant="destructive">{step1Form.formState.errors.root.message}</Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="businessName">Business / trading name</Label>
            <Input
              id="businessName"
              placeholder="e.g. Mensah Plumbing Services (optional)"
              {...step1Form.register("businessName")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" required>Phone number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0244 000 000"
              error={!!step1Form.formState.errors.phone}
              {...step1Form.register("phone")}
            />
            {step1Form.formState.errors.phone && (
              <p className="text-xs text-red-600">{step1Form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio" required>About you</Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder="Describe your skills, experience, and what makes you stand out (min. 50 characters)…"
              error={!!step1Form.formState.errors.bio}
              {...step1Form.register("bio")}
            />
            {step1Form.formState.errors.bio && (
              <p className="text-xs text-red-600">{step1Form.formState.errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label required>Years of experience</Label>
            <Select
              onValueChange={(v) =>
                step1Form.setValue("yearsOfExperience", Number(v))
              }
            >
              <SelectTrigger error={!!step1Form.formState.errors.yearsOfExperience}>
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n === 0 ? "Less than 1 year" : `${n}+ years`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label required>Your trades</Label>
            <p className="text-xs text-muted-foreground">
              Select all that apply. Tap once to select, tap again to remove.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const selected = selectedCategories.includes(cat.id);
                const isPrimary = primaryCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      "relative flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm text-left transition-all",
                      selected
                        ? "border-primary-600 bg-primary-50 text-primary-700 font-medium"
                        : "border-border bg-background hover:border-primary-300"
                    )}
                  >
                    {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    <span>{cat.name}</span>
                    {isPrimary && selected && (
                      <Badge variant="default" className="ml-auto text-[10px] py-0">
                        Primary
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedCategories.length > 1 && (
              <div className="space-y-1.5 pt-1">
                <Label>Which is your primary trade?</Label>
                <Select
                  value={primaryCategoryId}
                  onValueChange={setPrimaryCategoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary trade" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategories.map((id) => {
                      const cat = categories.find((c) => c.id === id);
                      return cat ? (
                        <SelectItem key={id} value={id}>{cat.name}</SelectItem>
                      ) : null;
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
            {selectedCategories.length === 0 && (
              <p className="text-xs text-red-600">Select at least one trade category</p>
            )}
          </div>

          <div className="space-y-2">
            <Label required>Service regions</Label>
            <p className="text-xs text-muted-foreground">Which regions of Ghana do you work in?</p>
            <RegionMultiSelect
              value={selectedRegions}
              onChange={setSelectedRegions}
              error={selectedRegions.length === 0}
            />
            {selectedRegions.length === 0 && (
              <p className="text-xs text-red-600">Select at least one region</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isPending}
            disabled={selectedCategories.length === 0 || selectedRegions.length === 0}
          >
            {isPending ? "Saving…" : "Save & continue →"}
          </Button>
        </form>
      )}

      {/* ── Step 2: Identity verification ─────────────────────────────────── */}
      {step === 2 && (
        <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-6">
          {step2Form.formState.errors.root && (
            <Alert variant="destructive">{step2Form.formState.errors.root.message}</Alert>
          )}

          <Alert variant="warning">
            <p className="font-semibold text-sm">Why we verify identity</p>
            <p className="text-xs mt-1">
              Ghana Card verification builds trust on the platform and protects customers.
              Your documents are stored securely and only reviewed by our team.
            </p>
          </Alert>

          <div className="space-y-1.5">
            <Label htmlFor="cardNumber" required>Ghana Card number</Label>
            <Input
              id="cardNumber"
              placeholder="GHA-000000000-0"
              error={!!step2Form.formState.errors.ghanaCardNumber}
              {...step2Form.register("ghanaCardNumber")}
            />
            {step2Form.formState.errors.ghanaCardNumber && (
              <p className="text-xs text-red-600">
                {step2Form.formState.errors.ghanaCardNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cardName" required>Full name as on Ghana Card</Label>
            <Input
              id="cardName"
              placeholder="e.g. KOFI KWAME MENSAH"
              error={!!step2Form.formState.errors.ghanaCardName}
              {...step2Form.register("ghanaCardName")}
            />
            {step2Form.formState.errors.ghanaCardName && (
              <p className="text-xs text-red-600">
                {step2Form.formState.errors.ghanaCardName.message}
              </p>
            )}
          </div>

          <DocumentUpload
            label="Ghana Card — front"
            hint="Upload a clear photo of the front of your Ghana Card. Ensure all text is readable."
            folder="ids"
            onUploaded={(publicId) => {
              setCardFrontPublicId(publicId);
              step2Form.setValue("ghanaCardFrontPublicId", publicId);
              step2Form.clearErrors("ghanaCardFrontPublicId");
            }}
          />
          {step2Form.formState.errors.ghanaCardFrontPublicId && (
            <p className="text-xs text-red-600">
              {step2Form.formState.errors.ghanaCardFrontPublicId.message}
            </p>
          )}

          <DocumentUpload
            label="Selfie photo"
            hint="Take a clear selfie holding your Ghana Card next to your face. Both must be visible."
            folder="ids"
            onUploaded={(publicId) => {
              setSelfiePublicId(publicId);
              step2Form.setValue("selfiePublicId", publicId);
              step2Form.clearErrors("selfiePublicId");
            }}
          />
          {step2Form.formState.errors.selfiePublicId && (
            <p className="text-xs text-red-600">
              {step2Form.formState.errors.selfiePublicId.message}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep(1)}
              disabled={isPending}
            >
              ← Back
            </Button>
            <Button
              type="submit"
              className="flex-1"
              size="lg"
              loading={isPending}
            >
              {isPending ? "Submitting…" : "Submit for review →"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
