"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { z } from "zod";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

const credentialsSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(72),
});

// Wrapping in a Sub-component to handle useSearchParams safely in Next.js 13/14+
function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const { signIn, signUp, user, loading } = useAuth();

  const [mode, setMode] = useState(modeParam === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // useEffect(() => {
  //   if (!loading && user) {
  //     router.push("/home");
  //   }
  // }, [user, loading, router]);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const parsed = credentialsSchema.safeParse({ email, password });
    
  //   if (!parsed.success) {
  //     toast.error(parsed.error.issues[0].message);
  //     return;
  //   }

  //   setSubmitting(true);

  //   try {
  //     const { error } =
  //       mode === "signin"
  //         ? await signIn(parsed.data.email, parsed.data.password)
  //         : await signUp(parsed.data.email, parsed.data.password);

  //     if (error) throw error;

  //     toast.success(mode === "signin" ? "Welcome back!" : "Check your email to confirm!");
  //     if (mode === "signin") router.push("/home");
      
  //   } catch (error: any) {
  //     toast.error(error.message || "Authentication failed");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const parsed = credentialsSchema.safeParse({
    email,
    password,
  });

  if (!parsed.success) {
    toast.error(parsed.error.issues[0].message);
    return;
  }

  setSubmitting(true);

  try {
    const { error } =
      mode === "signin"
        ? await signIn(parsed.data.email, parsed.data.password)
        : await signUp(parsed.data.email, parsed.data.password);

    if (error) throw error;

    toast.success(
      mode === "signin"
        ? "Successfully logged in!"
        : "Account created successfully!"
    );

    // Small delay so toast appears before navigation
    setTimeout(() => {
      router.replace("/home");
    }, 1000);

  } catch (error: any) {
    toast.error(error.message || "Authentication failed");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="w-full max-w-md">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">
              {mode === "signin" ? "Welcome back" : "Create your space"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "signin" ? "Sign in to your tasks" : "Start with a free account"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <p>New here? <button onClick={() => setMode("signup")} className="font-medium text-primary hover:underline">Create an account</button></p>
          ) : (
            <p>Already have one? <button onClick={() => setMode("signin")} className="font-medium text-primary hover:underline">Sign in</button></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-slate-50">
      <Suspense fallback={<Loader2 className="animate-spin" />}>
        <AuthForm />
      </Suspense>
    </div>
  );
}