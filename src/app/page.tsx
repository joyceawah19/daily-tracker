// export const dynamic = "force-dynamic";
// "use client";
// import { useEffect } from "react";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import { ArrowRight, CheckCircle2, Calendar, Filter, Sparkles } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useAuth } from "@/lib/auth";

// export default function Landing() {
//   const { user, loading } = useAuth();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const modeParam = searchParams.get("mode");

//   useEffect(() => {
//     if (!loading && user) router.push("/");
//   }, [user, loading, router]);

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Nav */}
//       <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
//         <Link href="/" className="flex items-center gap-2">
//           <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] shadow-glow">
//             <Sparkles className="h-4 w-4 text-primary-foreground" />
//           </div>
//           <span className="font-display text-xl font-semibold tracking-tight">Sprig</span>
//         </Link>
//         <div className="flex items-center gap-2">
//           <Button variant="ghost" asChild>
//             <Link href="/auth">Sign in</Link>
//           </Button>
//           <Button variant="default" asChild>
//             <Link href="/auth?mode=signup">Get started</Link>
//           </Button>
//         </div>
//       </header>

//       {/* Hero */}
//       <section className="relative overflow-hidden">
//         <div
//           className="absolute inset-0 -z-10 opacity-60"
//           style={{ background: "var(--gradient-hero)" }}
//           aria-hidden
//         />
//         <div className="mx-auto max-w-4xl px-6 pt-16 pb-24 text-center md:pt-24 md:pb-32">
//           <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
//             <span className="h-1.5 w-1.5 rounded-full bg-success" />
//             Now with mindful task tracking
//           </div>
//           <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-7xl">
//             A calmer way to
//             <br />
//             <span className="italic text-primary">keep track</span> of your day.
//           </h1>
//           <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
//             Sprig is a quiet, focused task list. Capture what matters, set a date,
//             and feel the satisfying click of completion.
//           </p>
//           <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
//             <Button variant="default" size="lg" asChild>
//               <Link href="/auth?mode=signup">
//                 Start for free <ArrowRight className="h-4 w-4" />
//               </Link>
//             </Button>
//             <Button variant="outline" size="lg" asChild>
//               <Link href="/auth">I have an account</Link>
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* Features */}
//       <section className="mx-auto max-w-5xl px-6 pb-24">
//         <div className="grid gap-6 md:grid-cols-3">
//           {[
//             {
//               icon: CheckCircle2,
//               title: "One-tap done",
//               body: "Mark tasks complete with a satisfying check. Track your progress effortlessly.",
//             },
//             {
//               icon: Calendar,
//               title: "Gentle deadlines",
//               body: "Add a due date when it matters. Skip it when it doesn't. No pressure.",
//             },
//             {
//               icon: Filter,
//               title: "Focus filters",
//               body: "Show what's left, or look back at everything you've finished.",
//             },
//           ].map((f) => (
//             <div
//               key={f.title}
//               className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-elevated hover:-translate-y-1"
//             >
//               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
//                 <f.icon className="h-5 w-5" />
//               </div>
//               <h3 className="mt-4 font-display text-xl font-semibold">{f.title}</h3>
//               <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
//         Made with care · Sprig
//       </footer>
//     </div>
//   );
// }

"use client";

import { useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Calendar, Filter, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

// 1. Move your page logic into an internal component
function LandingContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");

  useEffect(() => {
    if (!loading && user) router.push("/");
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">Sprig</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/auth">Sign in</Link>
          </Button>
          <Button variant="default" asChild>
            <Link href="/auth?mode=signup">Get started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-60"
          style={{ background: "var(--gradient-hero)" }}
          aria-hidden
        />
        <div className="mx-auto max-w-4xl px-6 pt-16 pb-24 text-center md:pt-24 md:pb-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Now with mindful task tracking
          </div>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-7xl">
            A calmer way to
            <br />
            <span className="italic text-primary">keep track</span> of your day.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Sprig is a quiet, focused task list. Capture what matters, set a date,
            and feel the satisfying click of completion.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="default" size="lg" asChild>
              <Link href="/auth?mode=signup">
                Start for free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth">I have an account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: CheckCircle2,
              title: "One-tap done",
              body: "Mark tasks complete with a satisfying check. Track your progress effortlessly.",
            },
            {
              icon: Calendar,
              title: "Gentle deadlines",
              body: "Add a due date when it matters. Skip it when it doesn't. No pressure.",
            },
            {
              icon: Filter,
              title: "Focus filters",
              body: "Show what's left, or look back at everything you've finished.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-elevated hover:-translate-y-1"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Made with care · Sprig
      </footer>
    </div>
  );
}

// 2. Export the default function wrapped in a Suspense boundary
export default function Landing() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LandingContent />
    </Suspense>
  );
}