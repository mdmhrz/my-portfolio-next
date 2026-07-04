import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  children,
  footer,
  onSubmit,
}: FormDialogProps) {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-5xl",
    "2xl": "max-w-7xl",
  };

  const formContent = (
    <div className="flex flex-col flex-1 overflow-hidden max-h-[85vh]">
      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {children}
      </div>

      {/* Sticky Footer */}
      {footer && (
        <div className="p-6 border-t border-border bg-card shrink-0 flex items-center justify-end gap-3">
          {footer}
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex flex-col p-0 overflow-hidden max-h-[90vh]",
          sizeClasses[size]
        )}
      >
        {/* Sticky Header */}
        <DialogHeader className="p-6 border-b border-border bg-card shrink-0">
          <DialogTitle className="text-lg font-semibold text-foreground">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {onSubmit ? (
          <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
            {formContent}
          </form>
        ) : (
          formContent
        )}
      </DialogContent>
    </Dialog>
  );
}
