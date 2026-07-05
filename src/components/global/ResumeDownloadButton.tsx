'use client';

import { FileText } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/track";

export function ResumeDownloadButton({ href }: { href: string }) {
  return (
    <Button
      asChild
      className="w-full rounded-xl gap-2 font-semibold text-xs tracking-tight shadow-sm hover:shadow-md transition-all duration-300"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("resume_download", "/resume")}
      >
        <FileText weight="bold" className="h-4 w-4" />
        Download Resume
      </a>
    </Button>
  );
}
