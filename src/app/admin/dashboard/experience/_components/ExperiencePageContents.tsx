'use client';

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { usePortfolioStore } from "@/store/usePortfolioStore";

export function ExperiencePageContents() {
  const {
    experiences,
    fetchExperiences,
    createExperience,
    updateExperience,
    deleteExperience,
  } = usePortfolioStore();

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

  useEffect(() => {
    fetchExperiences();
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
    } catch (err) {
      toast.error("Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
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
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4" /> Add Experience
        </Button>
      </div>

      {/* Experience Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-mono text-[10px] uppercase">Company</TableHead>
              <TableHead className="font-mono text-[10px] uppercase">Role</TableHead>
              <TableHead className="font-mono text-[10px] uppercase">Timeline</TableHead>
              <TableHead className="font-mono text-[10px] uppercase">Order</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experiences.map((exp) => (
              <TableRow key={exp.id}>
                <TableCell className="font-semibold text-foreground">{exp.company}</TableCell>
                <TableCell className="text-muted-foreground">{exp.role}</TableCell>
                <TableCell className="text-muted-foreground">{exp.timeline}</TableCell>
                <TableCell className="text-muted-foreground font-mono">{exp.order}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button onClick={() => openEditModal(exp)} variant="ghost" size="sm">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Experience</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this experience? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(exp.id)} className="bg-red-600 hover:bg-red-700">
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

      {/* Edit/Create Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExp ? "Edit Experience" : "Add Experience"}</DialogTitle>
            <DialogDescription>
              {editingExp ? "Update your work experience details" : "Add a new work experience entry"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exp-company" className="font-mono text-[9px] uppercase">Company</Label>
                <Input id="exp-company" type="text" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-role" className="font-mono text-[9px] uppercase">Role</Label>
                <Input id="exp-role" type="text" required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="exp-location" className="font-mono text-[9px] uppercase">Location</Label>
                <Input id="exp-location" type="text" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-order" className="font-mono text-[9px] uppercase">Order</Label>
                <Input id="exp-order" type="number" required value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-timeline" className="font-mono text-[9px] uppercase">Timeline</Label>
              <Input id="exp-timeline" type="text" required placeholder="Jul 2025 — Present" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-desc" className="font-mono text-[9px] uppercase">Description</Label>
              <Textarea id="exp-desc" required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </form>

          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} onClick={handleSubmit}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Experience
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
