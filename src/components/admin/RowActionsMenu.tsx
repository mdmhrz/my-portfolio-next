'use client';

import { MoreHorizontal } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface RowAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface RowActionsMenuProps {
  actions: RowAction[];
}

export function RowActionsMenu({ actions }: RowActionsMenuProps) {
  const defaults = actions.filter((a) => a.variant !== "destructive");
  const destructives = actions.filter((a) => a.variant === "destructive");
  const hasSep = defaults.length > 0 && destructives.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {defaults.map((action) => (
          <DropdownMenuItem key={action.label} onClick={action.onClick} className="gap-2 cursor-pointer">
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
        {hasSep && <DropdownMenuSeparator />}
        {destructives.map((action) => (
          <DropdownMenuItem
            key={action.label}
            onClick={action.onClick}
            className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
