'use client';

import { useEffect, useState } from "react";
import { Mail, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { PageHeader } from "@/components/admin/PageHeader";
import { DeleteDialog } from "@/components/admin/DeleteDialog";

function MessagesSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <Card className="lg:col-span-5 overflow-hidden flex flex-col max-h-[70vh]">
        <CardHeader className="p-4 border-b border-border bg-muted/10">
          <Skeleton className="h-3 w-40" />
        </CardHeader>
        <div className="flex-1 divide-y divide-border/40">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </Card>
      <div className="lg:col-span-7">
        <Card className="min-h-[450px] flex items-center justify-center">
          <CardContent className="text-center flex flex-col items-center justify-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function MessagesPageContents() {
  const { messages, fetchMessages, markMessageRead, deleteMessage } = usePortfolioStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchMessages().finally(() => setIsLoading(false));
  }, [fetchMessages]);

  const handleToggleRead = async (msg: any) => {
    try {
      await markMessageRead(msg.id, !msg.read);
      toast.success(msg.read ? "Marked as unread" : "Marked as read");
      if (selectedMsg && selectedMsg.id === msg.id) {
        setSelectedMsg({ ...selectedMsg, read: !msg.read });
      }
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteMessage(deleteTarget.id);
      toast.success("Message deleted successfully!");
      if (selectedMsg && selectedMsg.id === deleteTarget.id) setSelectedMsg(null);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete message.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbox Messages"
        description={`${messages.length} total · ${unreadCount} unread`}
      />

      {isLoading ? (
        <MessagesSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-5 overflow-hidden flex flex-col max-h-[70vh]">
            <CardHeader className="p-4 border-b border-border bg-muted/10">
              <span className="text-xs font-semibold text-muted-foreground">
                Total Inbox Submissions ({messages.length})
              </span>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="divide-y divide-border/40">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-xs font-sans">
                    No messages yet.
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const formattedDate = new Date(msg.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    });
                    return (
                      <button
                        key={msg.id}
                        onClick={() => {
                          setSelectedMsg(msg);
                          if (!msg.read) markMessageRead(msg.id, true);
                        }}
                        className={`w-full text-left p-4 transition-colors flex justify-between gap-3 hover:bg-muted/30 cursor-pointer ${
                          selectedMsg?.id === msg.id ? "bg-muted/50" : ""
                        } ${!msg.read ? "border-l-2 border-primary pl-3.5" : "pl-4"}`}
                      >
                        <div className="truncate flex-1">
                          <div className="flex justify-between items-baseline gap-2">
                            <h4 className={`text-xs truncate ${!msg.read ? "font-bold text-foreground" : "text-foreground"}`}>
                              {msg.name}
                            </h4>
                            <span className="text-[10px] text-muted-foreground font-sans shrink-0">{formattedDate}</span>
                          </div>
                          <p className={`text-xs truncate mt-1 ${!msg.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                            {msg.subject || "(No Subject)"}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate mt-1">{msg.message}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </Card>

          <div className="lg:col-span-7">
            {selectedMsg ? (
              <Card className="flex flex-col justify-between min-h-[450px]">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="flex justify-between items-start border-b border-border pb-5 gap-4 flex-wrap">
                    <div>
                      <h3 className="text-lg font-medium text-foreground">{selectedMsg.name}</h3>
                      <a
                        href={`mailto:${selectedMsg.email}`}
                        className="text-xs text-foreground hover:underline font-sans"
                      >
                        {selectedMsg.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleToggleRead(selectedMsg)} variant="outline" size="sm">
                        {selectedMsg.read ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                        {selectedMsg.read ? "Mark Unread" : "Mark Read"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget({ id: selectedMsg.id, name: selectedMsg.name })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs bg-background/30 p-3 rounded-lg border border-border/40 font-sans">
                    <div>
                      <span className="text-muted-foreground">SENT ON:</span>
                      <p className="text-foreground mt-0.5">{new Date(selectedMsg.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">SUBJECT:</span>
                      <p className="text-foreground mt-0.5">{selectedMsg.subject || "(No Subject)"}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="block font-sans text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                      // Message Content
                    </span>
                    <div className="rounded-xl border border-border/60 bg-background/20 p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                      {selectedMsg.message}
                    </div>
                  </div>
                </CardContent>
                <div className="pt-6 border-t border-border/60 flex justify-end px-6 pb-6 md:px-8 md:pb-8">
                  <Button asChild>
                    <a href={`mailto:${selectedMsg.email}?subject=RE: ${selectedMsg.subject || "Portfolio Inquiry"}`}>
                      <Mail className="h-4 w-4" /> Reply via Email
                    </a>
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="flex flex-col items-center justify-center min-h-[450px]">
                <CardContent className="text-center flex flex-col items-center justify-center">
                  <Mail className="h-8 w-8 text-zinc-600 mb-3" />
                  <p className="text-sm text-muted-foreground">Select a message from the inbox list to read it.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Message"
        description={`Are you sure you want to delete the message from ${deleteTarget?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
