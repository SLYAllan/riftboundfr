import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CardRef } from "@/components/card-ref";

export const metadata: Metadata = {
  title: { absolute: "Ban list Riftbound - Toutes les cartes interdites en tournoi" },
  description:
    "La ban list officielle Riftbound à jour : toutes les cartes et les champs de bataille interdits en tournoi, avec leur date d'entrée en vigueur.",
  alternates: { canonical: "/guides/ban-list" },
  openGraph: {
    type: "article",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Ban list Riftbound - Toutes les cartes interdites en tournoi",
    description:
      "Toutes les cartes et les champs de bataille interdits en tournoi Riftbound, avec leur date.",
    images: ["/img/og-default.png"],
  },
};

// Les noms EN sont ceux de la base de cartes, ils font foi pour le deckbuilder
// (cf. src/lib/banned-cards.ts). Les noms FR viennent des annonces officielles.
const JUILLET = [
  { en: "Stealthy Pursuer", fr: "Traqueuse furtive", type: "Unité" },
  { en: "The Arena's Greatest", fr: "Légende de l'arène", type: "Champ de bataille" },
  { en: "Aspirant's Climb", fr: "Ascension des aspirants", type: "Champ de bataille" },
];

const MARS = [
  "Called Shot",
  "Draven, Vanquisher",
  "Fight or Flight",
  "Scrapheap",
  "The Dreaming Tree",
  "Obelisk of Power",
  "Reaver's Row",
];

export default function BanListPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: "Ban list", href: "/guides/ban-list" }]} />

      <h1 className="mt-4 text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
        Ban list Riftbound
      </h1>
      <p className="mt-3 text-ink-secondary">
        Dix cartes n&apos;ont plus leur place en Standard. Si l&apos;une d&apos;elles traîne encore
        dans ta liste, ton deck est illégal en tournoi : mieux vaut le découvrir maintenant que
        devant un arbitre. Elles restent jouables en draft et en scellé, et le{" "}
        <Link href="/deckbuilder" className="text-arcane hover:underline">deckbuilder</Link> te
        prévient si tu en glisses une.
      </p>

      <h2 className="mt-10 text-2xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
        24 juillet 2026, patch Vendetta
      </h2>
      <p className="mt-2 text-ink-secondary">
        Trois cartes tombent, et ce sont surtout les deux champs de bataille qui vont se sentir.
        Aspirant&apos;s Climb tournait dans près d&apos;un deck de tournoi sur quatre,
        The Arena&apos;s Greatest dans presque un sur cinq. Si tu joues de la rampe Corps ou de
        l&apos;agression Fureur, il va falloir leur trouver un remplaçant avant ton prochain
        tournoi.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-ink-muted">
              <th className="py-2 pr-4 font-semibold">Carte</th>
              <th className="py-2 pr-4 font-semibold">Nom français</th>
              <th className="py-2 font-semibold">Type</th>
            </tr>
          </thead>
          <tbody>
            {JUILLET.map((c) => (
              <tr key={c.en} className="border-b border-hairline/50">
                <td className="py-2 pr-4 font-medium"><CardRef name={c.en}>{c.en}</CardRef></td>
                <td className="py-2 pr-4 text-ink-secondary">{c.fr}</td>
                <td className="py-2 text-ink-secondary">{c.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-2xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
        31 mars 2026
      </h2>
      <p className="mt-2 text-ink-secondary">
        La première vague. Sept cartes, dont la moitié servait à alimenter Draven et les
        combos Miracle, qui écrasaient le format Spiritforged. Elles n&apos;ont jamais été
        rendues depuis.
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {MARS.map((n) => (
          <li key={n} className="rounded-lg border border-hairline bg-surface px-3 py-2 text-sm">
            <CardRef name={n}>{n}</CardRef>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-2xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
        Pour aller plus loin
      </h2>
      <p className="mt-2 text-sm text-ink-secondary">
        Le même patch apporte quatre nouveaux mots-clés, l&apos;amplification, le Flux, brûler et
        passer. On les explique un par un dans le{" "}
        <Link href="/guides/glossaire" className="text-arcane hover:underline">glossaire</Link>.
        Si tu veux la version officielle, tout est chez Riot :{" "}
        <a href="https://playriftbound.com/fr-fr/news/announcements/july-ban-list-updates/" target="_blank" rel="noopener noreferrer" className="text-arcane hover:underline">
          l&apos;annonce de la ban list
        </a>{" "}
        et le{" "}
        <a href="https://playriftbound.com/fr-fr/rules-hub/" target="_blank" rel="noopener noreferrer" className="text-arcane hover:underline">
          Rules Hub
        </a>, qui héberge les règles du jeu et les règles de tournoi à jour.
      </p>
    </div>
  );
}
