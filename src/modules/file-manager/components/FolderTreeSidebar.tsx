'use client';

import { useMemo, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FolderTreeItem } from '@/store/usePortfolioStore';
import { folderDropId, buildFolderTree, FolderTreeNode } from './file-manager-constants';

interface FolderTreeSidebarProps {
  tree: FolderTreeItem[];
  currentFolderId: string | null;
  onNavigate: (id: string | null) => void;
}

export function FolderTreeSidebar({ tree, currentFolderId, onNavigate }: FolderTreeSidebarProps) {
  const roots = useMemo(() => buildFolderTree(tree), [tree]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-0.5">
      <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Folders</p>
      <RootNode currentFolderId={currentFolderId} onNavigate={onNavigate} />
      {roots.map((node) => (
        <TreeRow
          key={node.id}
          node={node}
          depth={0}
          expanded={expanded}
          toggle={toggle}
          currentFolderId={currentFolderId}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

function RootNode({ currentFolderId, onNavigate }: { currentFolderId: string | null; onNavigate: (id: string | null) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: folderDropId(null) });
  const active = currentFolderId === null;
  return (
    <button
      ref={setNodeRef}
      onClick={() => onNavigate(null)}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors cursor-pointer',
        active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-accent',
        isOver && !active && 'ring-2 ring-primary/60'
      )}
    >
      <Folder className="h-4 w-4 shrink-0" />
      Files
    </button>
  );
}

function TreeRow({
  node,
  depth,
  expanded,
  toggle,
  currentFolderId,
  onNavigate,
}: {
  node: FolderTreeNode;
  depth: number;
  expanded: Set<string>;
  toggle: (id: string) => void;
  currentFolderId: string | null;
  onNavigate: (id: string | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: folderDropId(node.id) });
  const isExpanded = expanded.has(node.id);
  const active = currentFolderId === node.id;
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex items-center gap-1 rounded-md pr-2 text-sm transition-colors',
          active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-accent',
          isOver && !active && 'ring-2 ring-primary/60'
        )}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        <button
          type="button"
          onClick={() => hasChildren && toggle(node.id)}
          className={cn('shrink-0 rounded p-0.5 cursor-pointer', !hasChildren && 'opacity-0 pointer-events-none')}
        >
          {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => onNavigate(node.id)}
          className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left font-medium cursor-pointer"
        >
          {active && isExpanded ? <FolderOpen className="h-4 w-4 shrink-0" /> : <Folder className="h-4 w-4 shrink-0" />}
          <span className="truncate">{node.name}</span>
        </button>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              toggle={toggle}
              currentFolderId={currentFolderId}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
