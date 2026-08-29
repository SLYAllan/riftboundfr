export const dynamic = "force-dynamic";

import Link from "@/components/lien";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { analyserRecette } from "@/lib/bulking-recipes";
import type { BulkRecipeRequirement, BulkStockBalance } from "@/lib/bulking-types";

const LIBELLES_SECTION: Record<string, string> = {
  LEGEND: "Légende",
  CHAMPION: "Champion",
  MAIN_DECK: "Deck principal",
  BATTLEFIELD: "Champs de bataille",
  SIDEBOARD: "Réserve",
  GENERIC: "Générique",
};

const ORDRE_SECTION = ["LEGEND", "CHAMPION", "MAIN_DECK", "BATTLEFIELD", "SIDEBOARD", "GENERIC"];

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyAdmin();
  const { id } = await params;

  const recette = await prisma.bulkProductRecipe.findUnique({
    where: { id },
    include: {
      sourceDeck: { select: { title: true } },
      lines: {
        include: {
          card: { select: { id: true, name: true, set: true, collectorNumber: true, riftboundId: true } },
          language: { select: { id: true, code: true, label: true } },
        },
      },
    },
  });

  if (!recette) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-ink">Recette introuvable</h1>
        <p className="text-ink-muted">Cette recette n’existe pas ou a été supprimée.</p>
        <Link href="/admin/bulking/recipes" className="text-arcane hover:underline">Retour aux recettes</Link>
      </div>
    );
  }

  const exigences: BulkRecipeRequirement[] = recette.lines.map((ligne) => ({
    cardId: ligne.cardId,
    languageId: ligne.languageId,
    section: ligne.section,
    quantity: ligne.quantity,
  }));

  const cardIds = [...new Set(exigences.map((exigence) => exigence.cardId))];
  const inventaire = await prisma.bulkInventory.findMany({ where: { cardId: { in: cardIds } } });
  const stock: BulkStockBalance[] = inventaire.map((item) => ({
    cardId: item.cardId,
    languageId: item.languageId,
    condition: item.condition,
    finish: item.finish,
    storageLocationId: item.storageLocationId,
    physicalQuantity: item.physicalQuantity,
    reservedQuantity: item.reservedQuantity,
    averageAcquisitionCost: item.averageAcquisitionCost.toString(),
  }));

  const analyse = analyserRecette(exigences, stock);

  const analyseParLigne = new Map(
    analyse.lines.map((ligne) => [`${ligne.cardId}|${ligne.languageId}|${ligne.section}`, ligne]),
  );

  const lignesTriees = recette.lines
    .map((ligne) => {
      const analyseLigne = analyseParLigne.get(`${ligne.cardId}|${ligne.languageId}|${ligne.section}`)!;
      return { ...analyseLigne, ...ligne };
    })
    .sort((a, b) => {
      const ia = ORDRE_SECTION.indexOf(a.section);
      const ib = ORDRE_SECTION.indexOf(b.section);
      if (ia !== ib) return ia - ib;
      return a.card.name.localeCompare(b.card.name, "fr");
    });

  const manquantes = lignesTriees.filter((l) => l.missingQuantity > 0);
  const limitantes = lignesTriees.filter((l) => l.limiting);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/bulking/recipes" className="text-sm text-ink-secondary hover:text-arcane">← Recettes</Link>
        <h1 className="mt-1 text-3xl font-bold text-ink">{recette.name}</h1>
        {recette.description && <p className="mt-1 text-ink-secondary">{recette.description}</p>}
        <p className="mt-2 text-sm text-ink-muted">
          Créée le {formatDate(recette.createdAt)} par {recette.createdByLabel}
          {recette.sourceDeck ? ` · depuis ${recette.sourceDeck.title}` : ""}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-hairline bg-surface p-4">
          <p className="text-sm text-ink-muted">Quantité réalisable</p>
          <p className="mt-1 text-3xl font-bold text-ink tabular-nums">{analyse.buildableQuantity}</p>
        </div>
        <div className="rounded-xl border border-hairline bg-surface p-4">
          <p className="text-sm text-ink-muted">Coût de stock par produit</p>
          <p className="mt-1 text-3xl font-bold text-ink tabular-nums">{analyse.inventoryCostPerProduct} €</p>
          <p className="mt-1 text-xs text-ink-muted">Coût interne du stock nécessaire. Ce n’est pas un prix de vente.</p>
        </div>
      </div>

      {manquantes.length > 0 && (
        <div className="rounded-xl border border-hairline bg-surface p-4">
          <h2 className="text-lg font-bold text-ink">Cartes manquantes</h2>
          <ul className="mt-2 space-y-1">
            {manquantes.map((l) => (
              <li key={`${l.cardId}-${l.languageId}-${l.section}`} className="text-sm text-ink">
                <span className="font-medium">{l.card.name}</span>
                <span className="text-ink-muted"> · {l.language.code} · {LIBELLES_SECTION[l.section]}</span>
                <span className="ml-2 text-danger">il manque {l.missingQuantity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {limitantes.length > 0 && (
        <div className="rounded-xl border border-hairline bg-surface p-4">
          <h2 className="text-lg font-bold text-ink">Cartes limitantes</h2>
          <p className="text-sm text-ink-muted">Ces cartes plafonnent la quantité réalisable.</p>
          <ul className="mt-2 space-y-1">
            {limitantes.map((l) => (
              <li key={`${l.cardId}-${l.languageId}-${l.section}`} className="text-sm text-ink">
                <span className="font-medium">{l.card.name}</span>
                <span className="text-ink-muted"> · {l.language.code}</span>
                <span className="ml-2 text-ink-secondary">{l.availableQuantity} disponible{l.availableQuantity > 1 ? "s" : ""} sur {l.quantity} requis{l.quantity > 1 ? "es" : ""}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-hairline text-left text-sm text-ink-muted">
              <th className="px-4 py-3">Carte</th>
              <th className="px-4 py-3">Langue</th>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3">Requis</th>
              <th className="px-4 py-3">Disponible</th>
              <th className="px-4 py-3">Manquant</th>
            </tr>
          </thead>
          <tbody>
            {lignesTriees.map((l) => (
              <tr key={`${l.cardId}-${l.languageId}-${l.section}`} className="border-b border-hairline last:border-0 hover:bg-surface-raised">
                <td className="px-4 py-3 text-sm text-ink">
                  {l.card.name}
                  <span className="ml-2 text-ink-muted">{l.card.set} {l.card.collectorNumber}</span>
                  {l.limiting && <span className="ml-2 rounded-full bg-surface-overlay px-2 py-0.5 text-xs text-ink-muted">limitante</span>}
                </td>
                <td className="px-4 py-3 text-sm text-ink-secondary">{l.language.code}</td>
                <td className="px-4 py-3 text-sm text-ink-secondary">{LIBELLES_SECTION[l.section]}</td>
                <td className="px-4 py-3 text-sm text-ink tabular-nums">{l.quantity}</td>
                <td className="px-4 py-3 text-sm text-ink tabular-nums">{l.availableQuantity}</td>
                <td className="px-4 py-3 text-sm tabular-nums">{l.missingQuantity > 0 ? <span className="text-danger">{l.missingQuantity}</span> : <span className="text-ink-secondary">0</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
