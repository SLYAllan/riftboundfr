import Link from "@/components/lien";
import { verifyAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BulkPage() {
  await verifyAdmin();

  // Chiffres lus en direct, sans safeQuery : un tableau de bord commercial qui
  // afficherait zéro à cause d'une base muette mentirait au lieu de tomber.
  const [lignesStock, sommePhysique, sommeReservee, brouillons] = await Promise.all([
    prisma.bulkInventory.count(),
    prisma.bulkInventory.aggregate({ _sum: { physicalQuantity: true } }),
    prisma.bulkInventory.aggregate({ _sum: { reservedQuantity: true } }),
    prisma.bulkIntake.count({ where: { status: "DRAFT" } }),
  ]);

  const chiffres = [
    { libelle: "Lignes de stock", valeur: lignesStock },
    { libelle: "Cartes physiques", valeur: sommePhysique._sum.physicalQuantity ?? 0 },
    { libelle: "Cartes réservées", valeur: sommeReservee._sum.reservedQuantity ?? 0 },
    { libelle: "Lots en brouillon", valeur: brouillons },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-ink">Bulking</h1><p className="mt-1 text-ink-secondary">Entrées et stock commercial.</p></div>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {chiffres.map((chiffre) => (
          <div key={chiffre.libelle} className="rounded-xl border border-hairline bg-surface p-5">
            <dt className="text-sm text-ink-secondary">{chiffre.libelle}</dt>
            <dd className="mt-1 text-3xl font-bold tabular-nums text-ink">{chiffre.valeur}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/bulking/intakes/new" className="rounded-xl border border-hairline bg-surface p-5 hover:border-arcane/30">
          <h2 className="font-bold text-ink">Nouvelle entrée</h2><p className="mt-1 text-sm text-ink-secondary">Saisir un lot de cartes au clavier.</p>
        </Link>
        <Link href="/admin/bulking/intakes" className="rounded-xl border border-hairline bg-surface p-5 hover:border-arcane/30">
          <h2 className="font-bold text-ink">Entrées en cours</h2><p className="mt-1 text-sm text-ink-secondary">Reprendre ou comptabiliser un brouillon.</p>
        </Link>
        <Link href="/admin/bulking/inventory" className="rounded-xl border border-hairline bg-surface p-5 hover:border-arcane/30">
          <h2 className="font-bold text-ink">Stock et mouvements</h2><p className="mt-1 text-sm text-ink-secondary">Voir les cartes comptabilisées et vérifier le registre.</p>
        </Link>
      </div>
    </div>
  );
}
