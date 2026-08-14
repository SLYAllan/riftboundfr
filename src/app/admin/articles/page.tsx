export const dynamic = "force-dynamic";

import Link from "@/components/lien";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export default async function AdminArticlesPage() {
  await verifyAdmin();

  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: "var(--font-rubik)" }}>
          Articles
        </h1>
        <Link
          href="/admin/articles/new"
          className="px-4 py-2 rounded-lg bg-arcane text-canvas font-semibold hover:bg-arcane-light transition-colors text-sm"
        >
          Nouvel article
        </Link>
      </div>

      <div className="rounded-xl bg-surface border border-hairline overflow-x-auto">
        <table className="min-w-[700px] w-full table-fixed">
          <thead>
            <tr className="border-b border-hairline">
              <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[45%]">Titre</th>
              <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[15%]">Catégorie</th>
              <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[8%]">Blocs</th>
              <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[10%]">Statut</th>
              <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[12%]">Date</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => {
              const blocks = Array.isArray(article.blocks) ? article.blocks : [];
              return (
                <tr key={article.id} className="border-b border-hairline last:border-0 hover:bg-surface-raised">
                  <td className="px-4 py-3">
                    <Link href={`/admin/articles/${article.id}`} className="text-ink hover:text-arcane transition-colors truncate block">
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-secondary truncate">{article.category}</td>
                  <td className="px-4 py-3 text-sm text-ink-secondary">{blocks.length}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${article.published ? "bg-success/10 text-success" : "bg-surface-overlay text-ink-muted"}`}>
                      {article.published ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-muted whitespace-nowrap">{formatDate(article.createdAt)}</td>
                </tr>
              );
            })}
            {articles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">Aucun article</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
