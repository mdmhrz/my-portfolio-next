'use client';

import { useState } from "react";
import { Plus, Edit2, Trash2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ExperienceTab({ experiences, addExperience, updateExperience, deleteExperience }: any) {
  const [editingExp, setEditingExp] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    company: "",
    role: "",
    location: "",
    timeline: "",
    description: "",
    order: 0,
  });

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
        await addExperience(form);
        toast.success("Experience created!");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;
    try {
      await deleteExperience(id);
      toast.success("Experience deleted!");
    } catch (err) {
      toast.error("Failed to delete.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Experiences</h1>
          <p className="text-sm text-muted-foreground">Add, edit, or delete professional work records.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-foreground hover:bg-foreground/90 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-background transition-all cursor-pointer font-bold"
        >
          <Plus className="h-4 w-4" /> Add Experience
        </button>
      </div>

      {/* Experience Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 font-mono text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Timeline</th>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {experiences.map((exp: any) => (
              <tr key={exp.id} className="hover:bg-muted/10">
                <td className="px-6 py-4 font-semibold text-foreground">{exp.company}</td>
                <td className="px-6 py-4 text-muted-foreground">{exp.role}</td>
                <td className="px-6 py-4 text-muted-foreground">{exp.timeline}</td>
                <td className="px-6 py-4 text-muted-foreground font-mono">{exp.order}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => openEditModal(exp)}
                    className="p-1.5 rounded-lg border border-border bg-background hover:border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-1.5 rounded-lg border border-border bg-background hover:border-destructive/30 text-muted-foreground hover:text-destructive transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl flex flex-col max-h-[90vh] shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-lg font-medium">{editingExp ? "Edit Experience" : "Add Experience"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 md:p-8 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Company</label>
                    <input type="text" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Role</label>
                    <input type="text" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Location</label>
                    <input type="text" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Order</label>
                    <input type="number" required value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Timeline</label>
                  <input type="text" required placeholder="Jul 2025 — Present" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Description</label>
                  <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-border bg-card shrink-0 rounded-b-2xl">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border border-border hover:bg-muted px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-primary-foreground transition-all cursor-pointer font-bold disabled:opacity-50">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
