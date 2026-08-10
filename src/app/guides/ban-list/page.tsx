// Requête DB pour les images de cartes -> rendu à la requête, pas au build
// (le build Coolify utilise une fausse DATABASE_URL injoignable).
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "@/components/lien";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ErrataDiff } from "@/components/errata-diff";
import { ERRATA_2026_07 } from "@/lib/errata-2026-07";
import { metaTraduite, tr } from "@/lib/i18n-server";

const metadata: Metadata = {
  title: { absolute: "Ban list Riftbound - Toutes les cartes interdites en tournoi" },
  description:
    "La ban list officielle Riftbound à jour : cartes et champs de bataille interdits en tournoi, avec leur date, et les erratas de cartes de juillet 2026.",
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

type BanCard = {
  name: string;
  riftboundId: string;
  imageUrl: string | null;
  type: string;
  set: string;
  collectorNumber: number | null;
  alternateArt: boolean;
  overnumbered: boolean;
  signature: boolean;
};

const PROMO_SETS = new Set(["PR", "OPP", "JDG"]);

// Les cartes bannies/erratées ne changent pas d'une visite à l'autre → cache long.
const getBanCards = unstable_cache(
  async (): Promise<BanCard[]> => {
    const names = [...new Set([...JUILLET.map((c) => c.en), ...MARS, ...ERRATA_2026_07.map((e) => e.name)])];
    return prisma.card.findMany({
      where: { OR: names.map((n) => ({ name: { startsWith: n } })) },
      select: {
        name: true, riftboundId: true, imageUrl: true, type: true, set: true,
        collectorNumber: true, alternateArt: true, overnumbered: true, signature: true,
      },
    });
  },
  ["ban-list-cards-v1"],
  { revalidate: 3600, tags: ["cards"] },
);

// L'édition la plus "canonique" : ni alt-art, ni overnumbered, ni signature, ni promo.
function bestEdition(cards: BanCard[], name: string): BanCard | null {
  const score = (c: BanCard) =>
    (c.alternateArt ? 1 : 0) + (c.overnumbered ? 1 : 0) + (c.signature ? 1 : 0) + (PROMO_SETS.has(c.set) ? 1 : 0);
  const cands = cards
    .filter((c) => c.name === name || c.name.startsWith(name + " ("))
    .sort((a, b) => score(a) - score(b) || (a.collectorNumber ?? 999) - (b.collectorNumber ?? 999));
  return cands[0] ?? null;
}

function resize(url: string | null, w: number): string | undefined {
  if (!url) return undefined;
  if (!url.includes("cmsassets.rgpub.io")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}w=${w}&q=75&auto=format`;
}

function CardThumb({ card, caption, sub }: { card: BanCard | null; caption: string; sub?: string }) {
  if (!card?.imageUrl) return <span className="text-sm text-ink-muted">{caption}</span>;
  return (
    <Link href={`/cartes/${card.riftboundId}`} className="group flex flex-col items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resize(card.imageUrl, 360)}
        alt={card.name}
        loading="lazy"
        className="h-40 w-auto rounded-lg ring-1 ring-hairline transition-transform group-hover:-translate-y-0.5 group-hover:ring-arcane/50"
      />
      <span className="mt-2 block max-w-[11rem] text-center text-sm font-medium text-ink group-hover:text-arcane">{caption}</span>
      {sub && <span className="text-center text-xs text-ink-muted">{sub}</span>}
    </Link>
  );
}

export default async function BanListPage() {
  const t = await tr();
  const cards = await getBanCards();
  const heading = { fontFamily: "var(--font-rubik), sans-serif" };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: "Ban list", href: "/guides/ban-list" }]} />

      <h1 className="mt-4 text-4xl font-bold" style={heading}>Ban list Riftbound</h1>
      <p className="mt-3 text-ink-secondary">
        Dix cartes n&apos;ont plus leur place en Standard. Si l&apos;une d&apos;elles traîne encore
        dans ta liste, ton deck est illégal en tournoi : mieux vaut le découvrir maintenant que
        devant un arbitre. Elles restent jouables en draft et en scellé, et le{" "}
        <Link href="/deckbuilder" className="text-arcane hover:underline">deckbuilder</Link>{" "}{t("te prévient si tu en glisses une.")}</p>

      <h2 className="mt-10 text-2xl font-bold" style={heading}>24 juillet 2026, patch Vendetta</h2>
      <p className="mt-2 text-ink-secondary">{t("Trois cartes tombent, et ce sont surtout les deux champs de bataille qui vont se sentir. Aspirant’s Climb tournait dans près d’un deck de tournoi sur quatre, The Arena’s Greatest dans presque un sur cinq. Si tu joues de la rampe Corps ou de l’agression Fureur, il va falloir leur trouver un remplaçant avant ton prochain tournoi.")}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-5 sm:justify-start">
        {JUILLET.map((c) => (
          <CardThumb key={c.en} card={bestEdition(cards, c.en)} caption={t(c.fr)} sub={c.type} />
        ))}
      </div>

      <h2 className="mt-10 text-2xl font-bold" style={heading}>31 mars 2026</h2>
      <p className="mt-2 text-ink-secondary">{t("La première vague. Sept cartes, dont la moitié servait à alimenter Draven et les combos Miracle, qui écrasaient le format Spiritforged. Elles n’ont jamais été rendues depuis.")}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-5 sm:justify-start">
        {MARS.map((n) => (
          <CardThumb key={n} card={bestEdition(cards, n)} caption={n} />
        ))}
      </div>

      <h2 className="mt-10 text-2xl font-bold" style={heading}>{t("Erratas du 23 juillet 2026")}</h2>
      <p className="mt-2 text-ink-secondary">{t("En plus des bans, huit cartes changent de texte avec la sortie de Vendetta. Rien n’est interdit ici : ces cartes se jouent avec leur nouveau texte, et c’est ce texte que tu verras partout sur le site.")}</p>
      <ul className="mt-5 space-y-4">
        {ERRATA_2026_07.map((e) => {
          const card = bestEdition(cards, e.name);
          return (
            <li key={t(e.name)} className="flex flex-col gap-4 rounded-xl border border-hairline bg-surface p-4 sm:flex-row">
              {card?.imageUrl && (
                <Link href={`/cartes/${card.riftboundId}`} className="shrink-0 self-center sm:self-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resize(card.imageUrl, 460)}
                    alt={card.name}
                    loading="lazy"
                    className="h-72 w-auto rounded-lg ring-1 ring-hairline transition hover:ring-arcane/50"
                  />
                </Link>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-ink">{t(e.name)}</span>
                  <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[11px] text-ink-muted">{e.set}</span>
                </div>
                <div className="mt-2"><ErrataDiff before={e.before} after={e.after} /></div>
                <p className="mt-2 text-sm text-ink-secondary">{e.change}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-10 text-2xl font-bold" style={heading}>{t("Pour aller plus loin")}</h2>
      <p className="mt-2 text-sm text-ink-secondary">
        Le même patch apporte quatre nouveaux mots-clés, l&apos;amplification, le Flux, brûler et
        passer. On les explique un par un dans le{" "}
        <Link href="/guides/glossaire" className="text-arcane hover:underline">glossaire</Link>.
        Si tu veux la version officielle, tout est chez Riot :{" "}
        <a href="https://playriftbound.com/fr-fr/news/announcements/july-ban-list-updates/" target="_blank" rel="noopener noreferrer" className="text-arcane hover:underline">{t("l’annonce de la ban list")}</a>{" "}
        et le{" "}
        <a href="https://playriftbound.com/fr-fr/rules-hub/" target="_blank" rel="noopener noreferrer" className="text-arcane hover:underline">
          Rules Hub
        </a>{t(", qui héberge les règles du jeu et les règles de tournoi à jour.")}</p>
    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
