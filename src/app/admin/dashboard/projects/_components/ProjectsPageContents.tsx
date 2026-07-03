'use client';

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { ImageUpload } from "../../_components/ImageUpload";
import { PageHeader } from "@/components/admin/PageHeader";
import { RowActionsMenu } from "@/components/admin/RowActionsMenu";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { CardGridSkeleton } from "@/components/admin/CardGridSkeleton";

export function ProjectsPageContents() {
  const {
    projects,
    experiences,
    fetchProjects,
    fetchExperiences,
    createProject,
    updateProject,
    deleteProject,
  } = usePortfolioStore();

  const [isLoading, setIsLoading] = useState(true);
  const [editingProj, setEditingProj] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<{ value: string; label: string }[]>([]);

  const [form, setForm] = useState({
    title: "", subtitle: "", slug: "", category: "", role: "",
    company: "", timeline: "", desc: "", fullDesc: "", tech: "",
    features: "", contributions: "", live: "", image: "", imageAlt: "",
    span: "md:col-span-1", architectureTitle: "", architectureDesc: "",
    architectureTree: "", order: 0, experienceId: "none", featured: false,
  });

  useEffect(() => {
    Promise.all([fetchProjects(), fetchExperiences()]).finally(() => setIsLoading(false));
  }, [fetchProjects, fetchExperiences]);

  const openAddModal = () => {
    setEditingProj(null);
    setMetrics([]);
    setForm({
      title: "", subtitle: "", slug: "", category: "Full-Stack Project",
      role: "Lead Developer", company: "Personal", timeline: "", desc: "",
      fullDesc: "", tech: "", features: "", contributions: "",
      live: "", image: "", imageAlt: "", span: "md:col-span-1",
      architectureTitle: "", architectureDesc: "", architectureTree: "",
      order: projects.length, experienceId: "none", featured: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (proj: any) => {
    setEditingProj(proj);
    setMetrics(Array.isArray(proj.metrics) ? proj.metrics : []);
    setForm({
      title: proj.title || "", subtitle: proj.subtitle || "",
      slug: proj.slug || "", category: proj.category || "",
      role: proj.role || "", company: proj.company || "",
      timeline: proj.timeline || "", desc: proj.desc || "",
      fullDesc: proj.fullDesc || "",
      tech: Array.isArray(proj.tech) ? proj.tech.join(", ") : "",
      features: Array.isArray(proj.features) ? proj.features.join("\n") : "",
      contributions: Array.isArray(proj.contributions) ? proj.contributions.join("\n") : "",
      live: proj.live || "", image: proj.image || "", imageAlt: proj.imageAlt || "",
      span: proj.span || "md:col-span-1",
      architectureTitle: proj.architectureTitle || "",
      architectureDesc: proj.architectureDesc || "",
      architectureTree: proj.architectureTree || "",
      order: proj.order || 0, experienceId: proj.experienceId || "none",
      featured: Boolean(proj.featured),
    });
    setIsModalOpen(true);
  };

  const addMetricField = () => setMetrics([...metrics, { value: "", label: "" }]);
  const removeMetricField = (idx: number) => setMetrics(metrics.filter((_, i) => i !== idx));
  const handleMetricChange = (idx: number, field: "value" | "label", val: string) => {
    const next = [...metrics];
    next[idx] = { ...next[idx], [field]: val };
    setMetrics(next);
  };

  const handleImageChange = useCallback((url: string) => {
    setForm((prev) => ({ ...prev, image: url }));
  }, []);

  const handleImageAltChange = useCallback((altText: string) => {
    setForm((prev) => ({ ...prev, imageAlt: altText }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      tech: form.tech.split(",").map((t) => t.trim()).filter(Boolean),
      features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
      contributions: form.contributions.split("\n").map((c) => c.trim()).filter(Boolean),
      metrics: metrics.filter((m) => m.value && m.label),
      experienceId: form.experienceId === "none" ? null : form.experienceId,
    };
    try {
      if (editingProj) {
        await updateProject(editingProj.id, payload);
        toast.success("Project updated!");
      } else {
        await createProject(payload);
        toast.success("Project created!");
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
      await deleteProject(deleteTarget.id);
      toast.success("Project deleted!");
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
        title="Projects"
        description="Manage case studies, tools, and SaaS portfolios."
        action={
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4" /> Add Project
          </Button>
        }
      />

      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          No projects yet. Click &quot;Add Project&quot; to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div key={proj.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground font-medium">{proj.category}</span>
                    {proj.featured && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">★ Featured</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">Order {proj.order}</span>
                </div>
                <h3 className="text-lg font-medium text-foreground mt-2">{proj.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 truncate">{proj.subtitle}</p>
              </div>
              <div className="flex justify-end mt-5 pt-4 border-t border-border/60">
                <RowActionsMenu
                  actions={[
                    {
                      label: "Edit",
                      icon: <Edit2 className="h-3.5 w-3.5" />,
                      onClick: () => openEditModal(proj),
                    },
                    {
                      label: "Delete",
                      icon: <Trash2 className="h-3.5 w-3.5" />,
                      onClick: () => setDeleteTarget({ id: proj.id, title: proj.title }),
                      variant: "destructive",
                    },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="!w-[90vw] !max-w-7xl max-h-[85vh] !flex !flex-col !gap-0 !p-0" style={{ display: "flex", flexDirection: "column" }}>
          <div className="px-8 py-4 border-b border-border flex-shrink-0">
            <DialogTitle className="text-lg font-semibold">{editingProj ? "Edit Project" : "Add Project"}</DialogTitle>
            <DialogDescription>
              {editingProj ? "Update project details and publish" : "Create a new project case study"}
            </DialogDescription>
          </div>

          <div className="flex-1 min-h-0" style={{ overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            <form id="project-form" onSubmit={handleSubmit} className="space-y-6 px-8 py-6 w-full">
              <div className="grid grid-cols-2 gap-6 w-full">
                <div className="space-y-2">
                  <Label htmlFor="proj-title" className="text-xs font-semibold">Title</Label>
                  <Input id="proj-title" type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-subtitle" className="text-xs font-semibold">Subtitle</Label>
                  <Input id="proj-subtitle" type="text" required value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 w-full">
                <div className="space-y-2">
                  <Label htmlFor="proj-slug" className="text-xs font-semibold">Slug (URL identifier)</Label>
                  <Input id="proj-slug" type="text" required placeholder="nexdrop" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-category" className="text-xs font-semibold">Category</Label>
                  <Input id="proj-category" type="text" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div className="space-y-2 w-full">
                  <Label htmlFor="proj-exp" className="text-xs font-semibold">Experience Association</Label>
                  <Select value={form.experienceId} onValueChange={(val) => setForm({ ...form, experienceId: val })}>
                    <SelectTrigger id="proj-exp">
                      <SelectValue placeholder="Select experience..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Personal Project (No Experience)</SelectItem>
                      {experiences.map((exp) => (
                        <SelectItem key={exp.id} value={exp.id}>{exp.company} - {exp.role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6 w-full">
                <div className="space-y-2">
                  <Label htmlFor="proj-role" className="text-xs font-semibold">Role</Label>
                  <Input id="proj-role" type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-company" className="text-xs font-semibold">Company Name</Label>
                  <Input id="proj-company" type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-timeline" className="text-xs font-semibold">Timeline</Label>
                  <Input id="proj-timeline" type="text" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-span" className="text-xs font-semibold">Layout Span</Label>
                  <Select value={form.span} onValueChange={(val) => setForm({ ...form, span: val })}>
                    <SelectTrigger id="proj-span">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="md:col-span-1">Single Column (Small)</SelectItem>
                      <SelectItem value="md:col-span-2">Double Column (Medium)</SelectItem>
                      <SelectItem value="md:col-span-3">Full Width (Large)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proj-live" className="text-xs font-semibold">Live Website URL</Label>
                <Input id="proj-live" type="url" value={form.live} onChange={(e) => setForm({ ...form, live: e.target.value })} />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="proj-featured"
                  checked={form.featured}
                  onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
                />
                <Label htmlFor="proj-featured" className="text-xs font-semibold cursor-pointer">
                  Featured <span className="text-muted-foreground/70 normal-case font-normal text-xs">(show in homepage Case Studies)</span>
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proj-tech" className="text-xs font-semibold">Tech Stack (Comma Separated)</Label>
                <Input id="proj-tech" type="text" required placeholder="React, Next.js, Go, PostgreSQL" value={form.tech} onChange={(e) => setForm({ ...form, tech: e.target.value })} />
              </div>

              <div className="grid grid-cols-3 gap-6 w-full">
                <div className="space-y-2">
                  <Label htmlFor="proj-desc" className="text-xs font-semibold">Short Description</Label>
                  <Textarea id="proj-desc" required rows={3} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-features" className="text-xs font-semibold">Key Features (One Per Line)</Label>
                  <Textarea id="proj-features" rows={3} placeholder={"Real-time web socket sync\nStripe payment gateway Integration"} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-contrib" className="text-xs font-semibold">Contributions (One Per Line)</Label>
                  <Textarea id="proj-contrib" rows={3} placeholder={"Architected the microservice database\nDecreased build latency by 40%"} value={form.contributions} onChange={(e) => setForm({ ...form, contributions: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proj-fullDesc" className="text-xs font-semibold">Full Overview (Markdown Supported)</Label>
                <Textarea id="proj-fullDesc" required rows={4} value={form.fullDesc} onChange={(e) => setForm({ ...form, fullDesc: e.target.value })} />
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <h3 className="text-base font-semibold text-foreground">System Architecture</h3>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="proj-archTitle" className="text-xs font-semibold">Architecture Diagram Title</Label>
                    <Input id="proj-archTitle" type="text" placeholder="Next.js edge network routing map" value={form.architectureTitle} onChange={(e) => setForm({ ...form, architectureTitle: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proj-archDesc" className="text-xs font-semibold">Architecture Details / Description</Label>
                    <Input id="proj-archDesc" type="text" value={form.architectureDesc} onChange={(e) => setForm({ ...form, architectureDesc: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proj-archTree" className="text-xs font-semibold">Folder Tree Directory Map</Label>
                  <Textarea id="proj-archTree" rows={3} placeholder={"my-app/\n├── src/\n│   ├── app/\n│   └── components/"} value={form.architectureTree} onChange={(e) => setForm({ ...form, architectureTree: e.target.value })} className="font-sans text-xs text-green-500/90" />
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-semibold text-foreground">Metrics / Stats</h3>
                  <Button type="button" onClick={addMetricField} variant="ghost" size="sm">
                    <PlusCircle className="h-3.5 w-3.5" /> Add Metric
                  </Button>
                </div>
                <div className="space-y-3">
                  {metrics.map((metric, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <Input type="text" placeholder="Value (e.g. 40%)" value={metric.value} required onChange={(e) => handleMetricChange(idx, "value", e.target.value)} className="w-1/3 text-xs" />
                      <Input type="text" placeholder="Label (e.g. Less build time)" value={metric.label} required onChange={(e) => handleMetricChange(idx, "label", e.target.value)} className="flex-1 text-xs" />
                      <Button type="button" onClick={() => removeMetricField(idx)} variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full">
                <ImageUpload
                  label="Image Cover"
                  folder="projects"
                  value={form.image}
                  onChange={handleImageChange}
                  alt={form.imageAlt}
                  onAltChange={handleImageAltChange}
                />
              </div>
            </form>
          </div>

          <div className="px-8 py-4 border-t border-border shrink-0 bg-muted/30 flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="project-form" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
