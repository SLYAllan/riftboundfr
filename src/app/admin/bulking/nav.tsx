import Link from "@/components/lien";

const liens = [
  ["/admin/bulking", "Accueil"],
  ["/admin/bulking/intakes", "Entrées"],
  ["/admin/bulking/inventory", "Stock"],
  ["/admin/bulking/movements", "Mouvements"],
  ["/admin/bulking/recipes", "Recettes"],
  ["/admin/bulking/locations", "Emplacements"],
  ["/admin/bulking/languages", "Langues"],
] as const;

export function BulkNav() {
  return (
    <nav aria-label="Bulking" className="flex flex-wrap gap-2">
      {liens.map(([href, label]) => (
        <Link key={href} href={href} className="rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink-secondary hover:text-ink">
          {label}
        </Link>
      ))}
    </nav>
  );
}
