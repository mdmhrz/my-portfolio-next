'use client';

import { useState } from "react";
import { toast } from "sonner";
import { PaperPlaneTilt, CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !type || !message.trim()) {
      toast.error("Please fill out all fields before sending.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, type, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send message.");
      }

      toast.success("Message sent! I will reach out to you soon.");

      // Clear form states
      setName("");
      setEmail("");
      setSubject("");
      setType("");
      setMessage("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-md"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Your name">
          <Input
            name="name"
            type="text"
            required
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </Field>
        <Field label="Email">
          <Input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Subject">
          <Input
            name="subject"
            type="text"
            placeholder="What's this about?"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Inquiry type">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20">
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border text-foreground">
              <SelectItem value="Freelance project">Freelance project</SelectItem>
              <SelectItem value="Full-time role">Full-time role</SelectItem>
              <SelectItem value="Collaboration">Collaboration</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Message">
          <Textarea
            name="message"
            required
            rows={5}
            placeholder="Tell me about your project or role..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 resize-none"
          />
        </Field>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="group mt-8 h-12 w-full rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 hover:scale-[1.01] hover:shadow-md cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Send message
            <PaperPlaneTilt weight="bold" className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </>
        )}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="block space-y-2">
      <span className="ml-1 text-[10px] font-sans uppercase tracking-[0.2em] text-muted-foreground font-bold">
        {label}
      </span>
      {children}
    </div>
  );
}
