'use client';

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, Loader2, PlusCircle, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { ImageUpload } from "@/app/admin/dashboard/_components/ImageUpload";
import { PageHeader } from "@/components/admin/PageHeader";
import { RowActionsMenu } from "@/components/admin/RowActionsMenu";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { CardGridSkeleton } from "@/components/admin/CardGridSkeleton";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/admin/EmptyState";
import { FormDialog } from "@/components/admin/FormDialog";
import { AdminBadge } from "@/components/admin/AdminBadge";

// Form validation schema using Zod
const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  slug: z.string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens (e.g. my-project)"),
  category: z.string().min(1, "Category is required"),
  desc: z.string().min(1, "Short pitch description is required"),
  fullDesc: z.string().min(1, "Full overview description is required"),
  tech: z.string().min(1, "Tech stack (at least one tag) is required"),
  image: z.string().min(1, "Cover image is required"),
  live: z.string().url("Must be a valid URL (e.g. https://...)").or(z.literal("")).or(z.null()).optional(),
});

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showArch, setShowArch] = useState(false);

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
    setErrors({});
    setShowArch(false);
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
    setErrors({});
    setShowArch(!!proj.architectureTree);
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
    setErrors((prev) => ({ ...prev, image: "" }));
  }, []);

  const handleImageAltChange = useCallback((altText: string) => {
    setForm((prev) => ({ ...prev, imageAlt: altText }));
  }, []);

  const prefillTree = (type: "next" | "node" | "clear") => {
    if (type === "clear") {
      setForm((f) => ({ ...f, architectureTree: "" }));
      return;
    }
    const trees = {
      next: `my-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/
│   └── lib/`,
      node: `server/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── index.ts
├── package.json
└── tsconfig.json`,
    };
    setForm((f) => ({ ...f, architectureTree: trees[type] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = projectSchema.safeParse(form);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Please fill all required fields correctly.");
      return;
    }

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
        <EmptyState
          title="No projects yet"
          description='Click "Add Project" to get started and showcase your work.'
          icon={PlusCircle}
          action={
            <Button onClick={openAddModal}>
              <Plus className="h-4 w-4" /> Add Project
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((proj) => (
            <Card key={proj.id} className="group overflow-hidden border border-border shadow-sm dark:shadow-none flex flex-col rounded-xl hover:border-foreground/20 transition-all duration-300">
              {/* Cover Image/Placeholder */}
              <div className="relative h-32 w-full overflow-hidden bg-muted border-b border-border/50">
                {proj.image ? (
                  <img
                    src={proj.image}
                    alt={proj.imageAlt || proj.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary/5 to-muted/30 flex items-center justify-center">
                    <FolderKanban className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="text-[9px] text-foreground bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full font-medium border border-border/45 shadow-sm">
                    Order {proj.order}
                  </span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-primary">{proj.category}</span>
                    {proj.featured && (
                      <AdminBadge variant="success" className="py-0 px-1.5 text-[9px] font-medium leading-none h-4">Featured</AdminBadge>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mt-1.5 line-clamp-1">{proj.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{proj.subtitle}</p>
                  
                  {/* Tech stack badges */}
                  {Array.isArray(proj.tech) && proj.tech.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {proj.tech.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-[9px] bg-muted/65 text-foreground px-1.5 py-0.5 rounded font-sans">
                          {tag}
                        </span>
                      ))}
                      {proj.tech.length > 3 && (
                        <span className="text-[9px] text-muted-foreground self-center pl-0.5">
                          +{proj.tech.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
                  <span className="text-[10px] text-muted-foreground font-sans">{proj.company || "Personal"} · {proj.timeline || "No Date"}</span>
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
            </Card>
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

      <FormDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingProj ? "Edit Project" : "Add Project"}
        description={editingProj ? "Update project details and publish" : "Create a new project case study"}
        size="2xl"
        onSubmit={handleSubmit}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Project
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-full">
          {/* Left Column - Main Content (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground/80 border-b pb-1">Core Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="proj-title" className="text-xs font-semibold">Title <span className="text-destructive">*</span></Label>
                  <Input 
                    id="proj-title" 
                    type="text" 
                    placeholder="E.g., Nexdrop SaaS" 
                    value={form.title} 
                    onChange={(e) => {
                      setForm({ ...form, title: e.target.value });
                      if (errors.title) setErrors(prev => ({ ...prev, title: "" }));
                    }} 
                    className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errors.title && <p className="text-[11px] text-destructive font-sans font-medium mt-1">{errors.title}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="proj-subtitle" className="text-xs font-semibold">Subtitle <span className="text-destructive">*</span></Label>
                  <Input 
                    id="proj-subtitle" 
                    type="text" 
                    placeholder="E.g., Real-time collaboration tool" 
                    value={form.subtitle} 
                    onChange={(e) => {
                      setForm({ ...form, subtitle: e.target.value });
                      if (errors.subtitle) setErrors(prev => ({ ...prev, subtitle: "" }));
                    }} 
                    className={errors.subtitle ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errors.subtitle && <p className="text-[11px] text-destructive font-sans font-medium mt-1">{errors.subtitle}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proj-desc" className="text-xs font-semibold">Short Pitch / Summary <span className="text-destructive">*</span></Label>
                <Textarea 
                  id="proj-desc" 
                  rows={2} 
                  placeholder="Summarize your project in 2 sentences..." 
                  value={form.desc} 
                  onChange={(e) => {
                    setForm({ ...form, desc: e.target.value });
                    if (errors.desc) setErrors(prev => ({ ...prev, desc: "" }));
                  }} 
                  className={errors.desc ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.desc && <p className="text-[11px] text-destructive font-sans font-medium mt-1">{errors.desc}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proj-fullDesc" className="text-xs font-semibold">Full Overview (Markdown Case Study) <span className="text-destructive">*</span></Label>
                <Textarea 
                  id="proj-fullDesc" 
                  rows={5} 
                  placeholder="Markdown overview, rich details, challenges..." 
                  value={form.fullDesc} 
                  onChange={(e) => {
                    setForm({ ...form, fullDesc: e.target.value });
                    if (errors.fullDesc) setErrors(prev => ({ ...prev, fullDesc: "" }));
                  }} 
                  className={errors.fullDesc ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.fullDesc && <p className="text-[11px] text-destructive font-sans font-medium mt-1">{errors.fullDesc}</p>}
              </div>
            </div>

            {/* Metrics */}
            <div className="border-t border-border pt-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-foreground/80">Project Metrics</h4>
                  <p className="text-[11px] text-muted-foreground font-sans">E.g., metrics, database statistics, performance</p>
                </div>
                <Button type="button" onClick={addMetricField} variant="outline" size="sm" className="h-8">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Metric
                </Button>
              </div>
              
              {metrics.length === 0 ? (
                <p className="text-xs text-muted-foreground/80 italic py-2">No metrics added yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {metrics.map((metric, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <Input 
                        type="text" 
                        placeholder="Value (e.g. 40%)" 
                        value={metric.value} 
                        onChange={(e) => handleMetricChange(idx, "value", e.target.value)} 
                        className="w-1/3 text-xs" 
                      />
                      <Input 
                        type="text" 
                        placeholder="Label (e.g. Less build time)" 
                        value={metric.label} 
                        onChange={(e) => handleMetricChange(idx, "label", e.target.value)} 
                        className="flex-1 text-xs" 
                      />
                      <Button type="button" onClick={() => removeMetricField(idx)} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className="border-t border-border pt-5 space-y-3">
              <h4 className="text-sm font-semibold text-foreground/80">Project Banner <span className="text-destructive">*</span></h4>
              <ImageUpload
                label="Cover Image"
                folder="projects"
                value={form.image}
                onChange={handleImageChange}
                alt={form.imageAlt}
                onAltChange={handleImageAltChange}
              />
              {errors.image && <p className="text-[11px] text-destructive font-sans font-medium mt-1">{errors.image}</p>}
            </div>
          </div>

          {/* Right Column - Sidebar Parameters (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-border lg:pl-8">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground/80 border-b pb-1">Sidebar Attributes</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="proj-slug" className="text-xs font-semibold">Slug <span className="text-destructive">*</span></Label>
                  <Input 
                    id="proj-slug" 
                    type="text" 
                    placeholder="nexdrop-saas" 
                    value={form.slug} 
                    onChange={(e) => {
                      setForm({ ...form, slug: e.target.value });
                      if (errors.slug) setErrors(prev => ({ ...prev, slug: "" }));
                    }} 
                    className={errors.slug ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errors.slug && <p className="text-[11px] text-destructive font-sans font-medium mt-1">{errors.slug}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="proj-category" className="text-xs font-semibold">Category <span className="text-destructive">*</span></Label>
                  <Input 
                    id="proj-category" 
                    type="text" 
                    placeholder="E.g., Full-Stack SaaS" 
                    value={form.category} 
                    onChange={(e) => {
                      setForm({ ...form, category: e.target.value });
                      if (errors.category) setErrors(prev => ({ ...prev, category: "" }));
                    }} 
                    className={errors.category ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errors.category && <p className="text-[11px] text-destructive font-sans font-medium mt-1">{errors.category}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="proj-role" className="text-xs font-semibold">Your Role</Label>
                  <Input id="proj-role" type="text" placeholder="E.g., Lead Developer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="proj-company" className="text-xs font-semibold">Company Name</Label>
                  <Input id="proj-company" type="text" placeholder="E.g., Personal / ACME" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="proj-timeline" className="text-xs font-semibold">Timeline</Label>
                  <Input id="proj-timeline" type="text" placeholder="E.g., Q1 2026 / Present" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="proj-span" className="text-xs font-semibold">Grid Width Span</Label>
                  <Select value={form.span} onValueChange={(val) => setForm({ ...form, span: val })}>
                    <SelectTrigger id="proj-span">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="md:col-span-1">1 Column (Small)</SelectItem>
                      <SelectItem value="md:col-span-2">2 Columns (Medium)</SelectItem>
                      <SelectItem value="md:col-span-3">Full Width (Large)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proj-live" className="text-xs font-semibold">Live URL</Label>
                <Input 
                  id="proj-live" 
                  type="url" 
                  placeholder="https://example.com" 
                  value={form.live} 
                  onChange={(e) => {
                    setForm({ ...form, live: e.target.value });
                    if (errors.live) setErrors(prev => ({ ...prev, live: "" }));
                  }} 
                  className={errors.live ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.live && <p className="text-[11px] text-destructive font-sans font-medium mt-1">{errors.live}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proj-exp" className="text-xs font-semibold">Linked Work Experience</Label>
                <Select value={form.experienceId} onValueChange={(val) => setForm({ ...form, experienceId: val })}>
                  <SelectTrigger id="proj-exp">
                    <SelectValue placeholder="Select experience..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No experience association</SelectItem>
                    {experiences.map((exp) => (
                      <SelectItem key={exp.id} value={exp.id}>{exp.company} - {exp.role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3 py-2">
                <Switch
                  id="proj-featured"
                  checked={form.featured}
                  onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
                />
                <Label htmlFor="proj-featured" className="text-xs font-semibold cursor-pointer">
                  Featured Case Study
                </Label>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proj-tech" className="text-xs font-semibold">Tech Stack (Comma Separated) <span className="text-destructive">*</span></Label>
                <Input 
                  id="proj-tech" 
                  type="text" 
                  placeholder="React, Go, PostgreSQL" 
                  value={form.tech} 
                  onChange={(e) => {
                    setForm({ ...form, tech: e.target.value });
                    if (errors.tech) setErrors(prev => ({ ...prev, tech: "" }));
                  }} 
                  className={errors.tech ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.tech && <p className="text-[11px] text-destructive font-sans font-medium mt-1">{errors.tech}</p>}
              </div>
            </div>

            {/* Collapsible Architecture Map */}
            <div className="border-t border-border pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-foreground/80">System Architecture</h4>
                  <p className="text-[10px] text-muted-foreground font-sans">Optional design structure details</p>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowArch(!showArch)}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showArch ? "Hide Options" : "Show Options"}
                </Button>
              </div>

              {showArch && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/20 border border-border/60">
                  <div className="space-y-1.5">
                    <Label htmlFor="proj-archTitle" className="text-[11px] font-semibold">Diagram Title</Label>
                    <Input id="proj-archTitle" type="text" placeholder="E.g., Component layout map" value={form.architectureTitle} onChange={(e) => setForm({ ...form, architectureTitle: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="proj-archDesc" className="text-[11px] font-semibold">Architecture Description</Label>
                    <Input id="proj-archDesc" type="text" placeholder="E.g., Database orchestration diagram" value={form.architectureDesc} onChange={(e) => setForm({ ...form, architectureDesc: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center mb-1">
                      <Label htmlFor="proj-archTree" className="text-[11px] font-semibold">Folder Tree Map</Label>
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => prefillTree("next")} className="text-[10px] bg-background hover:bg-muted text-muted-foreground px-1.5 py-0.5 rounded border">Next.js</button>
                        <button type="button" onClick={() => prefillTree("node")} className="text-[10px] bg-background hover:bg-muted text-muted-foreground px-1.5 py-0.5 rounded border">Node</button>
                        <button type="button" onClick={() => prefillTree("clear")} className="text-[10px] bg-destructive/5 hover:bg-destructive/10 text-destructive px-1.5 py-0.5 rounded border border-destructive/20">Clear</button>
                      </div>
                    </div>
                    <Textarea 
                      id="proj-archTree" 
                      rows={4} 
                      placeholder="Folder structure tree map..." 
                      value={form.architectureTree} 
                      onChange={(e) => setForm({ ...form, architectureTree: e.target.value })} 
                      className="font-mono text-[11px] leading-relaxed" 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Highlights */}
            <div className="border-t border-border pt-5 space-y-4">
              <h4 className="text-sm font-semibold text-foreground/80">Bullet Highlights</h4>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="proj-features" className="text-xs font-semibold">Key Features (One per line)</Label>
                  <Textarea id="proj-features" rows={2} placeholder="Real-time WebSockets&#10;Stripe payment Integration" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="proj-contrib" className="text-xs font-semibold">Contributions (One per line)</Label>
                  <Textarea id="proj-contrib" rows={2} placeholder="Architected the microservices&#10;Decreased latency by 45%" value={form.contributions} onChange={(e) => setForm({ ...form, contributions: e.target.value })} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
