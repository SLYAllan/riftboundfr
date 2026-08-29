export const dynamic = "force-dynamic";

import Link from "@/components/lien";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export default async function RecipesPage() {
  await verifyAdmin();

  const recettes = await prisma.bulkProductRecipe.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sourceDeck: { select: { title: true } },
      _count: { select: { lines: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-ink">Recettes</h1>
        <Link href="/admin/bulking/recipes/new" className="rounded-lg bg-arcane px-4 py-2 font-medium text-white">
          Nouvelle recette
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-hairline text-left text-sm text-ink-muted">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Deck source</th>
              <th className="px-4 py-3">Lignes</th>
              <th className="px-4 py-3">Auteur</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {recettes.map((recette) => (
              <tr key={recette.id} className="border-b border-hairline last:border-0 hover:bg-surface-raised">
                <td className="px-4 py-3">
                  <Link href={`/admin/bulking/recipes/${recette.id}`} className="text-ink hover:text-arcane">
                    {recette.name}
                  </Link>
                  {recette.description && (
                    <p className="mt-0.5 line-clamp-1 max-w-md text-sm text-ink-secondary">{recette.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-ink-secondary">{recette.sourceDeck?.title ?? "-"}</td>
                <td className="px-4 py-3 text-sm text-ink-secondary tabular-nums">{recette._count.lines}</td>
                <td className="px-4 py-3 text-sm text-ink-secondary">{recette.createdByLabel}</td>
                <td className="px-4 py-3 text-sm text-ink-muted whitespace-nowrap">{formatDate(recette.createdAt)}</td>
              </tr>
            ))}
            {recettes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <p className="text-ink-muted">Aucune recette pour le moment.</p>
                  <Link href="/admin/bulking/recipes/new" className="mt-2 inline-block text-sm text-arcane hover:underline">
                    Créer la première recette
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
