'use client';

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { FormDialog } from "@/components/admin/FormDialog";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { RowActionsMenu } from "@/components/admin/RowActionsMenu";
import { DeleteDialog } from "@/components/admin/DeleteDialog";

const COLUMNS = ["Company", "Role", "Timeline", "Order", "Actions"];

export function ExperiencePageContents() {
  const {
    experiences,
    fetchExperiences,
    createExperience,
    updateExperience,
    deleteExperience,
  } = usePortfolioStore();

  const [isLoading, setIsLoading] = useState(true);
  const [editingExp, setEditingExp] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    company: "",
    role: "",
    location: "",
    timeline: "",
    description: "",
    order: 0,
  });

  useEffect(() => {
    fetchExperiences().finally(() => setIsLoading(false));
  }, [fetchExperiences]);

  const openAddModal = () => {
    setEditingExp(null);
    setForm({ company: "", role: "", location: "", timeline: "", description: "", order: experiences.length });
    setIsModalOpen(true);
  };

  const openEditModal = (exp: any) => {
    setEditingExp(exp);
    setForm({
      company: exp.company || "",
      role: exp.role || "",
      location: exp.location || "",
      timeline: exp.timeline || "",
      description: exp.description || "",
      order: exp.order || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingExp) {
        await updateExperience(editingExp.id, form);
        toast.success("Experience updated!");
      } else {
        await createExperience(form);
        toast.success("Experience created!");
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
      await deleteExperience(deleteTarget.id);
      toast.success("Experience deleted!");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Experiences"
        description="Add, edit, or delete professional work records."
        action={
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4" /> Add Experience
          </Button>
        }
      />

      <DataTable
        columns={COLUMNS}
        isEmpty={!isLoading && experiences.length === 0}
        emptyMessage='No experiences yet. Click "Add Experience" to get started.'
        isLoading={isLoading}
      >
        {experiences.map((exp) => (
          <TableRow key={exp.id}>
            <TableCell className="font-semibold text-foreground">{exp.company}</TableCell>
            <TableCell className="text-muted-foreground">{exp.role}</TableCell>
            <TableCell className="text-muted-foreground">{exp.timeline}</TableCell>
            <TableCell className="text-muted-foreground font-sans">{exp.order}</TableCell>
            <TableCell className="text-right">
              <RowActionsMenu
                actions={[
                  {
                    label: "Edit",
                    icon: <Edit2 className="h-3.5 w-3.5" />,
                    onClick: () => openEditModal(exp),
                  },
                  {
                    label: "Delete",
                    icon: <Trash2 className="h-3.5 w-3.5" />,
                    onClick: () => setDeleteTarget({ id: exp.id, label: `${exp.company} — ${exp.role}` }),
                    variant: "destructive",
                  },
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </DataTable>

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Experience"
        description={`Are you sure you want to delete "${deleteTarget?.label}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />

      <FormDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingExp ? "Edit Experience" : "Add Experience"}
        description={editingExp ? "Update your work experience details" : "Add a new work experience entry"}
        size="lg"
        onSubmit={handleSubmit}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Experience
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exp-company" className="text-xs font-semibold">Company</Label>
              <Input id="exp-company" type="text" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-role" className="text-xs font-semibold">Role</Label>
              <Input id="exp-role" type="text" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="exp-location" className="text-xs font-semibold">Location</Label>
              <Input id="exp-location" type="text" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exp-order" className="text-xs font-semibold">Order</Label>
              <Input id="exp-order" type="number" required value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exp-timeline" className="text-xs font-semibold">Timeline</Label>
            <Input id="exp-timeline" type="text" required placeholder="Jul 2025 — Present" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exp-desc" className="text-xs font-semibold">Description</Label>
            <Textarea id="exp-desc" required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
