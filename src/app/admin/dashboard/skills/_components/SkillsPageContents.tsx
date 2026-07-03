'use client';

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePortfolioStore, type SkillData } from "@/store/usePortfolioStore";
import { PageHeader } from "@/components/admin/PageHeader";
import { RowActionsMenu } from "@/components/admin/RowActionsMenu";
import { DeleteDialog } from "@/components/admin/DeleteDialog";

const CATEGORIES = ["frontend", "backend", "devops", "tools", "database", "other"];

function SkillsGroupSkeleton() {
  return (
    <div className="space-y-6">
      {[3, 2, 4].map((count, gi) => (
        <div key={gi} className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="bg-muted/50 border-b border-border px-6 py-3">
            <Skeleton className="h-3 w-20" />
          </div>
          <Table>
            <TableBody>
              {Array.from({ length: count }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}

export function SkillsPageContents() {
  const { skills, fetchSkills, createSkill, updateSkill, deleteSkill } = usePortfolioStore();

  const [isLoading, setIsLoading] = useState(true);
  const [editingSkill, setEditingSkill] = useState<SkillData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SkillData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", category: "frontend", icon: "", order: 0 });

  useEffect(() => {
    fetchSkills().finally(() => setIsLoading(false));
  }, [fetchSkills]);

  const openAddModal = () => {
    setEditingSkill(null);
    setForm({ name: "", category: "frontend", icon: "", order: skills.length });
    setIsModalOpen(true);
  };

  const openEditModal = (skill: SkillData) => {
    setEditingSkill(skill);
    setForm({
      name: skill.name || "",
      category: skill.category || "frontend",
      icon: skill.icon || "",
      order: skill.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        icon: form.icon || null,
        order: Number(form.order) || 0,
      };
      if (editingSkill) {
        await updateSkill(editingSkill.id, payload);
        toast.success("Skill updated!");
      } else {
        await createSkill(payload);
        toast.success("Skill created!");
      }
      setIsModalOpen(false);
    } catch {
      toast.error("Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteSkill(deleteTarget.id);
      toast.success("Skill deleted!");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const grouped = skills.reduce<Record<string, SkillData[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills"
        description="Manage the tools and technologies showcased in your stack."
        action={
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4" /> Add Skill
          </Button>
        }
      />

      {isLoading ? (
        <SkillsGroupSkeleton />
      ) : skills.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          No skills yet. Click &quot;Add Skill&quot; to build your stack.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="bg-muted/50 text-xs font-semibold text-muted-foreground border-b border-border px-6 py-3 capitalize">
                {category}
              </div>
              <Table>
                <TableBody>
                  {items.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell className="font-semibold text-foreground">{skill.name}</TableCell>
                      <TableCell className="text-muted-foreground font-sans text-xs">{skill.icon || "—"}</TableCell>
                      <TableCell className="text-muted-foreground font-sans text-xs">Order {skill.order}</TableCell>
                      <TableCell className="text-right">
                        <RowActionsMenu
                          actions={[
                            {
                              label: "Edit",
                              icon: <Edit2 className="h-3.5 w-3.5" />,
                              onClick: () => openEditModal(skill),
                            },
                            {
                              label: "Delete",
                              icon: <Trash2 className="h-3.5 w-3.5" />,
                              onClick: () => setDeleteTarget(skill),
                              variant: "destructive",
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Skill"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSkill ? "Edit Skill" : "Add Skill"}</DialogTitle>
            <DialogDescription>
              {editingSkill ? "Update skill details" : "Add a new skill to your tech stack"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name" className="text-xs font-semibold">Name *</Label>
              <Input
                id="skill-name"
                type="text"
                required
                placeholder="Next.js"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skill-category" className="text-xs font-semibold">Category</Label>
                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                  <SelectTrigger id="skill-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill-order" className="text-xs font-semibold">Order</Label>
                <Input
                  id="skill-order"
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill-icon" className="text-xs font-semibold">Icon identifier (optional)</Label>
              <Input
                id="skill-icon"
                type="text"
                placeholder="e.g. si-nextdotjs"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              />
            </div>
          </form>

          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} onClick={handleSubmit}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
