'use client';

import { useState } from "react";
import { Mail, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function MessagesTab({ messages, markMessageRead, deleteMessage }: any) {
  const [selectedMsg, setSelectedMsg] = useState<any>(null);

  const handleToggleRead = async (msg: any) => {
    try {
      await markMessageRead(msg.id, !msg.read);
      toast.success(msg.read ? "Marked as unread" : "Marked as read");
      if (selectedMsg && selectedMsg.id === msg.id) {
        setSelectedMsg({ ...selectedMsg, read: !msg.read });
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteMessage(id);
      toast.success("Message deleted successfully!");
      if (selectedMsg && selectedMsg.id === id) setSelectedMsg(null);
    } catch (err) {
      toast.error("Failed to delete message.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Inbox Messages</h1>
        <p className="text-sm text-muted-foreground">Read contact submissions sended from the landing page contact form.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Message list */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-card overflow-hidden flex flex-col max-h-[70vh]">
          <div className="p-4 border-b border-border bg-muted/10">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Total Inbox Submissions ({messages.length})</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs font-mono">No messages sended.</div>
            ) : (
              messages.map((msg: any) => {
                const formattedDate = new Date(msg.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
                return (
                  <button
                    key={msg.id}
                    onClick={() => {
                      setSelectedMsg(msg);
                      if (!msg.read) markMessageRead(msg.id, true);
                    }}
                    className={`w-full text-left p-4 transition-colors flex justify-between gap-3 hover:bg-muted/30 cursor-pointer ${selectedMsg?.id === msg.id ? "bg-muted/50" : ""} ${!msg.read ? "border-l-2 border-indigo-500 pl-3.5" : "pl-4"}`}
                  >
                    <div className="truncate flex-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <h4 className={`text-xs truncate ${!msg.read ? "font-bold text-foreground" : "text-foreground"}`}>{msg.name}</h4>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">{formattedDate}</span>
                      </div>
                      <p className={`text-xs truncate mt-1 ${!msg.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{msg.subject || "(No Subject)"}</p>
                      <p className="text-[11px] text-muted-foreground truncate mt-1">{msg.message}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message detail view */}
        <div className="lg:col-span-7">
          {selectedMsg ? (
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 flex flex-col justify-between min-h-[450px]">
              <div className="space-y-5">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-border pb-5 gap-4 flex-wrap">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">{selectedMsg.name}</h3>
                    <a href={`mailto:${selectedMsg.email}`} className="text-xs text-foreground hover:underline font-mono">{selectedMsg.email}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRead(selectedMsg)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:border-border text-[10px] font-mono uppercase tracking-wider text-foreground transition-all cursor-pointer"
                    >
                      {selectedMsg.read ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                      {selectedMsg.read ? "Mark Unread" : "Mark Read"}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMsg.id)}
                      className="p-1.5 rounded-lg border border-border bg-background hover:border-red-950/20 text-red-400 transition-all cursor-pointer"
                      title="Delete Submission"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-background/30 p-3 rounded-lg border border-border/40 font-mono">
                  <div>
                    <span className="text-muted-foreground">SENT ON:</span>
                    <p className="text-foreground mt-0.5">{new Date(selectedMsg.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SUBJECT:</span>
                    <p className="text-foreground mt-0.5">{selectedMsg.subject || "(No Subject)"}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">// Message Content</span>
                  <div className="rounded-xl border border-border/60 bg-background/20 p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {selectedMsg.message}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border/60 flex justify-end">
                <a
                  href={`mailto:${selectedMsg.email}?subject=RE: ${selectedMsg.subject || 'Portfolio Inquiry'}`}
                  className="flex items-center gap-2 rounded-xl bg-foreground hover:bg-foreground/90 px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-background transition-all cursor-pointer font-bold"
                >
                  <Mail className="h-4 w-4" /> Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center flex flex-col items-center justify-center min-h-[450px]">
              <Mail className="h-8 w-8 text-zinc-600 mb-3" />
              <p className="text-sm text-muted-foreground">Select a message from the inbox list to read it.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
