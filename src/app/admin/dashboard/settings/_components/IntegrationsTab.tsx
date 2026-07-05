'use client';

import { useEffect, useState } from "react";
import { Mail, CircleCheck, RotateCw, Unlink, Loader2, Webhook } from "lucide-react";
import { toast } from "sonner";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function IntegrationsTab() {
  const { gmailConnected, gmailEmail, fetchGmailStatus, disconnectGmail } = usePortfolioStore();
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetchGmailStatus().finally(() => setLoading(false));
  }, [fetchGmailStatus]);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnectGmail();
      toast.success("Gmail disconnected.");
    } catch {
      toast.error("Failed to disconnect Gmail.");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Connect third-party services that power features across your dashboard.
        </p>
      </div>

      {/* Gmail */}
      <Card className="rounded-xl border border-border">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Gmail</p>
              <p className="text-sm text-muted-foreground">
                Send replies and sync incoming mail directly from your Inbox.
              </p>
              {!loading && gmailConnected && gmailEmail && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CircleCheck className="h-3.5 w-3.5 text-green-600" />
                  Connected as <span className="font-medium text-foreground">{gmailEmail}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : gmailConnected ? (
              <>
                <Button variant="outline" size="sm" asChild className="gap-1.5">
                  <a href="/api/admin/gmail/connect">
                    <RotateCw className="h-3.5 w-3.5" />
                    Reconnect
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="gap-1.5 text-muted-foreground hover:text-destructive"
                >
                  {disconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlink className="h-3.5 w-3.5" />}
                  Disconnect
                </Button>
              </>
            ) : (
              <Button size="sm" asChild className="gap-1.5">
                <a href="/api/admin/gmail/connect">
                  <Mail className="h-3.5 w-3.5" />
                  Connect
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Webhooks — placeholder to show the extensible pattern */}
      <Card className="rounded-xl border border-dashed border-border">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Webhook className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-foreground">Webhooks</p>
              <p className="text-sm text-muted-foreground">Send dashboard events to external URLs.</p>
            </div>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">Soon</span>
        </CardContent>
      </Card>
    </div>
  );
}
