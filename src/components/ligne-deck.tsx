import Link from "@/components/lien";
import { PastilleInterdite } from "@/components/pastille-interdite";
import { rangPlacement } from "@/lib/card-play";
import { afficherPlacement } from "@/lib/deck-listing-params";
import { langueCourante, tr } from "@/lib/i18n-server";
import { cn } from "@/lib/utils";

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

/**
 * Une liste de tournoi en une ligne : place, nom, tournoi, prix, « Voir la liste » et
 * « Acheter ». Sortie de la fiche Légende quand les pages après-ban et decks pas chers
 * en ont eu besoin : recopiée, la ligne aurait fini par ne plus ressembler à elle-même.
 */
export async function LigneDeck({
  slug,
  placement,
  titre,
  sous,
  interdites = [],
  prix,
  lienAchat,
}: {
  slug: string;
  placement: string | null;
  titre: string;
  sous?: string | null;
  interdites?: string[];
  prix: number | null;
  lienAchat: string | null;
}) {
  const t = await tr();
  const langue = await langueCourante();
  const avecPrix = prix != null && prix > 0;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
      <span className={cn("inline-flex h-8 min-w-11 shrink-0 items-center justify-center rounded-lg px-2 text-sm font-bold tabular-nums", rangPlacement(placement) === 1 ? "bg-gold text-canvas" : "bg-surface-raised text-ink")}>
        {placement ? afficherPlacement(placement, langue) : "·"}
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <Link href={`/decks/${slug}`} className="block truncate text-sm font-bold text-ink transition-colors hover:text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
          {titre}
        </Link>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
          {sous && <span className="truncate">{sous}</span>}
          <PastilleInterdite cartes={interdites} className="max-w-[60%]" />
        </div>
      </div>
      {avecPrix && (
        <div className="text-right">
          <div className="text-xs text-ink-muted">{t("À partir de")}</div>
          <div className="text-sm font-bold tabular-nums text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{euros.format(prix)}</div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Link href={`/decks/${slug}`} className="inline-flex min-h-11 items-center rounded-lg border border-hairline px-3 text-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-raised hover:text-ink sm:min-h-9">
          {t("Voir la liste")}
        </Link>
        {/* Un vrai lien écrit par le serveur. */}
        {lienAchat && avecPrix && (
          <a
            href={lienAchat}
            target="_blank"
            rel="sponsored nofollow noopener"
            aria-label={`${t("Acheter ce deck")} : ${titre}`}
            className="inline-flex min-h-11 items-center rounded-lg bg-gold px-3 text-sm font-bold text-canvas transition-colors hover:bg-gold-light sm:min-h-9"
          >
            {t("Acheter")}
          </a>
        )}
      </div>
    </div>
  );
}
