import * as React from "react";
import { cn } from "@/lib/utils";

interface AdminBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
}

export function AdminBadge({ className, variant = "default", ...props }: AdminBadgeProps) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:border-destructive/30",
    outline: "border border-border text-foreground",
    success: "bg-success/10 text-success border border-success/20 dark:bg-success/20 dark:border-success/30",
    warning: "bg-warning/10 text-warning border border-warning/20 dark:bg-warning/20 dark:border-warning/30",
    info: "bg-info/10 text-info border border-info/20 dark:bg-info/20 dark:border-info/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border border-transparent transition-colors whitespace-nowrap",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
