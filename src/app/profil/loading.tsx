// Six requêtes Prisma en force-dynamic : sans ce fichier, la navigation vers le
// profil laissait un écran blanc. Squelettes muets, la vraie page annonce le reste.
export default function ChargementProfil() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-8 sm:px-6" aria-hidden="true">
      <div className="flex flex-col items-start gap-6 sm:flex-row">
        <div className="h-20 w-20 shrink-0 rounded-full bg-surface-raised" />
        <div className="flex-1 space-y-3">
          <div className="h-8 w-48 rounded bg-surface-raised" />
          <div className="h-4 w-72 rounded bg-surface-raised" />
          <div className="h-11 w-40 rounded-lg bg-surface-raised" />
        </div>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-card border border-hairline bg-surface" />
        ))}
      </div>
      <div className="mt-10 h-7 w-40 rounded bg-surface-raised" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-40 rounded-card border border-hairline bg-surface" />
        ))}
      </div>
    </div>
  );
}
