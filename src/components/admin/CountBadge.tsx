import * as React from "react";
import { cn } from "@/lib/utils";

interface CountBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number;
}

export function CountBadge({ count, className, ...props }: CountBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground select-none",
        className
      )}
      {...props}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
