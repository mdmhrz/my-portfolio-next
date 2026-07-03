'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Star, StarOff, EyeOff, Globe, Send, Sliders } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { RowActionsMenu } from "@/components/admin/RowActionsMenu";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { Pagination } from "@/components/admin/Pagination";

const COLUMNS = ["Title", "Tags", "Status", "Featured", "Views", "Read", "Date", "Actions"];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function BlogsPageContents() {
  const router = useRouter();
  const { blogs, fetchBlogs, deleteBlog, updateBlog } = usePortfolioStore();

  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchBlogs().finally(() => setIsLoading(false));
  }, [fetchBlogs]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteBlog(deleteTarget.id);
      toast.success("Post deleted.");
      setDeleteTarget(null);
      if (paginatedBlogs.length === 1 && page > 1) setPage(page - 1);
    } catch {
      toast.error("Failed to delete post.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      await updateBlog(id, { featured: !currentFeatured });
      toast.success(currentFeatured ? "Removed from homepage slider." : "Added to homepage slider!");
    } catch {
      toast.error("Failed to update featured status.");
    }
  };

  const handleTogglePublished = async (id: string, currentPublished: boolean) => {
    try {
      await updateBlog(id, { published: !currentPublished });
      toast.success(currentPublished ? "Post moved to drafts." : "Post published successfully!");
    } catch {
      toast.error("Failed to update publish status.");
    }
  };

  const paginatedBlogs = blogs.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog Posts"
        description={`${blogs.length} post${blogs.length !== 1 ? "s" : ""} · ${blogs.filter((b) => b.published).length} published · ${blogs.filter((b) => b.featured && b.published).length} featured on homepage`}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/dashboard/blogs/display-settings")}
            >
              <Sliders className="h-4 w-4" />
              Display Settings
            </Button>
            <Button onClick={() => router.push("/admin/dashboard/blogs/new")}>
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </div>
        }
      />

      <DataTable
        columns={COLUMNS}
        isEmpty={!isLoading && blogs.length === 0}
        emptyMessage='No posts yet. Click "New Post" to write your first article.'
        isLoading={isLoading}
      >
        {paginatedBlogs.map((b) => (
          <TableRow key={b.id} className="group">
            <TableCell className="max-w-[220px]">
              <span className="block truncate font-medium text-foreground">{b.title}</span>
              <span className="block truncate font-sans text-xs text-muted-foreground">{b.slug}</span>
            </TableCell>

            <TableCell>
              <div className="flex flex-wrap gap-1">
                {(b.tags ?? []).slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-full font-sans text-xs px-2 py-0.5"
                  >
                    {tag}
                  </Badge>
                ))}
                {(b.tags ?? []).length > 2 && (
                  <span className="text-[10px] text-muted-foreground self-center">
                    +{b.tags.length - 2}
                  </span>
                )}
              </div>
            </TableCell>

            <TableCell>
              <Badge variant={b.published ? "default" : "secondary"}>
                {b.published ? "Published" : "Draft"}
              </Badge>
            </TableCell>

            <TableCell>
              {b.featured ? (
                <span
                  title="Appears in the homepage blog slider"
                  className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
                >
                  <Globe className="h-3 w-3" />
                  Homepage
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </TableCell>

            <TableCell className="font-sans text-xs text-muted-foreground">
              {(b.views ?? 0).toLocaleString()}
            </TableCell>

            <TableCell className="font-sans text-xs text-muted-foreground">
              {b.readingTime ?? 1}m
            </TableCell>

            <TableCell className="font-sans text-xs text-muted-foreground">
              {new Date(b.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </TableCell>

            <TableCell className="text-right">
              <RowActionsMenu
                actions={[
                  {
                    label: "Edit",
                    icon: <Edit2 className="h-3.5 w-3.5" />,
                    onClick: () => router.push(`/admin/dashboard/blogs/${b.id}/edit`),
                  },
                  b.published
                    ? {
                        label: "Move to Draft",
                        icon: <EyeOff className="h-3.5 w-3.5" />,
                        onClick: () => handleTogglePublished(b.id, b.published),
                      }
                    : {
                        label: "Publish",
                        icon: <Send className="h-3.5 w-3.5" />,
                        onClick: () => handleTogglePublished(b.id, b.published),
                      },
                  b.featured
                    ? {
                        label: "Remove from Homepage",
                        icon: <StarOff className="h-3.5 w-3.5" />,
                        onClick: () => handleToggleFeatured(b.id, b.featured),
                      }
                    : {
                        label: "Feature on Homepage",
                        icon: <Star className="h-3.5 w-3.5" />,
                        onClick: () => handleToggleFeatured(b.id, b.featured),
                      },
                  {
                    label: "Delete",
                    icon: <Trash2 className="h-3.5 w-3.5" />,
                    onClick: () => setDeleteTarget({ id: b.id, title: b.title }),
                    variant: "destructive",
                  },
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </DataTable>

      {!isLoading && blogs.length > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={blogs.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
        />
      )}

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.title}"?`}
        description="This permanently removes the post and cannot be undone."
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
