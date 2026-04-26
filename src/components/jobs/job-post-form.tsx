"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createJobAction, publishJobAction } from "@/server/actions/jobs";
import { GHANA_REGIONS_DISPLAY } from "@/lib/utils/regions";
import { X, Upload } from "lucide-react";

const URGENCY_OPTIONS = [
  { value: "FLEXIBLE",       label: "Flexible — no rush" },
  { value: "WITHIN_A_MONTH", label: "Within a month" },
  { value: "WITHIN_A_WEEK",  label: "Within a week" },
  { value: "URGENT",         label: "Urgent — as soon as possible" },
];

const PROPERTY_OPTIONS = [
  { value: "HOUSE",      label: "House / Villa" },
  { value: "APARTMENT",  label: "Apartment / Flat" },
  { value: "COMMERCIAL", label: "Commercial / Office" },
  { value: "LAND",       label: "Land / Plot" },
  { value: "OTHER",      label: "Other" },
];

type Category = { id: string; name: string; slug: string };

interface UploadedImage {
  publicId: string;
  url: string;
  name: string;
}

interface CloudinarySignResponse {
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  cloudName: string;
}

interface CloudinaryUploadResponse {
  public_id?: string;
  secure_url?: string;
  error?: { message?: string };
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

const formSchema = z.object({
  title:         z.string().min(5, "Title must be at least 5 characters").max(200),
  description:   z.string().min(30, "Description must be at least 30 characters").max(5000),
  categoryId:    z.string().min(1, "Select a trade category"),
  region:        z.string().min(1, "Select a region"),
  city:          z.string().max(100).optional(),
  propertyType:  z.string().optional(),
  budgetType:    z.enum(["FIXED", "RANGE", "REQUEST_QUOTE"]),
  budgetMinGHS:  z.string().optional(),
  budgetMaxGHS:  z.string().optional(),
  urgency:       z.string().min(1),
}).refine(
  (d) => {
    if (d.budgetType === "FIXED" && !d.budgetMinGHS) return false;
    if (d.budgetType === "RANGE" && (!d.budgetMinGHS || !d.budgetMaxGHS)) return false;
    return true;
  },
  { message: "Enter budget amount(s)", path: ["budgetMinGHS"] }
);

type FormValues = z.infer<typeof formSchema>;

interface JobPostFormProps {
  categories: Category[];
  defaultRegion?: string;
}

export function JobPostForm({ categories, defaultRegion }: JobPostFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budgetType: "REQUEST_QUOTE",
      urgency: "FLEXIBLE",
      region: defaultRegion ?? "",
    },
  });

  const budgetType = watch("budgetType");

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (images.length + files.length > 5) {
      setServerError("Maximum 5 images allowed");
      return;
    }

    setUploading(true);
    setServerError(null);

    try {
      // Get signed params from server
      const signRes = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "jobs" }),
      });
      const signData = (await signRes.json()) as Partial<CloudinarySignResponse> & {
        error?: string;
      };
      if (!signRes.ok) throw new Error(signData.error ?? "Failed to get upload signature");
      if (
        !signData.apiKey ||
        !signData.timestamp ||
        !signData.signature ||
        !signData.folder ||
        !signData.cloudName
      ) {
        throw new Error("Upload signature response was incomplete");
      }

      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", signData.apiKey);
        fd.append("timestamp", String(signData.timestamp));
        fd.append("signature", signData.signature);
        fd.append("folder", signData.folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
          { method: "POST", body: fd }
        );
        const uploadData = (await uploadRes.json()) as CloudinaryUploadResponse;
        if (uploadData.error) throw new Error(uploadData.error.message ?? "Upload failed");
        if (!uploadData.public_id || !uploadData.secure_url) {
          throw new Error("Upload response was incomplete");
        }
        const uploadedImage: UploadedImage = {
          publicId: uploadData.public_id,
          url: uploadData.secure_url,
          name: file.name,
        };

        setImages((prev) => [...prev, uploadedImage]);
      }
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);

    const budgetMin =
      values.budgetMinGHS ? Math.round(parseFloat(values.budgetMinGHS) * 100) : undefined;
    const budgetMax =
      values.budgetMaxGHS ? Math.round(parseFloat(values.budgetMaxGHS) * 100) : undefined;

    const result = await createJobAction({
      title: values.title,
      description: values.description,
      categoryId: values.categoryId,
      region: values.region,
      city: values.city || undefined,
      propertyType: values.propertyType || undefined,
      budgetType: values.budgetType,
      budgetMin,
      budgetMax,
      urgency: values.urgency,
      imagePublicIds: images.map((i) => i.publicId),
    });

    if ("error" in result) {
      setServerError(result.error);
      return;
    }

    if (result.jobId) {
      // Auto-publish on creation
      await publishJobAction(result.jobId);
      // publishJobAction redirects on success, so we only reach here on error
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {serverError && (
        <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3">
          {serverError}
        </p>
      )}

      {/* Section 1: What do you need? */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg border-b border-border pb-2">What do you need?</h2>

        <div className="space-y-1.5">
          <Label htmlFor="categoryId" required>Trade category</Label>
          <Select onValueChange={(v) => setValue("categoryId", v)}>
            <SelectTrigger id="categoryId" className={errors.categoryId ? "border-destructive" : ""}>
              <SelectValue placeholder="Select a trade…" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-sm text-destructive">{errors.categoryId.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title" required>Job title</Label>
          <Input
            id="title"
            placeholder="e.g. Electrical fault repair in kitchen, Re-tiling bathroom floor"
            {...register("title")}
            error={errors.title?.message}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" required>Description</Label>
          <Textarea
            id="description"
            rows={6}
            placeholder="Describe the work in detail. Include what needs to be done, current condition, access notes, materials needed, and any relevant context. The more detail you provide, the better quotes you'll receive."
            {...register("description")}
            error={errors.description?.message}
          />
          <p className="text-xs text-muted-foreground">Minimum 30 characters</p>
        </div>
      </section>

      {/* Section 2: Location */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg border-b border-border pb-2">Where is the job?</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="region" required>Region</Label>
            <Select
              defaultValue={defaultRegion}
              onValueChange={(v) => setValue("region", v)}
            >
              <SelectTrigger id="region" className={errors.region ? "border-destructive" : ""}>
                <SelectValue placeholder="Select region…" />
              </SelectTrigger>
              <SelectContent>
                {GHANA_REGIONS_DISPLAY.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.region && (
              <p className="text-sm text-destructive">{errors.region.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city">City / Town</Label>
            <Input id="city" placeholder="e.g. East Legon, Kumasi" {...register("city")} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="propertyType">Property type</Label>
          <Select onValueChange={(v) => setValue("propertyType", v)}>
            <SelectTrigger id="propertyType">
              <SelectValue placeholder="Select property type (optional)…" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Section 3: Budget & Timeline */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg border-b border-border pb-2">Budget & timeline</h2>

        {/* Budget type toggle */}
        <div className="space-y-1.5">
          <Label required>Budget type</Label>
          <div className="grid grid-cols-3 gap-2">
            {(["FIXED", "RANGE", "REQUEST_QUOTE"] as const).map((bt) => (
              <button
                key={bt}
                type="button"
                onClick={() => setValue("budgetType", bt)}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                  budgetType === bt
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-border hover:border-primary-300 text-muted-foreground"
                }`}
              >
                {bt === "FIXED"
                  ? "Fixed price"
                  : bt === "RANGE"
                  ? "Price range"
                  : "Open to quotes"}
              </button>
            ))}
          </div>
        </div>

        {budgetType === "FIXED" && (
          <div className="space-y-1.5">
            <Label htmlFor="budgetMinGHS" required>Budget amount (GHS)</Label>
            <Input
              id="budgetMinGHS"
              type="number"
              min="1"
              step="0.01"
              placeholder="e.g. 500"
              {...register("budgetMinGHS")}
              error={errors.budgetMinGHS?.message}
            />
          </div>
        )}

        {budgetType === "RANGE" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="budgetMinGHS" required>Minimum (GHS)</Label>
              <Input
                id="budgetMinGHS"
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 300"
                {...register("budgetMinGHS")}
                error={errors.budgetMinGHS?.message}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budgetMaxGHS" required>Maximum (GHS)</Label>
              <Input
                id="budgetMaxGHS"
                type="number"
                min="1"
                step="0.01"
                placeholder="e.g. 800"
                {...register("budgetMaxGHS")}
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="urgency">Timeline</Label>
          <Select
            defaultValue="FLEXIBLE"
            onValueChange={(v) => setValue("urgency", v)}
          >
            <SelectTrigger id="urgency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {URGENCY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Section 4: Photos */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg border-b border-border pb-2">
          Photos <span className="text-sm font-normal text-muted-foreground">(optional, up to 5)</span>
        </h2>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((img) => (
              <div key={img.publicId} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.name}
                  className="h-20 w-20 object-cover rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((i) => i.publicId !== img.publicId))}
                  className="absolute -top-2 -right-2 h-5 w-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length < 5 && (
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary-400 transition-colors">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              {uploading ? (
                <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full" />
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span className="text-sm">Click to upload photos</span>
                  <span className="text-xs">JPG, PNG or WebP up to 10 MB</span>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        )}
      </section>

      <div className="border-t border-border pt-6 flex flex-col sm:flex-row gap-3">
        <Button
          type="submit"
          size="lg"
          loading={isSubmitting || uploading}
          className="sm:w-auto"
        >
          Post Job
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
