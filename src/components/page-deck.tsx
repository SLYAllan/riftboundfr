import Image from "next/image";
import type { ReactNode } from "react";
import { getBannerUrl } from "@/lib/banners";
import { interdictionsParDate } from "@/lib/bans";
import { BoutonLien } from "@/components/bouton";
import { tr, langueCourante } from "@/lib/i18n-server";
import { etiquetteLocale } from "@/lib/i18n";

// Les pièces communes aux pages de deck : celle d'un deck de tournoi (/decks/[slug])
// et celle d'un deck de la communauté (/d/[code]). Chacune avait la sienne : quand la
// première a reçu la bannière de la Légende, ses chiffres et la colonne d'achat, la
// seconde est restée sur l'ancien titre nu.

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const RUBIK = { fontFamily: "var(--font-rubik), sans-serif" };

export type MorceauLigne = { cle: string; contenu: ReactNode };

export function EnTeteDeck({ legendName, titre, ligne, chiffres, children }: {
  legendName: string;
  titre: string;
  ligne: MorceauLigne[];
  chiffres: [string, string][];
  children?: ReactNode;
}) {
  // L'illustration de la Légende en fond d'en-tête, et quatre chiffres lisibles d'un
  // coup d'œil : ils n'existaient que dans la vue « statistiques » de la liste.
  const banniere = getBannerUrl(legendName);
  return (
    <header className="relative mt-6 overflow-clip rounded-card border border-hairline bg-surface">
      {banniere && (
        <Image
          src={banniere}
          alt=""
          width={700}
          height={300}
          priority
          sizes="(max-width: 1024px) 100vw, 820px"
          className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-45 sm:w-2/3 [mask-image:linear-gradient(to_left,black_25%,transparent)]"
        />
      )}
      <div className="relative flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl" style={RUBIK}>{titre}</h1>
          {/* Texte courant et pas flex : en flex, un morceau trop long partait seul à
              la ligne avec son point devant, isolé. */}
          <p className="mt-2 text-sm leading-7 text-ink-muted">
            {ligne.map(({ cle, contenu }, i) => (
              <span key={cle}>
                {i > 0 && <span aria-hidden="true" className="mx-2">&middot;</span>}
                {contenu}
              </span>
            ))}
          </p>
          {children}
        </div>
        {/* Pas de bouton d'achat dans l'en-tête (Allan, 18 novembre) : il
            répétait celui de la colonne, juste à côté sur ordinateur, et la barre
            du bas sur téléphone. */}
      </div>
      <dl className="relative grid grid-cols-2 border-t border-hairline sm:grid-cols-4">
        {chiffres.map(([valeur, libelle]) => (
          <div key={libelle} className="border-hairline px-5 py-3 sm:border-r sm:last:border-r-0">
            <dd className="text-xl font-bold tabular-nums text-ink" style={RUBIK}>{valeur}</dd>
            <dt className="text-xs text-ink-muted">{libelle}</dt>
          </div>
        ))}
      </dl>
    </header>
  );
}

/**
 * Chaque carte porte déjà son étiquette « Banni » dans la liste. Sans l'encadré, on
 * lisait le titre d'une liste gagnante et on partait la monter sans voir qu'elle ne
 * se jouait plus.
 */
export async function AvisInterdictions({ noms, jouee }: { noms: string[]; jouee: boolean }) {
  const interdictions = interdictionsParDate(noms);
  if (interdictions.length === 0) return null;
  const t = await tr();
  const locale = etiquetteLocale(await langueCourante());
  return (
    <p className="mt-4 max-w-3xl rounded-lg border border-red-500/30 bg-surface px-4 py-3 text-sm text-ink-secondary">
      <strong className="text-red-400">{t(interdictions.every((i) => i.aVenir) ? "Liste bientôt injouable." : "Liste injouable aujourd’hui.")}</strong>
      {interdictions.map(({ date, cartes, aVenir }) => (
        <span key={date}>
          {" "}{new Intl.ListFormat(locale, { type: "conjunction" }).format(cartes)}{" "}
          {aVenir
            ? t(cartes.length > 1 ? "seront interdites le" : "sera interdite le")
            : t(cartes.length > 1 ? "sont interdites depuis le" : "est interdite depuis le")} {t(date)}.
        </span>
      ))}
      {jouee && <>{" "}{t("La liste reste affichée telle qu’elle a été jouée.")}</>}
    </p>
  );
}

/** L'encart d'achat de la colonne, sur ordinateur. */
export async function EncartAchat({ total, lien }: { total: number; lien: string | null }) {
  if (!lien || total <= 0) return null;
  const t = await tr();
  return (
    <div className="hidden rounded-card border border-hairline bg-surface p-4 lg:block">
      <div className="text-xs text-ink-muted">{t("À partir de")}</div>
      <div className="text-xl font-bold leading-tight text-arcane" style={RUBIK}>{euros.format(total)}</div>
      <BoutonLien href={lien} target="_blank" rel="sponsored nofollow noopener" variante="achat" className="mt-3 w-full">{t("Acheter ce deck")}</BoutonLien>
    </div>
  );
}

/** Téléphone : le bouton d'achat reste à portée de pouce pendant toute la liste. Un vrai lien, comme en haut. */
export async function BarreAchat({ total, lien }: { total: number; lien: string | null }) {
  if (!lien || total <= 0) return null;
  const t = await tr();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-hairline bg-surface-glass px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
      <div>
        <div className="text-xs text-ink-muted">{t("À partir de")}</div>
        <div className="text-lg font-bold leading-tight text-arcane" style={RUBIK}>{euros.format(total)}</div>
      </div>
      <BoutonLien href={lien} target="_blank" rel="sponsored nofollow noopener" variante="achat">{t("Acheter ce deck")}</BoutonLien>
    </div>
  );
}
