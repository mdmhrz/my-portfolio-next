'use client';

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePortfolioStore, type SkillData } from "@/store/usePortfolioStore";

const CATEGORIES = ["frontend", "backend", "devops", "tools", "database", "other"];

export function SkillsPageContents() {
  const { skills, fetchSkills, createSkill, updateSkill, deleteSkill } = usePortfolioStore();

  const [editingSkill, setEditingSkill] = useState<SkillData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", category: "frontend", icon: "", order: 0 });

  useEffect(() => {
    fetchSkills();
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
    } catch (err) {
      toast.error("Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSkill(id);
      toast.success(“Skill deleted!”);
    } catch (err) {
      toast.error(“Failed to delete.”);
    }
  };

  // Group skills by category for display
  const grouped = skills.reduce<Record<string, SkillData[]>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  return (
    <div className=”space-y-6”>
      <div className=”flex justify-between items-center”>
        <div>
          <h1 className=”text-2xl font-medium tracking-tight”>Skills</h1>
          <p className=”text-sm text-muted-foreground”>Manage the tools and technologies showcased in your stack.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className=”h-4 w-4” /> Add Skill
        </Button>
      </div>

      {skills.length === 0 ? (
        <div className=”rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground”>
          No skills yet. Click “Add Skill” to build your stack.
        </div>
      ) : (
        <div className=”space-y-6”>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className=”rounded-2xl border border-border bg-card overflow-hidden”>
              <div className=”bg-muted/50 font-mono text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border px-6 py-3”>
                {category}
              </div>
              <Table>
                <TableBody>
                  {items.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell className=”font-semibold text-foreground”>{skill.name}</TableCell>
                      <TableCell className=”text-muted-foreground font-mono text-xs”>{skill.icon || “—“}</TableCell>
                      <TableCell className=”text-muted-foreground font-mono text-xs”>Order {skill.order}</TableCell>
                      <TableCell className=”text-right space-x-2”>
                        <Button onClick={() => openEditModal(skill)} variant=”ghost” size=”sm”>
                          <Edit2 className=”h-3.5 w-3.5” />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant=”destructive” size=”sm”>
                              <Trash2 className=”h-3.5 w-3.5” />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Skill</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete “{skill.name}”? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(skill.id)} className=”bg-red-600 hover:bg-red-700”>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
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
              <Label htmlFor="skill-name" className="font-mono text-[9px] uppercase">Name *</Label>
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
                <Label htmlFor="skill-category" className="font-mono text-[9px] uppercase">Category</Label>
                <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                  <SelectTrigger id="skill-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill-order" className="font-mono text-[9px] uppercase">Order</Label>
                <Input
                  id="skill-order"
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill-icon" className="font-mono text-[9px] uppercase">Icon identifier (optional)</Label>
              <Input
                id="skill-icon"
                type="text"
                placeholder="e.g. si-nextdotjs or simple-icons name"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              />
            </div>
          </form>

          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
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
