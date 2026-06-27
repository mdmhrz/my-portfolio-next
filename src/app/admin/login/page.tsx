'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { KeyRound, Mail, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authClient.signIn.email({
        email,
        password,
      }, {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          router.push("/admin/dashboard");
          router.refresh();
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Invalid email or password.");
          setLoading(false);
        }
      });
    } catch (err: any) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 selection:bg-primary selection:text-black">
      {/* Decorative Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(120,119,198,0.06),rgba(255,255,255,0))]" />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Identity */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Portfolio
          </Link>
          <h1 className="mt-4 text-3xl font-medium tracking-tight text-foreground">
            Admin Portal
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage your resume, projects, and blogs.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/[0.03] p-4 text-sm text-destructive">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="block w-full rounded-xl border border-border bg-muted/40 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground/60">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="block w-full rounded-xl border border-border bg-muted/40 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground hover:bg-foreground/90 py-3 text-sm font-bold text-background transition-all duration-300 hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
