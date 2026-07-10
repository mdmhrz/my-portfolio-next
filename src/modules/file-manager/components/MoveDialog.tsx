'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FolderTreeItem } from '@/store/usePortfolioStore';
import { buildFolderTree, FolderTreeNode } from './file-manager-constants';

interface MoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  tree: FolderTreeItem[];
  disabledIds?: Set<string>;
  onSubmit: (targetFolderId: string | null) => Promise<void>;
}

export function MoveDialog({ open, onOpenChange, title, tree, disabledIds, onSubmit }: MoveDialogProps) {
  const roots = useMemo(() => buildFolderTree(tree), [tree]);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await onSubmit(selected);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (saving) return;
        onOpenChange(o);
        if (!o) setSelected(null);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-64 rounded-md border border-border p-1">
          <Row
            id={null}
            name="Files (root)"
            depth={0}
            selected={selected}
            onSelect={setSelected}
            disabled={false}
          />
          {roots.map((node) => (
            <NodeRow key={node.id} node={node} depth={1} selected={selected} onSelect={setSelected} disabledIds={disabledIds} />
          ))}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NodeRow({
  node,
  depth,
  selected,
  onSelect,
  disabledIds,
}: {
  node: FolderTreeNode;
  depth: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
  disabledIds?: Set<string>;
}) {
  const disabled = disabledIds?.has(node.id) ?? false;
  return (
    <>
      <Row id={node.id} name={node.name} depth={depth} selected={selected} onSelect={onSelect} disabled={disabled} />
      {node.children.map((child) => (
        <NodeRow key={child.id} node={child} depth={depth + 1} selected={selected} onSelect={onSelect} disabledIds={disabledIds} />
      ))}
    </>
  );
}

function Row({
  id,
  name,
  depth,
  selected,
  onSelect,
  disabled,
}: {
  id: string | null;
  name: string;
  depth: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
  disabled: boolean;
}) {
  const active = selected === id;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(id)}
      style={{ paddingLeft: 8 + depth * 16 }}
      className={cn(
        'flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-sm transition-colors cursor-pointer',
        active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent',
        disabled && 'opacity-40 pointer-events-none'
      )}
    >
      <Folder className="h-4 w-4 shrink-0" />
      <span className="truncate">{name}</span>
    </button>
  );
}
