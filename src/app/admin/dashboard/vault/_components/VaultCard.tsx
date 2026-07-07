'use client';

import { Star, Pencil, Trash2, Eye } from 'lucide-react';
import { VaultItemData } from '@/store/usePortfolioStore';
import { RowActionsMenu } from '@/components/admin/RowActionsMenu';
import { Badge } from '@/components/ui/badge';
import { formatDate, isExpired, isExpiringSoon } from './vault-constants';

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

  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={() => onOpen(item)} className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
          <p className="truncate text-xs text-muted-foreground">{item.category}</p>
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(item); }}
            className="text-muted-foreground hover:text-amber-500"
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

      {item.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {item.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{item.fields.length} field{item.fields.length === 1 ? '' : 's'}</span>
        {item.expiresAt && (
          <span className={expired ? 'font-medium text-destructive' : expiringSoon ? 'font-medium text-amber-600 dark:text-amber-400' : ''}>
            {expired ? 'Expired' : 'Expires'} {formatDate(item.expiresAt)}
          </span>
        )}
      </div>
    </div>
  );
}
