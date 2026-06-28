'use client';

import { useState } from "react";
import {
  TwitterLogo,
  LinkedinLogo,
  FacebookLogo,
  LinkSimple,
  Check,
} from "@phosphor-icons/react";
import { toast } from "sonner";

export function BlogShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: "Share on X",
      Icon: TwitterLogo,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "Share on LinkedIn",
      Icon: LinkedinLogo,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Share on Facebook",
      Icon: FacebookLogo,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link.");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {shareLinks.map(({ name, Icon, href }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={name}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-indigo-600/40 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <Icon className="h-4 w-4" weight="regular" />
        </a>
      ))}
      <button
        onClick={copyLink}
        aria-label="Copy link"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-indigo-600/40 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-500" weight="bold" /> : <LinkSimple className="h-4 w-4" />}
      </button>
    </div>
  );
}
