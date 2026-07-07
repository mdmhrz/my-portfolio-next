'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Plus, ShieldCheck } from 'lucide-react';
import { usePortfolioStore, VaultItemData, VaultFieldData } from '@/store/usePortfolioStore';
import { PageHeader } from '@/components/admin/PageHeader';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { EmptyState } from '@/components/admin/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VaultCard } from './VaultCard';
import { VaultItemDialog, VaultItemSubmitData } from './VaultItemDialog';
import { VaultItemSheet } from './VaultItemSheet';
import { useVaultReveal } from './useVaultReauth';
import { useVaultAutoLock } from './use-vault-auto-lock';

export function VaultPageContents() {
  const { vaultItems, fetchVaultItems, createVaultItem, updateVaultItem, deleteVaultItem } = usePortfolioStore();
  const { reveal, PasswordPrompt } = useVaultReveal();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItemData | null>(null);
  const [editingFields, setEditingFields] = useState<VaultFieldData[] | null>(null);
  const [detailItem, setDetailItem] = useState<VaultItemData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VaultItemData | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchVaultItems().finally(() => setLoading(false));
  }, [fetchVaultItems]);

  const categories = useMemo(
    () => Array.from(new Set(vaultItems.map((i) => i.category).filter(Boolean))),
    [vaultItems]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vaultItems.filter((i) => {
      const matchesQuery = !q ||
        i.title.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        (i.description ?? '').toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q));
      const matchesCategory = categoryFilter === 'all' || i.category === categoryFilter;
      const matchesFavorite = !favoritesOnly || i.favorite;
      return matchesQuery && matchesCategory && matchesFavorite;
    });
  }, [vaultItems, search, categoryFilter, favoritesOnly]);

  // 5 minutes idle on this page drops any open detail/edit view — independent
  // of the admin's overall dashboard session, which may still be perfectly valid.
  useVaultAutoLock(() => {
    setDetailItem((current) => {
      if (current) toast.info('Vault locked due to inactivity.');
      return null;
    });
    setDialogOpen(false);
  });

  const openCreate = () => { setEditingItem(null); setEditingFields(null); setDialogOpen(true); };

  // Detail/list reads are always masked, so editing requires a reveal() first
  // — the dialog needs real current values to prefill, otherwise saving with
  // blank inputs would silently overwrite each field with an empty string.
  const openEdit = async (item: VaultItemData) => {
    setDetailItem(null);
    const fields = await reveal(item.id);
    if (fields) {
      setEditingItem(item);
      setEditingFields(fields);
      setDialogOpen(true);
    }
  };

  const submitItem = async (id: string | undefined, data: VaultItemSubmitData) => {
    try {
      if (id) await updateVaultItem(id, data);
      else await createVaultItem(data);
      toast.success(id ? 'Secret updated.' : 'Secret added.');
    } catch {
      toast.error('Failed to save secret.');
      throw new Error('save failed');
    }
  };

  const toggleFavorite = async (item: VaultItemData) => {
    try {
      await updateVaultItem(item.id, { favorite: !item.favorite });
    } catch {
      toast.error('Failed to update favorite.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteVaultItem(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Secret deleted.');
    } catch {
      toast.error('Failed to delete.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Secrets Vault"
        description="Every credential and secret you touch, encrypted at rest, in one place."
        action={<Button onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" /> Add Secret</Button>}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, tags, category…"
          className="max-w-xs"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button
          variant={favoritesOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFavoritesOnly((v) => !v)}
        >
          ⭐ Favorites
        </Button>
      </div>

      {!loading && filtered.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No secrets yet"
          description="Click “Add Secret” to store your first credential."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <VaultCard
              key={item.id}
              item={item}
              onOpen={setDetailItem}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      <VaultItemDialog
        key={`dialog-${dialogOpen ? editingItem?.id ?? 'new' : 'closed'}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        revealedFields={editingFields}
        categories={categories}
        onSubmit={submitItem}
      />

      <VaultItemSheet
        key={`sheet-${detailItem?.id ?? 'closed'}`}
        item={detailItem}
        onOpenChange={(open) => { if (!open) setDetailItem(null); }}
        onEdit={openEdit}
        onDelete={(item) => { setDetailItem(null); setDeleteTarget(item); }}
        onRestored={setDetailItem}
      />

      <DeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete secret"
        description="This permanently removes the secret and its history. This action cannot be undone."
      />

      {PasswordPrompt}
    </div>
  );
}
