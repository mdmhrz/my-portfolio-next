'use client';

import { Star, Pencil, Trash2, Eye, RotateCw, KeyRound } from 'lucide-react';
import { VaultItemData } from '@/store/usePortfolioStore';
import { RowActionsMenu } from '@/components/admin/RowActionsMenu';
import { Badge } from '@/components/ui/badge';
import { formatDate, isExpired, isExpiringSoon, isDueForRotation, CategoryIcon } from './vault-constants';

interface VaultCardProps {
  item: VaultItemData;
  onOpen: (item: VaultItemData) => void;
  onEdit: (item: VaultItemData) => void;
  onDelete: (item: VaultItemData) => void;
  onToggleFavorite: (item: VaultItemData) => void;
}

export function VaultCard({ item, onOpen, onEdit, onDelete, onToggleFavorite }: VaultCardProps) {
  const expired = isExpired(item.expiresAt);
  const expiringSoon = !expired && isExpiringSoon(item.expiresAt);
  const dueForRotation = isDueForRotation(item.updatedAt);

  return (
    <div className="group space-y-3 rounded-lg border border-border bg-background p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={() => onOpen(item)} className="flex min-w-0 flex-1 items-start gap-2.5 text-left">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CategoryIcon category={item.category} className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-foreground">{item.title}</span>
            <span className="block truncate text-xs text-muted-foreground">{item.category}</span>
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(item); }}
            className="text-muted-foreground transition-colors hover:text-amber-500"
            aria-label={item.favorite ? 'Unfavorite' : 'Favorite'}
          >
            <Star className={`h-4 w-4 ${item.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
          <RowActionsMenu
            actions={[
              { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: () => onOpen(item) },
              { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => onEdit(item) },
              { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: () => onDelete(item), variant: 'destructive' },
            ]}
          />
        </div>
      </div>

      {item.description && <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>}

      {(item.tags.length > 0 || dueForRotation) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {item.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
          {dueForRotation && (
            <Badge variant="outline" className="gap-1 text-amber-600 dark:text-amber-400">
              <RotateCw className="h-3 w-3" />
              Rotate this secret
            </Badge>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <KeyRound className="h-3 w-3" />
          {item.fields.length} field{item.fields.length === 1 ? '' : 's'}
        </span>
        {item.expiresAt && (
          <span className={expired ? 'font-medium text-destructive' : expiringSoon ? 'font-medium text-amber-600 dark:text-amber-400' : ''}>
            {expired ? 'Expired' : 'Expires'} {formatDate(item.expiresAt)}
          </span>
        )}
      </div>
    </div>
  );
}
