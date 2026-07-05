'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Mail,
  Trash2,
  PenSquare,
  RefreshCw,
  Paperclip,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePortfolioStore, ThreadData } from "@/store/usePortfolioStore";
import { PageHeader } from "@/components/admin/PageHeader";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { EmailComposer, ComposerAttachment } from "./EmailComposer";
import { EmailBodyFrame } from "./EmailBodyFrame";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function timeAgo(date: string) {
  const diffMs = Date.now() - new Date(date).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function MessagesSkeleton() {
  return (
    <div className="flex-1 min-h-0 mt-5 flex flex-col lg:flex-row gap-5">
      <Card className="lg:w-[330px] lg:shrink-0 overflow-hidden flex flex-col border border-border shadow-sm dark:shadow-none rounded-2xl">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex-1 divide-y divide-border/40">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 flex gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="flex-1 flex items-center justify-center border border-border shadow-sm dark:shadow-none rounded-2xl">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Card>
    </div>
  );
}

export function MessagesPageContents() {
  const {
    threads,
    fetchThreads,
    fetchThread,
    markThreadRead,
    deleteThread,
    sendEmail,
    gmailConnected,
    fetchGmailStatus,
    syncGmailNow,
  } = usePortfolioStore();

  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeToName, setComposeToName] = useState("");
  const [composeSubject, setComposeSubject] = useState("");

  useEffect(() => {
    Promise.all([fetchThreads(), fetchGmailStatus()]).finally(() => setIsLoading(false));
  }, [fetchThreads, fetchGmailStatus]);

  // Poll for new contact-form messages / replies so the inbox updates without
  // a manual reload. fetchThreads() replaces the list with truncated entries,
  // so re-fetch the open thread's full detail afterward if one is selected.
  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchThreads();
      if (selectedId) await fetchThread(selectedId);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchThreads, fetchThread, selectedId]);

  useEffect(() => {
    if (searchParams.get("connected") === "1") {
      toast.success("Gmail connected successfully");
      router.replace("/admin/dashboard/messages");
    } else if (searchParams.get("gmail_error")) {
      toast.error("Failed to connect Gmail. Please try again.");
      router.replace("/admin/dashboard/messages");
    }
  }, [searchParams, router]);

  const selectedThread = useMemo(
    () => threads.find((t) => t.id === selectedId) ?? null,
    [threads, selectedId]
  );

  const unreadCount = threads.filter((t) => t.unread).length;

  async function handleSelectThread(thread: ThreadData) {
    setSelectedId(thread.id);
    await fetchThread(thread.id);
    if (thread.unread) {
      await markThreadRead(thread.id, false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteThread(deleteTarget.id);
      toast.success("Conversation deleted");
      if (selectedId === deleteTarget.id) setSelectedId(null);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete conversation");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      await syncGmailNow();
      toast.success("Inbox synced");
    } catch {
      // store already toasts the error
    } finally {
      setSyncing(false);
    }
  }


  async function handleReplySend(thread: ThreadData, payload: { bodyHtml: string; attachments: ComposerAttachment[] }) {
    await sendEmail({
      threadId: thread.id,
      to: thread.contactEmail,
      toName: thread.contactName ?? undefined,
      subject: thread.subject ? `Re: ${thread.subject.replace(/^Re:\s*/i, "")}` : "Re: Your message",
      bodyHtml: payload.bodyHtml,
      attachments: payload.attachments,
    });
    toast.success("Reply sent");
  }

  async function handleComposeSend(payload: { bodyHtml: string; attachments: ComposerAttachment[] }) {
    if (!composeTo) {
      toast.error("Enter a recipient email");
      throw new Error("missing recipient");
    }
    const threadId = await sendEmail({
      to: composeTo,
      toName: composeToName || undefined,
      subject: composeSubject || "(No subject)",
      bodyHtml: payload.bodyHtml,
      attachments: payload.attachments,
    });
    toast.success("Email sent");
    setComposeOpen(false);
    setComposeTo("");
    setComposeToName("");
    setComposeSubject("");
    setSelectedId(threadId);
  }

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      <div className="shrink-0 space-y-4">
      <PageHeader
        title="Inbox"
        description={`${threads.length} conversations · ${unreadCount} unread`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing || !gmailConnected} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              Sync now
            </Button>
            <Button size="sm" onClick={() => setComposeOpen(true)} disabled={!gmailConnected} className="gap-1.5">
              <PenSquare className="h-3.5 w-3.5" />
              Compose
            </Button>
          </div>
        }
      />

      {!gmailConnected && !isLoading && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>Connect Gmail to send replies and sync incoming mail. Manage it in Settings.</span>
          </div>
          <Button size="sm" asChild>
            <Link href="/admin/dashboard/settings/integrations">Go to Settings</Link>
          </Button>
        </div>
      )}
      </div>

      {isLoading ? (
        <MessagesSkeleton />
      ) : (
        <div className="flex-1 min-h-0 mt-5 flex flex-col lg:flex-row gap-5">
          {/* Conversations pane — fixed width, scrolls internally */}
          <Card className="lg:w-[330px] lg:shrink-0 overflow-hidden flex flex-col min-h-0 max-h-[38vh] lg:max-h-none border border-border shadow-sm dark:shadow-none rounded-2xl">
            <div className="shrink-0 px-4 py-3.5 border-b border-border flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">Conversations</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-medium text-primary-foreground bg-primary rounded-full px-2 py-0.5 tabular-nums">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hidden">
              {threads.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  No conversations yet.
                </div>
              ) : (
                <div className="p-2 space-y-0.5">
                  {threads.map((thread) => {
                    const lastEmail = thread.emails[0];
                    const preview = lastEmail?.snippet || thread.message?.message || "";
                    const name = thread.contactName || thread.contactEmail;
                    const active = selectedId === thread.id;
                    return (
                      <button
                        key={thread.id}
                        onClick={() => handleSelectThread(thread)}
                        className={`w-full text-left rounded-xl px-3 py-2.5 transition-colors flex gap-3 cursor-pointer ${
                          active ? "bg-accent" : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                              active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {initials(name) || "?"}
                          </div>
                          {thread.unread && (
                            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-card" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-2">
                            <h4 className={`text-[13px] truncate ${thread.unread ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                              {name}
                            </h4>
                            <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                              {timeAgo(thread.lastMessageAt)}
                            </span>
                          </div>
                          <p className={`text-xs truncate mt-0.5 ${thread.unread ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                            {thread.subject || "(No subject)"}
                          </p>
                          <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">{preview}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* Detail pane — header + scrolling thread + pinned reply */}
          <Card className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden border border-border shadow-sm dark:shadow-none rounded-2xl">
            {selectedThread ? (
              <>
                <div className="shrink-0 flex justify-between items-start gap-4 px-5 py-4 border-b border-border">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                      {initials(selectedThread.contactName || selectedThread.contactEmail) || "?"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-foreground truncate">
                        {selectedThread.subject || "(No subject)"}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {selectedThread.contactName ? `${selectedThread.contactName} · ` : ""}
                        {selectedThread.contactEmail}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() =>
                      setDeleteTarget({
                        id: selectedThread.id,
                        name: selectedThread.contactName || selectedThread.contactEmail,
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hidden px-5 py-4 space-y-3">
                  {selectedThread.message && (
                    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {selectedThread.message.name}{" "}
                          <span className="text-muted-foreground font-normal">via contact form</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {new Date(selectedThread.message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {selectedThread.message.message}
                      </div>
                    </div>
                  )}

                  {selectedThread.emails.map((email) => {
                    const outbound = email.direction === "outbound";
                    return (
                      <div
                        key={email.id}
                        className={`rounded-xl border p-4 space-y-2 ${
                          outbound ? "border-primary/20 bg-primary/[0.04]" : "border-border bg-card"
                        }`}
                      >
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="text-xs font-semibold text-foreground truncate">
                            {outbound ? "You" : email.fromEmail}
                            {outbound && (
                              <span className="text-muted-foreground font-normal"> to {email.toEmail}</span>
                            )}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {new Date(email.sentAt).toLocaleString()}
                          </span>
                        </div>
                        <EmailBodyFrame html={email.bodyHtml} />
                        {email.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
                            {email.attachments.map((att) => (
                              <a
                                key={att.id}
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-xs bg-muted/50 border border-border rounded-full px-2.5 py-1 hover:bg-muted transition-colors"
                              >
                                <Paperclip className="h-3 w-3" />
                                {att.fileName}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {gmailConnected ? (
                  <div className="shrink-0 border-t border-border">
                    <EmailComposer
                      key={selectedThread.id}
                      compact
                      bare
                      to={selectedThread.contactEmail}
                      subject={selectedThread.subject ? `Re: ${selectedThread.subject.replace(/^Re:\s*/i, "")}` : "Re: Your message"}
                      onSend={(payload) => handleReplySend(selectedThread, payload)}
                      placeholder="Write your reply…"
                      sendLabel="Reply"
                    />
                  </div>
                ) : (
                  <p className="shrink-0 text-xs text-muted-foreground text-center py-3 border-t border-dashed border-border">
                    Connect Gmail above to reply to this conversation.
                  </p>
                )}
              </>
            ) : (
              <EmptyState
                title="No conversation selected"
                description="Select a conversation from the inbox list to read it and reply."
                icon={Mail}
                className="h-full border-0 shadow-none"
              />
            )}
          </Card>
        </div>
      )}

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenSquare className="h-4 w-4 text-muted-foreground" />
              New email
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2">
              <span className="text-xs text-muted-foreground w-14 shrink-0">Name</span>
              <Input
                value={composeToName}
                onChange={(e) => setComposeToName(e.target.value)}
                placeholder="Recipient name (optional)"
                className="border-0 shadow-none h-7 px-0 focus-visible:ring-0"
              />
            </div>
            <EmailComposer
              to={composeTo}
              editableRecipient
              onToChange={setComposeTo}
              subject={composeSubject}
              editableSubject
              onSubjectChange={setComposeSubject}
              onSend={handleComposeSend}
              placeholder="Write your email…"
              sendLabel="Send"
            />
          </div>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete conversation"
        description={`Are you sure you want to delete the conversation with ${deleteTarget?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
