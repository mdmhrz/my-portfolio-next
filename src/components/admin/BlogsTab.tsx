'use client';

import { useState } from "react";
import { Plus, Edit2, Trash2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function BlogsTab({ blogs, addBlog, updateBlog, deleteBlog }: any) {
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", coverImage: "", content: "", published: false,
  });

  const openAddModal = () => {
    setEditingBlog(null);
    setForm({ title: "", slug: "", excerpt: "", coverImage: "", content: "", published: false });
    setIsModalOpen(true);
  };

  const openEditModal = (blog: any) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title || "", slug: blog.slug || "",
      excerpt: blog.excerpt || "", coverImage: blog.coverImage || "",
      content: blog.content || "", published: blog.published || false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingBlog) {
        await updateBlog(editingBlog.id, form);
        toast.success("Blog updated!");
      } else {
        await addBlog(form);
        toast.success("Blog published!");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await deleteBlog(id);
      toast.success("Blog deleted!");
    } catch (err) {
      toast.error("Failed to delete.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Blog Posts</h1>
          <p className="text-sm text-muted-foreground">Write markdown tech journals and articles.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 rounded-xl bg-foreground hover:bg-foreground/90 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-background transition-all cursor-pointer font-bold">
          <Plus className="h-4 w-4" /> Add Blog Post
        </button>
      </div>

      {/* Blogs Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 font-mono text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {blogs.map((b: any) => {
              const formattedDate = new Date(b.createdAt).toLocaleDateString();
              return (
                <tr key={b.id} className="hover:bg-muted/10">
                  <td className="px-6 py-4 font-semibold text-foreground truncate max-w-[200px]">{b.title}</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{b.slug}</td>
                  <td className="px-6 py-4">
                    {b.published ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">Published</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-400 ring-1 ring-inset ring-yellow-500/20">Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{formattedDate}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openEditModal(b)} className="p-1.5 rounded-lg border border-border bg-background hover:border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg border border-border bg-background hover:border-destructive/30 text-muted-foreground hover:text-destructive transition-all cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Blog Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-card border border-border rounded-2xl flex flex-col max-h-[90vh] shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-lg font-medium">{editingBlog ? "Edit Blog" : "Add Blog"}</h2>
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
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Slug</label>
                    <input type="text" required placeholder="deploying-next-js-with-docker" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Cover Image URL / Path</label>
                    <input type="text" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                  </div>
                  <div className="space-y-2 flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer select-none bg-background border border-border rounded-lg w-full px-4 py-2 text-sm">
                      <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded border-border bg-background text-foreground focus:ring-foreground h-4 w-4" />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-foreground">Publish Immediately</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Excerpt / Short Description</label>
                  <textarea required rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground" />
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Content (Markdown Format)</label>
                  <textarea required rows={12} placeholder={"# Hello World\n\nWrite articles in normal Markdown format here..."} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground font-mono" />
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
