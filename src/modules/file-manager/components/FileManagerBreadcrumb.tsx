'use client';

import { useDroppable } from '@dnd-kit/core';
import { Home } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import { folderDropId } from './file-manager-constants';

interface FileManagerBreadcrumbProps {
  crumbs: { id: string; name: string }[];
  onNavigate: (id: string | null) => void;
}

export function FileManagerBreadcrumb({ crumbs, onNavigate }: FileManagerBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <Crumb id={null} label={<Home className="h-3.5 w-3.5" />} active={crumbs.length === 0} onNavigate={onNavigate} />
        {crumbs.map((crumb, i) => (
          <span key={crumb.id} className="flex items-center gap-1.5">
            <BreadcrumbSeparator />
            <Crumb id={crumb.id} label={crumb.name} active={i === crumbs.length - 1} onNavigate={onNavigate} />
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function Crumb({
  id,
  label,
  active,
  onNavigate,
}: {
  id: string | null;
  label: React.ReactNode;
  active: boolean;
  onNavigate: (id: string | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: folderDropId(id) });
  return (
    <li ref={setNodeRef} className="inline-flex items-center gap-1">
      {active ? (
        <BreadcrumbPage className={cn('rounded px-1.5 py-0.5', isOver && 'ring-2 ring-primary/60')}>{label}</BreadcrumbPage>
      ) : (
        <button
          type="button"
          onClick={() => onNavigate(id)}
          className={cn('rounded px-1.5 py-0.5 text-muted-foreground transition-colors hover:text-foreground cursor-pointer', isOver && 'ring-2 ring-primary/60')}
        >
          {label}
        </button>
      )}
    </li>
  );
}
