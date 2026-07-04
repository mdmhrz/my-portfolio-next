'use client';

import { useEffect, useState } from "react";
import { Reorder } from "motion/react";
import { Plus, Edit2, Trash2, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePortfolioStore, type NavLinkData } from "@/store/usePortfolioStore";
import { PageHeader } from "@/components/admin/PageHeader";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { Skeleton } from "@/components/ui/skeleton";

export function NavLinksPageContents() {
  const {
    navLinks,
    fetchNavLinks,
    createNavLink,
    updateNavLink,
    deleteNavLink,
    reorderNavLinks,
  } = usePortfolioStore();

  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<NavLinkData[]>([]);
  const [editingLink, setEditingLink] = useState<NavLinkData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NavLinkData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ label: "", href: "", showInNav: true, showInFooter: true });

  useEffect(() => {
    fetchNavLinks().finally(() => setIsLoading(false));
  }, [fetchNavLinks]);

  useEffect(() => {
    setItems(navLinks);
  }, [navLinks]);

  const handleReorder = (newOrder: NavLinkData[]) => {
    setItems(newOrder);
    reorderNavLinks(newOrder).catch(() => toast.error("Failed to save new order."));
  };

  const openAddModal = () => {
    setEditingLink(null);
    setForm({ label: "", href: "", showInNav: true, showInFooter: true });
    setIsModalOpen(true);
  };

  const openEditModal = (link: NavLinkData) => {
    setEditingLink(link);
    setForm({
      label: link.label,
      href: link.href,
      showInNav: link.showInNav,
      showInFooter: link.showInFooter,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingLink) {
        await updateNavLink(editingLink.id, form);
        toast.success("Link updated!");
      } else {
        await createNavLink(form);
        toast.success("Link added!");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Operation failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteNavLink(deleteTarget.id);
      toast.success("Link deleted!");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleField = async (link: NavLinkData, field: "showInNav" | "showInFooter") => {
    try {
      await updateNavLink(link.id, { ...link, [field]: !link[field] });
    } catch {
      toast.error("Failed to update.");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Navigation Links"
        description="Links shown in the main navbar and footer. Drag to reorder — shared between both."
        action={
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4" /> Add Link
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          No nav links yet. Click &quot;Add Link&quot; to create one.
        </div>
      ) : (
        <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2">
          {items.map((link) => (
            <Reorder.Item
              key={link.id}
              value={link}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{link.label}</p>
                <p className="truncate text-xs text-muted-foreground font-sans">{link.href}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  Navbar
                  <Switch checked={link.showInNav} onCheckedChange={() => toggleField(link, "showInNav")} />
                </label>
                <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  Footer
                  <Switch checked={link.showInFooter} onCheckedChange={() => toggleField(link, "showInFooter")} />
                </label>

                <Button type="button" variant="ghost" size="icon" onClick={() => openEditModal(link)}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteTarget(link)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Link"
        description={`Are you sure you want to delete "${deleteTarget?.label}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLink ? "Edit Link" : "Add Link"}</DialogTitle>
            <DialogDescription>
              {editingLink ? "Update this navigation link" : "Add a new navigation link"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-label" className="text-xs font-semibold">Label *</Label>
              <Input
                id="link-label"
                required
                placeholder="Journey"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link-href" className="text-xs font-semibold">Link *</Label>
              <Input
                id="link-href"
                required
                placeholder="/#journey"
                value={form.href}
                onChange={(e) => setForm({ ...form, href: e.target.value })}
              />
              <span className="text-[10px] text-muted-foreground font-sans">
                Use &quot;/#section-id&quot; to scroll to a homepage section, or a path like &quot;/about&quot;.
              </span>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold">
                <Switch
                  checked={form.showInNav}
                  onCheckedChange={(val) => setForm({ ...form, showInNav: val })}
                />
                Show in Navbar
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold">
                <Switch
                  checked={form.showInFooter}
                  onCheckedChange={(val) => setForm({ ...form, showInFooter: val })}
                />
                Show in Footer
              </label>
            </div>
          </form>

          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving} onClick={handleSubmit}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
