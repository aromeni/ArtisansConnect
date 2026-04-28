"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { signInAction } from "@/server/actions/auth";
import { signInSchema } from "@/lib/validation/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

type FormValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(signInSchema) });

  function onSubmit(data: FormValues) {
    startTransition(async () => {
      const result = await signInAction({ ...data, redirectTo: callbackUrl });
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

      <div className="space-y-1.5">
        <Label htmlFor="email" required>Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" required>Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-primary-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            error={!!errors.password}
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute inset-y-0 right-0 flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" loading={isPending}>
        {isPending ? "Signing in…" : "Sign In"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-primary-600 font-medium hover:underline">
          Sign up free
        </Link>
      </p>
    </form>
  );
}
