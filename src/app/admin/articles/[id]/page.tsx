export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";
import { BlockEditor } from "@/components/admin/block-editor";
import type { ArticleBlock } from "@/types";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await verifyAdmin();

  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  const articleData = {
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    coverImage: article.coverImage,
    category: article.category,
    tags: article.tags,
    blocks: (article.blocks as ArticleBlock[]) ?? [],
    published: article.published,
    featured: article.featured,
    tournamentName: article.tournamentName,
    tournamentDate: article.tournamentDate?.toISOString().split("T")[0] ?? null,
    tournamentLocation: article.tournamentLocation,
    tournamentPlayerCount: article.tournamentPlayerCount,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: "var(--font-rubik)" }}>
        Modifier l&apos;article
      </h1>
      <BlockEditor article={articleData} />
    </div>
  );
}
