export const dynamic = "force-dynamic";

import Link from "@/components/lien";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/session";
import { getBinders, getCollectionItems } from "@/lib/collection-server";
import { rarityRank } from "@/lib/domains";
import { CollectionDashboard, type DashCard, type DashSet, type PocketCard } from "@/components/collection/collection-dashboard";
import { MAX_BINDERS } from "@/app/api/collection/binders/route";
import type { Metadata } from "next";
import { metaTraduite, tr } from "@/lib/i18n-server";
import { ORDRE_SETS } from "@/lib/collection";

const metadata: Metadata = {
  title: { absolute: "Ma collection Riftbound - classeurs, progression et valeur" },
  description:
    "Gérez votre collection de cartes Riftbound en classeurs, suivez votre progression par set, type et rareté, et repérez les cartes qui vous manquent.",
  alternates: { canonical: "/collection" },
  robots: { index: false, follow: false },
};

// Une page de classeur = 9 pochettes. C'est l'aperçu montré sur chaque classeur.
const POCKETS = 9;

// Les trois lots de promos ne se complètent pas comme un set, et leurs noms
// ("Riftbound Organized Play Promotional Cards") arrivent tronqués en
// « Riftboun… ». Une seule barre « Promos », total inchangé.
const PROMO_SETS = ["PR", "OPP", "JDG"];
const SET_SHORT_NAMES: Record<string, string> = { OGS: "Proving Grounds" };

export default async function CollectionPage() {
  const t = await tr();
  const user = await getUserFromSession();

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="font-display text-2xl font-bold">Ma collection</h1>
        <div className="mt-6 rounded-xl border border-hairline bg-surface-raised/40 p-8 text-center">
          <p className="mb-4 text-ink-secondary">{t("Connectez-vous avec Discord pour gérer votre collection en classeurs et suivre votre progression.")}</p>
          <Link
            href="/api/auth/discord"
            className="inline-block rounded-lg bg-arcane px-5 py-2.5 font-semibold text-canvas hover:bg-arcane/90"
          >{t("Se connecter avec Discord")}</Link>
        </div>
      </div>
    );
  }

  const [dbSets, dbCards, binders, items] = await Promise.all([
    prisma.cardSet.findMany(),
    prisma.card.findMany({
      select: { id: true, set: true, setName: true, type: true, rarity: true, domains: true, name: true, imageUrl: true },
    }),
    getBinders(user.id),
    getCollectionItems(user.id),
  ]);

  const cards: DashCard[] = dbCards.map((c) => ({
    id: c.id, set: c.set, setName: c.setName, type: c.type, rarity: c.rarity, domains: c.domains,
  }));

  // Vitrine de chaque classeur : les 9 cartes les plus rares qu'il contient.
  // Calculé ici pour n'envoyer au client que 9 images par classeur, pas 1000.
  const byId = new Map(dbCards.map((c) => [c.id, c]));
  const pockets: Record<string, PocketCard[]> = {};
  for (const b of binders) pockets[b.id] = [];
  for (const it of items) {
    const c = byId.get(it.cardId);
    if (c) pockets[it.binderId]?.push({ id: c.id, name: c.name, imageUrl: c.imageUrl, rarity: c.rarity });
  }
  for (const id of Object.keys(pockets)) {
    pockets[id] = pockets[id]
      .sort((a, b) => rarityRank(b.rarity) - rarityRank(a.rarity) || a.name.localeCompare(b.name))
      .slice(0, POCKETS);
  }

  const presentSets = new Set(cards.map((c) => c.set));
  const rank = (setId: string) => {
    const i = ORDRE_SETS.indexOf(setId);
    return i === -1 ? 99 : i;
  };
  const countOf = (setId: string) => cards.filter((c) => c.set === setId).length;

  const promos = dbSets.filter((s) => PROMO_SETS.includes(s.setId) && presentSets.has(s.setId));
  const sets: DashSet[] = dbSets
    .filter((s) => presentSets.has(s.setId) && !PROMO_SETS.includes(s.setId))
    .map((s) => ({
      key: s.setId,
      setIds: [s.setId],
      name: SET_SHORT_NAMES[s.setId] ?? s.name,
      cardCount: s.cardCount ?? countOf(s.setId),
    }))
    .sort((a, b) => rank(a.key) - rank(b.key));

  if (promos.length) {
    sets.push({
      key: "promos",
      setIds: promos.map((s) => s.setId),
      name: promos.length > 1 ? "Promos" : promos[0].name,
      cardCount: promos.reduce((n, s) => n + (s.cardCount ?? countOf(s.setId)), 0),
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <CollectionDashboard
        cards={cards}
        sets={sets}
        binders={binders}
        items={items}
        pockets={pockets}
        maxBinders={MAX_BINDERS}
      />
    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
