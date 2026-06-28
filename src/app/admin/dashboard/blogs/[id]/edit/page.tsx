import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogEditor } from "../../_components/BlogEditor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) notFound();

  // Serialize dates for client boundary
  const serialized = {
    ...blog,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
    coverImage: blog.coverImage ?? '',
    coverImageAlt: blog.coverImageAlt ?? '',
    category: blog.category ?? '',
    tags: blog.tags ?? [],
    metaTitle: blog.metaTitle ?? '',
    metaDescription: blog.metaDescription ?? '',
  };

  return <BlogEditor initialData={serialized} />;
}
