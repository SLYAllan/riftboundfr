import { tr } from "@/lib/i18n-server";

/**
 * Écran d'attente d'une page.
 *
 * Indicateur INDÉTERMINÉ, et c'est un choix : à la navigation on ignore ce qu'il
 * reste à charger. Pas de pourcentage, donc pas d'`aria-valuenow` — un chiffre
 * inventé serait lu à voix haute par un lecteur d'écran comme s'il était vrai.
 * Le segment traverse la piste au lieu de la remplir, pour ne rien promettre.
 *
 * Les rectangles gris ne sont là que pour tenir la place et éviter le saut de
 * page à l'arrivée du contenu ; ils sont muets pour les lecteurs d'écran, seule
 * la barre annonce l'attente.
 */
export async function Chargement({ lignes = 4 }: { lignes?: number }) {
  const t = await tr();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div
        role="progressbar"
        aria-label={t("Chargement…")}
        aria-busy="true"
        className="barre-chargement h-1 w-full overflow-hidden rounded-full bg-surface-raised"
      >
        <span className="block h-full w-1/3 rounded-full bg-arcane" />
      </div>

      <div aria-hidden="true" className="mt-10 animate-pulse space-y-6">
        <div className="h-8 w-2/5 rounded bg-surface-raised" />
        <div className="space-y-3">
          {Array.from({ length: lignes }, (_, i) => (
            <div
              key={i}
              className="h-4 rounded bg-surface-raised"
              style={{ width: `${[92, 78, 85, 60, 71, 83][i % 6]}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
