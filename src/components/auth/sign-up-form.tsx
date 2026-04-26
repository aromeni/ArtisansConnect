"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { signUpAction } from "@/server/actions/auth";
import { signUpSchema } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Home, HardHat, CheckCircle2 } from "lucide-react";

type FormValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<"CUSTOMER" | "TRADESPERSON">("CUSTOMER");

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { role: "CUSTOMER" },
  });

  function selectRole(role: "CUSTOMER" | "TRADESPERSON") {
    setSelectedRole(role);
    setValue("role", role);
  }

  function onSubmit(data: FormValues) {
    startTransition(async () => {
      const result = await signUpAction(data);
      if (result && "error" in result) {
        setError("root", { message: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errors.root && (
        <Alert variant="destructive">{errors.root.message}</Alert>
      )}

      {/* Role selection */}
      <div className="space-y-2">
        <Label required>I want to…</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              role: "CUSTOMER" as const,
              label: "Hire a tradesperson",
              sub: "Post jobs & get quotes",
              Icon: Home,
            },
            {
              role: "TRADESPERSON" as const,
              label: "Find work",
              sub: "Build your client base",
              Icon: HardHat,
            },
          ].map(({ role, label, sub, Icon }) => (
            <button
              key={role}
              type="button"
              onClick={() => selectRole(role)}
              className={cn(
                "relative flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all",
                selectedRole === role
                  ? "border-primary-600 bg-primary-50"
                  : "border-border hover:border-primary-300 bg-background"
              )}
            >
              {selectedRole === role && (
                <CheckCircle2 className="absolute top-3 right-3 h-4 w-4 text-primary-600" />
              )}
              <Icon className={cn("h-5 w-5", selectedRole === role ? "text-primary-600" : "text-muted-foreground")} />
              <span className={cn("text-sm font-semibold", selectedRole === role ? "text-primary-700" : "text-foreground")}>
                {label}
              </span>
              <span className="text-xs text-muted-foreground">{sub}</span>
            </button>
          ))}
        </div>
        <input type="hidden" {...register("role")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name" required>Full name</Label>
        <Input
          id="name"
          placeholder="Kwame Mensah"
          autoComplete="name"
          error={!!errors.name}
          {...register("name")}
        />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="su-email" required>Email address</Label>
        <Input
          id="su-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={!!errors.email}
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="su-password" required>Password</Label>
        <Input
          id="su-password"
          type="password"
          placeholder="Min. 8 characters, 1 uppercase, 1 number"
          autoComplete="new-password"
          error={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" loading={isPending}>
        {isPending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        By signing up you agree to our{" "}
        <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
        {" "}and{" "}
        <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
      </p>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-primary-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
