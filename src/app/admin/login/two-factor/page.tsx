'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TwoFactorVerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const onSuccess = () => {
      router.push("/admin/dashboard");
      router.refresh();
    };
    const onError = (ctx: { error: { message?: string } }) => {
      setError(ctx.error.message || "Invalid code. Please try again.");
      setLoading(false);
    };

    try {
      if (useBackupCode) {
        await authClient.twoFactor.verifyBackupCode(
          { code, trustDevice },
          { onSuccess, onError }
        );
      } else {
        await authClient.twoFactor.verifyTotp(
          { code, trustDevice },
          { onSuccess, onError }
        );
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 selection:bg-primary selection:text-primary-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,hsl(var(--primary)/0.08),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_80%_80%,hsl(var(--primary)/0.04),transparent)]" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-[11px] font-sans uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Login
          </Link>
        </div>

        <Card className="border border-border shadow-2xl dark:shadow-none rounded-xl backdrop-blur-sm">
          <CardHeader className="pb-2 pt-6 px-6 space-y-4">
            <div className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/5 ring-1 ring-foreground/10">
                {useBackupCode ? (
                  <KeyRound className="h-6 w-6 text-foreground/70" />
                ) : (
                  <ShieldCheck className="h-6 w-6 text-foreground/70" />
                )}
              </div>
            </div>

            <div className="text-center space-y-1">
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                Two-Factor Verification
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {useBackupCode
                  ? "Enter one of your saved backup codes."
                  : "Enter the 6-digit code from your authenticator app."}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-6 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="leading-snug">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-xs font-medium text-muted-foreground">
                  {useBackupCode ? "Backup Code" : "Verification Code"}
                </Label>
                <Input
                  id="code"
                  type="text"
                  required
                  autoFocus
                  inputMode={useBackupCode ? "text" : "numeric"}
                  placeholder={useBackupCode ? "xxxxxxxx" : "123456"}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={loading}
                  className="h-10 text-sm tracking-widest"
                  autoComplete="one-time-code"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="trustDevice"
                  checked={trustDevice}
                  onCheckedChange={(v) => setTrustDevice(v === true)}
                  disabled={loading}
                />
                <Label htmlFor="trustDevice" className="text-xs font-normal text-muted-foreground">
                  Trust this device for 30 days
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading || !code}
                className="mt-2 h-10 w-full gap-2 text-sm font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </form>

            <button
              type="button"
              onClick={() => {
                setUseBackupCode((v) => !v);
                setCode("");
                setError(null);
              }}
              className="mt-4 w-full text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {useBackupCode ? "Use authenticator code instead" : "Use a backup code instead"}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
