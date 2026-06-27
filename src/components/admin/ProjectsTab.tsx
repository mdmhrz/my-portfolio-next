'use client';

import { useState } from "react";
import { Plus, Edit2, Trash2, XCircle, Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";

export function ProjectsTab({ projects, experiences, addProject, updateProject, deleteProject }: any) {
  const [editingProj, setEditingProj] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<{ value: string; label: string }[]>([]);

  const [form, setForm] = useState({
    title: "", subtitle: "", slug: "", category: "", role: "",
    company: "", timeline: "", desc: "", fullDesc: "", tech: "",
    features: "", contributions: "", live: "", image: "",
    span: "md:col-span-1", architectureTitle: "", architectureDesc: "",
    architectureTree: "", order: 0, experienceId: "",
  });

  const openAddModal = () => {
    setEditingProj(null);
    setMetrics([]);
    setForm({
      title: "", subtitle: "", slug: "", category: "Full-Stack Project",
      role: "Lead Developer", company: "Personal", timeline: "", desc: "",
      fullDesc: "", tech: "", features: "", contributions: "",
      live: "", image: "/images/mock-proj.jpg", span: "md:col-span-1",
      architectureTitle: "", architectureDesc: "", architectureTree: "",
      order: projects.length, experienceId: "",
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
      live: proj.live || "", image: proj.image || "",
      span: proj.span || "md:col-span-1",
      architectureTitle: proj.architectureTitle || "",
      architectureDesc: proj.architectureDesc || "",
      architectureTree: proj.architectureTree || "",
      order: proj.order || 0, experienceId: proj.experienceId || "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      tech: form.tech.split(",").map(t => t.trim()).filter(Boolean),
      features: form.features.split("\n").map(f => f.trim()).filter(Boolean),
      contributions: form.contributions.split("\n").map(c => c.trim()).filter(Boolean),
      metrics: metrics.filter(m => m.value && m.label),
      experienceId: form.experienceId || null,
    };
    try {
      if (editingProj) {
        await updateProject(editingProj.id, payload);
        toast.success("Project updated!");
      } else {
        await addProject(payload);
        toast.success("Project created!");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id);
      toast.success("Project deleted!");
    } catch (err) {
      toast.error("Failed to delete.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage case studies, tools, and SaaS portfolios.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 rounded-xl bg-foreground hover:bg-foreground/90 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-background transition-all cursor-pointer font-bold">
          <Plus className="h-4 w-4" /> Add Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj: any) => (
          <div key={proj.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">{proj.category}</span>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">Order {proj.order}</span>
              </div>
              <h3 className="text-lg font-medium text-foreground mt-2">{proj.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 truncate">{proj.subtitle}</p>
            </div>
            <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-border/60">
              <button onClick={() => openEditModal(proj)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:border-border text-xs text-foreground transition-all cursor-pointer">
                <Edit2 className="h-3 w-3" /> Edit
              </button>
              <button onClick={() => handleDelete(proj.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background hover:border-red-950/20 text-xs text-red-400 transition-all cursor-pointer">
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Project Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-card border border-border rounded-2xl flex flex-col max-h-[90vh] shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-lg font-medium">{editingProj ? "Edit Project" : "Add Project"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="p-6 md:p-8 space-y-4 overflow-y-auto flex-1">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Title</label>
                    <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Subtitle</label>
                    <input type="text" required value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Slug (URL identifier)</label>
                    <input type="text" required placeholder="nexdrop" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Category</label>
                    <input type="text" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Experience Association</label>
                    <select value={form.experienceId} onChange={(e) => setForm({ ...form, experienceId: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none">
                      <option value="">Personal Project (No Experience)</option>
                      {experiences.map((exp: any) => (
                        <option key={exp.id} value={exp.id}>{exp.company} - {exp.role}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Role</label>
                    <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Company Name</label>
                    <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Timeline</label>
                    <input type="text" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Layout Span</label>
                    <select value={form.span} onChange={(e) => setForm({ ...form, span: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none">
                      <option value="md:col-span-1">Single Column (Small)</option>
                      <option value="md:col-span-2">Double Column (Medium)</option>
                      <option value="md:col-span-3">Full Width (Large)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Live Website URL</label>
                    <input type="url" value={form.live} onChange={(e) => setForm({ ...form, live: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Image Cover Path / URL</label>
                    <input type="text" required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Tech Stack (Comma Separated)</label>
                  <input type="text" required placeholder="React, Next.js, Go, PostgreSQL" value={form.tech} onChange={(e) => setForm({ ...form, tech: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Short Description</label>
                    <textarea required rows={3} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Key Features (One Per Line)</label>
                    <textarea rows={3} placeholder={"Real-time web socket sync\nStripe payment gateway Integration"} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Contributions (One Per Line)</label>
                    <textarea rows={3} placeholder={"Architected the microservice database\nDecreased build latency by 40%"} value={form.contributions} onChange={(e) => setForm({ ...form, contributions: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Full Overview (Markdown Supported)</label>
                  <textarea required rows={4} value={form.fullDesc} onChange={(e) => setForm({ ...form, fullDesc: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                </div>

                {/* System Architecture */}
                <div className="border-t border-border pt-4 space-y-4">
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">// System Architecture</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block font-mono text-[9px] text-muted-foreground">Architecture Diagram Title</label>
                      <input type="text" placeholder="Next.js edge network routing map" value={form.architectureTitle} onChange={(e) => setForm({ ...form, architectureTitle: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-mono text-[9px] text-muted-foreground">Architecture Details / Description</label>
                      <input type="text" value={form.architectureDesc} onChange={(e) => setForm({ ...form, architectureDesc: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block font-mono text-[9px] text-muted-foreground">Folder Tree Directory Map</label>
                    <textarea rows={3} placeholder={"my-app/\n├── src/\n│   ├── app/\n│   └── components/"} value={form.architectureTree} onChange={(e) => setForm({ ...form, architectureTree: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 font-mono text-xs text-green-500/90" />
                  </div>
                </div>

                {/* Dynamic Metrics */}
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">// Metrics / Stats</h3>
                    <button type="button" onClick={addMetricField} className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground">
                      <PlusCircle className="h-3.5 w-3.5" /> Add Metric
                    </button>
                  </div>
                  <div className="space-y-2">
                    {metrics.map((metric, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <input type="text" placeholder="Value (e.g. 40%)" value={metric.value} required onChange={(e) => handleMetricChange(idx, "value", e.target.value)} className="block w-1/3 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground" />
                        <input type="text" placeholder="Label (e.g. Less build time)" value={metric.label} required onChange={(e) => handleMetricChange(idx, "label", e.target.value)} className="block flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground" />
                        <button type="button" onClick={() => removeMetricField(idx)} className="text-red-500 hover:text-destructive p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-border bg-card shrink-0 rounded-b-2xl">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border border-border hover:bg-muted px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-primary-foreground transition-all cursor-pointer font-bold disabled:opacity-50">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
