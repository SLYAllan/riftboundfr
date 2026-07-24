import { CardTextRenderer } from "@/components/card-text-renderer";

// Bloc « Avant / Après » d'un errata, partagé par /guides/ban-list et la page carte.
// Couleurs neutres : le texte de l'ancien est barré/grisé, le nouveau ressort.
export function ErrataDiff({ before, after }: { before: string; after: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline text-sm">
      <div className="flex gap-3 border-b border-hairline px-3 py-2">
        <span className="w-14 shrink-0 text-xs font-semibold uppercase tracking-wide text-ink-muted">Avant</span>
        <span className="text-ink-secondary line-through decoration-ink-muted/40"><CardTextRenderer text={before} /></span>
      </div>
      <div className="flex gap-3 px-3 py-2">
        <span className="w-14 shrink-0 text-xs font-semibold uppercase tracking-wide text-ink-muted">Après</span>
        <span className="text-ink"><CardTextRenderer text={after} /></span>
      </div>
    </div>
  );
}
