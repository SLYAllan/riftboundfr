export const dynamic = "force-dynamic";

import Link from "@/components/lien";
import { Prisma } from "@prisma/client";
import { verifyAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PER_PAGE = 100;

const TYPES_MOUVEMENT = ["INTAKE", "ADJUSTMENT", "TRANSFER_IN", "TRANSFER_OUT", "RESERVATION", "RELEASE", "PRODUCT_BUILD", "PRODUCT_DISASSEMBLY"] as const;

type TypeMouvement = (typeof TYPES_MOUVEMENT)[number];

const LIBELLES_TYPE: Record<string, string> = {
  INTAKE: "Entrée",
  ADJUSTMENT: "Correction",
  TRANSFER_IN: "Transfert entrant",
  TRANSFER_OUT: "Transfert sortant",
  RESERVATION: "Réservation",
  RELEASE: "Libération",
  PRODUCT_BUILD: "Assemblage",
  PRODUCT_DISASSEMBLY: "Désassemblage",
};

interface Props {
  searchParams: Promise<{ du?: string; au?: string; q?: string; type?: string; adminLabel?: string; intakeId?: string; page?: string }>;
}

export default async function MovementsPage({ searchParams }: Props) {
  await verifyAdmin();

  const sp = await searchParams;
  const du = sp.du ?? "";
  const au = sp.au ?? "";
  const q = sp.q?.trim() ?? "";
  const typeSaisi = sp.type ?? "";
  const type = (TYPES_MOUVEMENT as readonly string[]).includes(typeSaisi) ? (typeSaisi as TypeMouvement) : "";
  const adminLabel = sp.adminLabel?.trim() ?? "";
  const intakeId = sp.intakeId?.trim() ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const skip = (page - 1) * PER_PAGE;

  const andClauses: Prisma.BulkInventoryMovementWhereInput[] = [];
  if (du) andClauses.push({ createdAt: { gte: new Date(`${du}T00:00:00.000Z`) } });
  if (au) andClauses.push({ createdAt: { lte: new Date(`${au}T23:59:59.999Z`) } });
  if (q) {
    andClauses.push({
      inventory: {
        card: { OR: [{ name: { contains: q, mode: "insensitive" } }, { riftboundId: { contains: q, mode: "insensitive" } }] },
      },
    });
  }
  if (type) andClauses.push({ type });
  if (adminLabel) andClauses.push({ adminLabel: { contains: adminLabel, mode: "insensitive" } });
  if (intakeId) andClauses.push({ intakeId });
  const where: Prisma.BulkInventoryMovementWhereInput = andClauses.length > 0 ? { AND: andClauses } : {};

  const [mouvements, total] = await Promise.all([
    prisma.bulkInventoryMovement.findMany({
      where,
      include: {
        inventory: { include: { card: true, language: true, storageLocation: true } },
        intake: { select: { sellerSource: true } },
        recipe: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: PER_PAGE,
    }),
    prisma.bulkInventoryMovement.count({ where }),
  ]);
  const totalPages = Math.ceil(total / PER_PAGE);

  const champ =
    "min-h-[44px] w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-arcane";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Mouvements</h1>
        <p className="mt-1 text-sm text-ink-secondary">Registre en lecture seule. Chaque écriture du stock y laisse une trace.</p>
      </div>

      <form method="get" action="/admin/bulking/movements" className="rounded-xl border border-hairline bg-surface p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label htmlFor="filtre-du" className="text-sm text-ink-secondary">
            Du
            <input id="filtre-du" type="date" name="du" defaultValue={du} className={champ} />
          </label>
          <label htmlFor="filtre-au" className="text-sm text-ink-secondary">
            Au
            <input id="filtre-au" type="date" name="au" defaultValue={au} className={champ} />
          </label>
          <label htmlFor="filtre-q" className="text-sm text-ink-secondary">
            Carte
            <input id="filtre-q" type="text" name="q" placeholder="Nom ou identifiant" defaultValue={q} className={champ} />
          </label>
          <label htmlFor="filtre-type" className="text-sm text-ink-secondary">
            Type
            <select id="filtre-type" name="type" defaultValue={type} className={champ}>
              <option value="">Tous les types</option>
              {TYPES_MOUVEMENT.map((t) => (
                <option key={t} value={t}>
                  {LIBELLES_TYPE[t] ?? t}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="filtre-auteur" className="text-sm text-ink-secondary">
            Auteur
            <input id="filtre-auteur" type="text" name="adminLabel" defaultValue={adminLabel} className={champ} />
          </label>
          <label htmlFor="filtre-lot" className="text-sm text-ink-secondary">
            Lot (identifiant)
            <input id="filtre-lot" type="text" name="intakeId" defaultValue={intakeId} className={champ} />
          </label>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button type="submit" className="min-h-[44px] rounded-lg bg-arcane px-4 py-2 text-sm font-medium text-white">
            Filtrer
          </button>
          <Link href="/admin/bulking/movements" className="min-h-[44px] rounded-lg border border-hairline bg-surface px-4 py-2 text-sm text-ink-secondary hover:text-ink inline-flex items-center">
            Effacer
          </Link>
        </div>
      </form>

      {mouvements.length === 0 ? (
        <p className="rounded-xl border border-hairline bg-surface p-5 text-ink-secondary">Aucun mouvement ne correspond à ces filtres.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-hairline text-left text-sm text-ink-muted">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Carte</th>
                <th className="px-4 py-3">Langue</th>
                <th className="px-4 py-3">Emplacement</th>
                <th className="px-4 py-3 text-right">Physique</th>
                <th className="px-4 py-3 text-right">Réservé</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Lot</th>
                <th className="px-4 py-3 text-right">Coût</th>
                <th className="px-4 py-3">Auteur</th>
              </tr>
            </thead>
            <tbody>
              {mouvements.map((mouvement) => (
                <tr key={mouvement.id} className="border-b border-hairline last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-ink-secondary">{mouvement.createdAt.toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3 text-sm text-ink">
                    {mouvement.inventory.card.name}
                    <span className="block text-ink-muted">{mouvement.inventory.card.riftboundId}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-secondary">{mouvement.inventory.language.code}</td>
                  <td className="px-4 py-3 font-mono text-sm text-ink-secondary">{mouvement.inventory.storageLocation.code}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-ink">
                    {mouvement.physicalDelta > 0 ? `+${mouvement.physicalDelta}` : mouvement.physicalDelta}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink-secondary">
                    {mouvement.reservedDelta > 0 ? `+${mouvement.reservedDelta}` : mouvement.reservedDelta}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-secondary">{LIBELLES_TYPE[mouvement.type] ?? mouvement.type}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-sm text-ink-secondary">{mouvement.source}</td>
                  <td className="px-4 py-3 text-sm text-ink-secondary">
                    {mouvement.intake ? (
                      <Link href={`/admin/bulking/intakes/${mouvement.intakeId}`} className="text-arcane hover:underline">
                        {mouvement.intake.sellerSource}
                      </Link>
                    ) : mouvement.recipe ? (
                      <span>{mouvement.recipe.name}</span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink-secondary">
                    {mouvement.acquisitionUnitCost ? `${mouvement.acquisitionUnitCost.toFixed(4)} €` : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-secondary">{mouvement.adminLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} total={total} du={du} au={au} q={q} type={type} adminLabel={adminLabel} intakeId={intakeId} />
    </div>
  );
}

function Pagination({ page, totalPages, total, du, au, q, type, adminLabel, intakeId }: {
  page: number;
  totalPages: number;
  total: number;
  du: string;
  au: string;
  q: string;
  type: string;
  adminLabel: string;
  intakeId: string;
}) {
  if (totalPages <= 1) return null;

  function buildHref(p: number) {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (du) params.set("du", du);
    if (au) params.set("au", au);
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (adminLabel) params.set("adminLabel", adminLabel);
    if (intakeId) params.set("intakeId", intakeId);
    return `/admin/bulking/movements?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-muted">{total} mouvements</span>
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
