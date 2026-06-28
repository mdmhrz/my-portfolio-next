'use client';

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import { ImageUpload } from "../../_components/ImageUpload";
import { slugify } from "@/lib/utils";
import { usePortfolioStore } from "@/store/usePortfolioStore";

export function BlogsPageContents() {
  const { blogs, fetchBlogs, createBlog: addBlog, updateBlog, deleteBlog } = usePortfolioStore();

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // Tracks whether the user manually edited the slug (disables auto-generation).
  const [slugTouched, setSlugTouched] = useState(false);

  const [form, setForm] = useState({
    title: "", slug: "", category: "", excerpt: "", coverImage: "", coverImageAlt: "", content: "", published: false,
  });

  const openAddModal = () => {
    setEditingBlog(null);
    setSlugTouched(false);
    setForm({ title: "", slug: "", category: "", excerpt: "", coverImage: "", coverImageAlt: "", content: "", published: false });
    setIsModalOpen(true);
  };

  const openEditModal = (blog: any) => {
    setEditingBlog(blog);
    setSlugTouched(true); // keep existing slug unless the user edits the title
    setForm({
      title: blog.title || "", slug: blog.slug || "", category: blog.category || "",
      excerpt: blog.excerpt || "", coverImage: blog.coverImage || "", coverImageAlt: blog.coverImageAlt || "",
      content: blog.content || "", published: blog.published || false,
    });
    setIsModalOpen(true);
  };

  // Auto-generate a URL-safe slug from the title until the user edits the slug manually.
  const handleTitleChange = (value: string) => {
    setForm((prev) => ({ ...prev, title: value, slug: slugTouched ? prev.slug : slugify(value) }));
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: value }));
  };

  const handleCoverImageChange = (value: string) => {
    setForm((prev) => ({ ...prev, coverImage: value }));
  };

  const handleCoverImageAltChange = (value: string) => {
    setForm((prev) => ({ ...prev, coverImageAlt: value }));
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
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4" /> Add Blog Post
        </Button>
      </div>

      {/* Blogs Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-mono text-[10px] uppercase">Title</TableHead>
              <TableHead className="font-mono text-[10px] uppercase">Slug</TableHead>
              <TableHead className="font-mono text-[10px] uppercase">Status</TableHead>
              <TableHead className="font-mono text-[10px] uppercase">Date</TableHead>
              <TableHead className="font-mono text-[10px] uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.map((b: any) => {
              const formattedDate = new Date(b.createdAt).toLocaleDateString();
              return (
                <TableRow key={b.id}>
                  <TableCell className="font-semibold text-foreground truncate max-w-[200px]">{b.title}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{b.slug}</TableCell>
                  <TableCell>
                    <Badge variant={b.published ? "default" : "secondary"}>
                      {b.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{formattedDate}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button onClick={() => openEditModal(b)} variant="ghost" size="sm">
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
                          <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{b.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(b.id)} className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Blog Editor Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBlog ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
            <DialogDescription>
              {editingBlog ? "Update post details and publish" : "Write a new article for your blog"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="blog-title" className="font-mono text-[9px] uppercase">Title</Label>
                    <Input id="blog-title" type="text" required value={form.title} onChange={(e) => handleTitleChange(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blog-slug" className="font-mono text-[9px] uppercase">Slug (URL)</Label>
                    <Input id="blog-slug" type="text" required placeholder="auto-generated-from-title" value={form.slug} onChange={(e) => handleSlugChange(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blog-category" className="font-mono text-[9px] uppercase">Category</Label>
                  <Input id="blog-category" type="text" placeholder="Next.js, DevOps, Career…" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  <span className="text-[10px] text-muted-foreground font-mono">Used for the blog listing filters.</span>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox id="blog-published" checked={form.published} onCheckedChange={(checked) => setForm({ ...form, published: checked === true })} />
                  <Label htmlFor="blog-published" className="font-mono text-[10px] uppercase tracking-wider cursor-pointer">
                    Publish Immediately
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blog-excerpt" className="font-mono text-[9px] uppercase">Excerpt / Short Description</Label>
                  <Textarea id="blog-excerpt" required rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blog-content" className="font-mono text-[9px] uppercase">Content (Markdown Format)</Label>
                  <Textarea id="blog-content" required rows={12} placeholder={"# Hello World\n\nWrite articles in normal Markdown format here..."} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="font-mono" />
                </div>

                <div className="w-full">
                  <ImageUpload
                    label="Cover Image"
                    folder="blogs"
                    value={form.coverImage}
                    onChange={handleCoverImageChange}
                    alt={form.coverImageAlt}
                    onAltChange={handleCoverImageAltChange}
                  />
                </div>
          </form>

          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} onClick={handleSubmit}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Blog
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
