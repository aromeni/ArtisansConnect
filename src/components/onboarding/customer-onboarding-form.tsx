"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { z } from "zod";
import { customerOnboardingSchema } from "@/lib/validation/schemas";
import { completeCustomerOnboarding } from "@/server/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GHANA_REGIONS_DISPLAY } from "@/lib/utils/regions";

type FormValues = z.infer<typeof customerOnboardingSchema>;

export function CustomerOnboardingForm() {
  const [isPending, startTransition] = useTransition();
  const [region, setRegion] = useState<FormValues["region"] | undefined>();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(customerOnboardingSchema) });

  function onSubmit(data: FormValues) {
    startTransition(async () => {
      const result = await completeCustomerOnboarding(data);
      if (result && "error" in result) {
        setError("root", { message: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errors.root && (
        <Alert variant="destructive">{errors.root.message}</Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="phone" required>Phone number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="0244 000 000"
          autoComplete="tel"
          error={!!errors.phone}
          {...register("phone")}
        />
        {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
        <p className="text-xs text-muted-foreground">Used for job alerts and contact.</p>
      </div>

      <div className="space-y-1.5">
        <Label required>Region</Label>
        <Select
          value={region}
          onValueChange={(v) => {
            const nextRegion = v as FormValues["region"];
            setRegion(nextRegion);
            setValue("region", nextRegion, { shouldValidate: true, shouldDirty: true });
          }}
        >
          <SelectTrigger error={!!errors.region}>
            <SelectValue placeholder="Select your region" />
          </SelectTrigger>
          <SelectContent>
            {GHANA_REGIONS_DISPLAY.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.region && <p className="text-xs text-red-600">{errors.region.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="city">City / Town</Label>
        <Input
          id="city"
          placeholder="e.g. Accra, Kumasi, Tamale"
          error={!!errors.city}
          {...register("city")}
        />
        {errors.city && <p className="text-xs text-red-600">{errors.city.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Home address</Label>
        <Input
          id="address"
          placeholder="Optional — helps match nearby tradespeople"
          error={!!errors.address}
          {...register("address")}
        />
      </div>

      <Button type="submit" className="w-full" size="lg" loading={isPending}>
        {isPending ? "Saving…" : "Complete setup"}
      </Button>
    </form>
  );
}
