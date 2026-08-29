export const dynamic = "force-dynamic";

import Link from "@/components/lien";
import { CardImage } from "@/components/card-image";
import { Prisma } from "@prisma/client";
import { verifyAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InventoryFilters } from "./inventory-filters";
import { InventoryActions } from "./inventory-actions";

const PER_PAGE = 100;

type LigneStock = {
  id: string;
  cardId: string;
  languageId: string;
  condition: "NM";
  finish: "NORMAL" | "FOIL";
  storageLocationId: string;
  physicalQuantity: number;
  reservedQuantity: number;
  averageAcquisitionCost: string;
  updatedAt: Date;
  name: string;
  riftboundId: string;
  set: string;
  collectorNumber: number | null;
  rarity: string;
  imageUrl: string | null;
  alternateArt: boolean;
  overnumbered: boolean;
  signature: boolean;
  languageCode: string;
  languageLabel: string;
  locationCode: string;
  locationLabel: string | null;
};

interface Props {
  searchParams: Promise<{ q?: string; set?: string; languageId?: string; storageLocationId?: string; seulement?: string; page?: string }>;
}

export default async function InventoryPage({ searchParams }: Props) {
  await verifyAdmin();

  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const set = sp.set?.trim().toUpperCase() ?? "";
  const languageId = sp.languageId ?? "";
  const storageLocationId = sp.storageLocationId ?? "";
  const seulement = sp.seulement === "manquants" || sp.seulement === "reserves" ? sp.seulement : "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const skip = (page - 1) * PER_PAGE;

  const [langues, emplacements] = await Promise.all([
    prisma.bulkLanguage.findMany({ orderBy: [{ position: "asc" }, { code: "asc" }] }),
    prisma.bulkStorageLocation.findMany({ orderBy: { code: "asc" } }),
  ]);

  // Le filtre « manquants » compare deux colonnes (physique = réservé), ce que
  // le where typé de Prisma ne sait pas faire. La requête part donc en SQL brut
  // pour tout l'écran, avec les mêmes jointures et le même tri.
  const conditions: Prisma.Sql[] = [];
  if (q) conditions.push(Prisma.sql`(c."name" ILIKE ${`%${q}%`} OR c."riftboundId" ILIKE ${`%${q}%`})`);
  if (set) conditions.push(Prisma.sql`c."set" = ${set}`);
  if (languageId) conditions.push(Prisma.sql`i."languageId" = ${languageId}`);
  if (storageLocationId) conditions.push(Prisma.sql`i."storageLocationId" = ${storageLocationId}`);
  if (seulement === "reserves") conditions.push(Prisma.sql`i."reservedQuantity" > 0`);
  if (seulement === "manquants") conditions.push(Prisma.sql`i."physicalQuantity" = i."reservedQuantity"`);
  const where = conditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}` : Prisma.empty;

  const [lignes, comptage] = await Promise.all([
    prisma.$queryRaw<LigneStock[]>(Prisma.sql`
      SELECT i."id", c."id" AS "cardId", i."languageId", i."condition", i."finish", i."storageLocationId",
             i."physicalQuantity", i."reservedQuantity", i."averageAcquisitionCost"::text AS "averageAcquisitionCost", i."updatedAt",
             c."name", c."riftboundId", c."set", c."collectorNumber", c."rarity", c."imageUrl",
             c."alternateArt", c."overnumbered", c."signature",
             l."code" AS "languageCode", l."label" AS "languageLabel",
             s."code" AS "locationCode", s."label" AS "locationLabel"
      FROM "BulkInventory" i
      JOIN "Card" c ON c."id" = i."cardId"
      JOIN "BulkLanguage" l ON l."id" = i."languageId"
      JOIN "BulkStorageLocation" s ON s."id" = i."storageLocationId"
      ${where}
      ORDER BY s."code" ASC, c."name" ASC
      LIMIT ${PER_PAGE} OFFSET ${skip}
    `),
    prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS "count"
      FROM "BulkInventory" i
      JOIN "Card" c ON c."id" = i."cardId"
      ${where}
    `),
  ]);
  const total = Number(comptage[0]?.count ?? 0);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Stock</h1>
        <p className="mt-1 text-sm text-ink-secondary">Cartes comptabilisées. Disponible = physique - réservé.</p>
      </div>

      <InventoryFilters langues={langues} emplacements={emplacements} />

      {lignes.length === 0 ? (
        <p className="rounded-xl border border-hairline bg-surface p-5 text-ink-secondary">
          Aucune carte ne correspond à ces filtres.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="border-b border-hairline text-left text-sm text-ink-muted">
                <th className="px-4 py-3">Carte</th>
                <th className="px-4 py-3">Impression</th>
                <th className="px-4 py-3">Langue</th>
                <th className="px-4 py-3">Emplacement</th>
                <th className="px-4 py-3 text-right">Physique</th>
                <th className="px-4 py-3 text-right">Réservé</th>
                <th className="px-4 py-3 text-right">Disponible</th>
                <th className="px-4 py-3 text-right">Coût moyen</th>
                <th className="px-4 py-3 text-right">Valeur</th>
                <th className="px-4 py-3">Modifié</th>
                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((ligne) => {
                const coutMoyen = new Prisma.Decimal(ligne.averageAcquisitionCost);
                const valeurStock = coutMoyen.mul(ligne.physicalQuantity);
                const mentions = [
                  ligne.finish === "FOIL" ? "Foil" : null,
                  ligne.alternateArt ? "Art alternatif" : null,
                  ligne.overnumbered ? "Surnumérotée" : null,
                  ligne.signature ? "Signée" : null,
                ].filter(Boolean);
                return (
                  <tr key={ligne.id} className="border-b border-hairline last:border-0 hover:bg-surface-raised">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <CardImage src={ligne.imageUrl} alt="" size="sm" hoverZoom={false} className="h-20 w-14 shrink-0 object-cover" />
                        <span className="text-sm text-ink">
                          {ligne.name}
                          <span className="block text-ink-muted">{ligne.riftboundId}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink">
                      <span>{ligne.set}{ligne.collectorNumber != null ? ` ${ligne.collectorNumber}` : ""}</span>
                      <span className="block text-ink-muted">
                        {[ligne.rarity, ...mentions].join(" · ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink">{ligne.languageCode}<span className="block text-ink-muted">{ligne.languageLabel}</span></td>
                    <td className="px-4 py-3 font-mono text-sm text-ink">{ligne.locationCode}<span className="block text-ink-muted">{ligne.locationLabel ?? "-"}</span></td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink">{ligne.physicalQuantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-secondary">{ligne.reservedQuantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-ink">{ligne.physicalQuantity - ligne.reservedQuantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-secondary">{coutMoyen.toFixed(4)} €</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink">{valeurStock.toFixed(2)} €</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-ink-muted">{ligne.updatedAt.toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-3">
                      <InventoryActions
                        cardId={ligne.cardId}
                        languageId={ligne.languageId}
                        condition={ligne.condition}
                        finish={ligne.finish}
                        storageLocationId={ligne.storageLocationId}
                        emplacements={emplacements.map((e) => ({ id: e.id, code: e.code }))}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} total={total} q={q} set={set} languageId={languageId} storageLocationId={storageLocationId} seulement={seulement} />
    </div>
  );
}

function Pagination({ page, totalPages, total, q, set, languageId, storageLocationId, seulement }: {
  page: number;
  totalPages: number;
  total: number;
  q: string;
  set: string;
  languageId: string;
  storageLocationId: string;
  seulement: string;
}) {
  if (totalPages <= 1) return null;

  function buildHref(p: number) {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (q) params.set("q", q);
    if (set) params.set("set", set);
    if (languageId) params.set("languageId", languageId);
    if (storageLocationId) params.set("storageLocationId", storageLocationId);
    if (seulement) params.set("seulement", seulement);
    return `/admin/bulking/inventory?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-muted">{total} lignes</span>
      <div className="flex items-center gap-2">
        {page > 1 && (
          <Link href={buildHref(page - 1)} className="rounded-lg bg-surface border border-hairline px-3 py-1.5 text-sm text-ink-secondary hover:text-ink">
            Précédent
          </Link>
        )}
        <span className="text-sm text-ink-muted">Page {page} / {totalPages}</span>
        {page < totalPages && (
          <Link href={buildHref(page + 1)} className="rounded-lg bg-surface border border-hairline px-3 py-1.5 text-sm text-ink-secondary hover:text-ink">
            Suivant
          </Link>
        )}
      </div>
    </div>
  );
}
