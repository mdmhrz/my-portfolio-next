'use client';

import { useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldOff,
  Loader2,
  Copy,
  CircleCheck,
  AlertCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Wizard steps for enrollment. Disabling is a single password-gated step.
type EnrollStep = "password" | "scan" | "verify";

export function SecurityTab() {
  const { data: session, isPending } = authClient.useSession();
  const twoFactorEnabled = Boolean(
    (session?.user as { twoFactorEnabled?: boolean } | undefined)?.twoFactorEnabled
  );

  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollStep, setEnrollStep] = useState<EnrollStep>("password");
  const [password, setPassword] = useState("");
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [savedCodesConfirmed, setSavedCodesConfirmed] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [disableOpen, setDisableOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disabling, setDisabling] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);

  const resetEnrollState = () => {
    setEnrollStep("password");
    setPassword("");
    setTotpUri(null);
    setQrDataUrl(null);
    setBackupCodes([]);
    setSavedCodesConfirmed(false);
    setVerifyCode("");
    setError(null);
  };

  const handleEnrollOpenChange = (open: boolean) => {
    setEnrollOpen(open);
    if (!open) resetEnrollState();
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { data, error: apiError } = await authClient.twoFactor.enable({ password });
      if (apiError || !data) {
        setError(apiError?.message || "Incorrect password.");
        setSubmitting(false);
        return;
      }
      setTotpUri(data.totpURI);
      setBackupCodes(data.backupCodes);
      const dataUrl = await QRCode.toDataURL(data.totpURI, { width: 220, margin: 1 });
      setQrDataUrl(dataUrl);
      setEnrollStep("scan");
    } catch {
      setError("Failed to start enrollment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { error: apiError } = await authClient.twoFactor.verifyTotp({
        code: verifyCode,
        trustDevice: true,
      });
      if (apiError) {
        setError(apiError.message || "Invalid code. Please try again.");
        setSubmitting(false);
        return;
      }
      toast.success("Two-factor authentication is now enabled.");
      handleEnrollOpenChange(false);
    } catch {
      setError("Failed to verify code. Please try again.");
      setSubmitting(false);
    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisableError(null);
    setDisabling(true);
    try {
      const { error: apiError } = await authClient.twoFactor.disable({ password: disablePassword });
      if (apiError) {
        setDisableError(apiError.message || "Incorrect password.");
        setDisabling(false);
        return;
      }
      toast.success("Two-factor authentication has been disabled.");
      setDisableOpen(false);
      setDisablePassword("");
    } catch {
      setDisableError("Failed to disable. Please try again.");
    } finally {
      setDisabling(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Backup codes copied.");
  };

  const secretFromUri = totpUri ? new URL(totpUri).searchParams.get("secret") : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground">
          Protect your admin account against a stolen or guessed password.
        </p>
      </div>

      {!isPending && !twoFactorEnabled && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Two-factor authentication is off</AlertTitle>
          <AlertDescription>
            Anyone with your password can sign in and reveal every secret in your vault.
            Enabling 2FA is the single highest-leverage security improvement you can make.
          </AlertDescription>
        </Alert>
      )}

      <Card className="rounded-xl border border-border">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {twoFactorEnabled ? <ShieldCheck className="h-5 w-5" /> : <ShieldOff className="h-5 w-5" />}
            </span>
            <div>
              <p className="font-semibold text-foreground">Two-Factor Authentication (TOTP)</p>
              <p className="text-sm text-muted-foreground">
                Require a code from an authenticator app when signing in.
              </p>
              {!isPending && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  {twoFactorEnabled ? (
                    <>
                      <CircleCheck className="h-3.5 w-3.5 text-green-600" />
                      Enabled
                    </>
                  ) : (
                    <Badge variant="outline">Not enabled</Badge>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : twoFactorEnabled ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDisableOpen(true)}
                className="gap-1.5 text-muted-foreground hover:text-destructive"
              >
                Disable
              </Button>
            ) : (
              <Button size="sm" onClick={() => setEnrollOpen(true)} className="gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Enable 2FA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enrollment wizard */}
      <Dialog open={enrollOpen} onOpenChange={handleEnrollOpenChange}>
        <DialogContent className="sm:max-w-md">
          {enrollStep === "password" && (
            <form onSubmit={handlePasswordSubmit}>
              <DialogHeader>
                <DialogTitle>Confirm your password</DialogTitle>
                <DialogDescription>
                  Re-enter your password to start setting up two-factor authentication.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-1.5">
                <Label htmlFor="enroll-password">Password</Label>
                <Input
                  id="enroll-password"
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting || !password} className="gap-2">
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Continue
                </Button>
              </DialogFooter>
            </form>
          )}

          {enrollStep === "scan" && (
            <>
              <DialogHeader>
                <DialogTitle>Scan this QR code</DialogTitle>
                <DialogDescription>
                  Scan with Google Authenticator, 1Password, or any TOTP app. Then save your backup
                  codes — they&apos;re the only way back in if you lose your device.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-2 flex w-full flex-col items-center gap-3">
                {qrDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt="TOTP QR code" className="h-[220px] w-[220px] rounded-lg" />
                )}
                {secretFromUri && (
                  <code className="w-full max-w-full break-all rounded-md bg-muted px-2.5 py-1 text-center text-xs tracking-widest text-muted-foreground">
                    {secretFromUri}
                  </code>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Backup codes (save these now)</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={copyBackupCodes} className="h-6 gap-1 px-2 text-xs">
                    <Copy className="h-3 w-3" />
                    Copy all
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
                  {backupCodes.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Checkbox
                  id="saved-codes"
                  checked={savedCodesConfirmed}
                  onCheckedChange={(v) => setSavedCodesConfirmed(v === true)}
                />
                <Label htmlFor="saved-codes" className="text-xs font-normal text-muted-foreground">
                  I&apos;ve saved these backup codes somewhere safe
                </Label>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  disabled={!savedCodesConfirmed}
                  onClick={() => setEnrollStep("verify")}
                >
                  Continue
                </Button>
              </DialogFooter>
            </>
          )}

          {enrollStep === "verify" && (
            <form onSubmit={handleVerifySubmit}>
              <DialogHeader>
                <DialogTitle>Verify your app</DialogTitle>
                <DialogDescription>
                  Enter the 6-digit code your authenticator app is showing now.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-1.5">
                <Label htmlFor="verify-code">Verification code</Label>
                <Input
                  id="verify-code"
                  type="text"
                  inputMode="numeric"
                  required
                  autoFocus
                  placeholder="123456"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  disabled={submitting}
                  className="tracking-widest"
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting || !verifyCode} className="gap-2">
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Verify & Enable
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable dialog */}
      <Dialog open={disableOpen} onOpenChange={(o) => { setDisableOpen(o); if (!o) { setDisablePassword(""); setDisableError(null); } }}>
        <DialogContent className="sm:max-w-sm">
          <form onSubmit={handleDisable}>
            <DialogHeader>
              <DialogTitle>Disable two-factor authentication?</DialogTitle>
              <DialogDescription>
                Your account will only be protected by your password. Confirm with your password to continue.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="disable-password">Password</Label>
              <Input
                id="disable-password"
                type="password"
                required
                autoFocus
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                disabled={disabling}
              />
              {disableError && <p className="text-xs text-destructive">{disableError}</p>}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                variant="destructive"
                disabled={disabling || !disablePassword}
                className="gap-2"
              >
                {disabling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Disable 2FA
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
