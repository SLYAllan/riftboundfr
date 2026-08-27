/**
 * Les chiffres globaux de `docs/DECKBUILDING-RULES.md`, recalculés.
 *
 *   npx tsx --env-file=.env scripts/stats-deckbuilding.mts [set]
 *   npx tsx --env-file=.env scripts/stats-deckbuilding.mts Vendetta
 *
 * Sans set, tout le corpus. Sort du Markdown prêt à coller : le ratio
 * unités/sorts/équipements, les cartes les plus jouées, les champs de bataille
 * les plus joués, et le nombre de listes par Légende et par paire de domaines.
 *
 * Le doc annonçait « 7987 decks » depuis un relevé de mai 2026, alors que le
 * dépôt en porte trois fois plus. Ces sections se recalculent, elles ne se
 * retapent pas : un nombre écrit à la main vieillit sans que personne le voie.
 *
 * Ces chiffres viennent des listes PUBLIÉES, et c'est la bonne source ici : on ne
 * peut pas lire les cartes d'un joueur qui n'a pas envoyé sa liste. À ne pas
 * confondre avec les parts de champ de `META-KNOWLEDGE.md`, qui se comptent sur
 * le classement complet des tournois.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const set = process.argv[2];

const fr = (x: number, d = 1) => x.toFixed(d).replace(".", ",");

async function main() {
  const decks = await prisma.deck.findMany({
    where: { published: true, NOT: { tournamentContext: null }, ...(set ? { setTag: set } : {}) },
    select: {
      legendName: true,
      cards: {
        select: {
          quantity: true, section: true,
          card: { select: { name: true, type: true, domains: true } },
        },
      },
    },
  });
  const avecCartes = decks.filter((d) => d.cards.length > 0);
  console.log(`# ${avecCartes.length} listes${set ? ` (${set})` : ""}, sur ${decks.length} decks du corpus\n`);

  // --- Ratio unités / sorts / équipements ------------------------------------
  let unites = 0, sorts = 0, gears = 0, n = 0;
  for (const d of avecCartes) {
    let u = 0, s = 0, g = 0;
    for (const c of d.cards) {
      if (c.section === "side" || c.section === "legend") continue;
      if (c.card.type === "Unit") u += c.quantity;
      else if (c.card.type === "Spell") s += c.quantity;
      else if (c.card.type === "Gear") g += c.quantity;
    }
    if (u + s + g === 0) continue;
    unites += u; sorts += s; gears += g; n++;
  }
  console.log(`### Ratio unités / sorts / équipements (moyenne sur ${n} listes)\n`);
  console.log("| Type | Moyenne par deck | Part |");
  console.log("|---|---:|---:|");
  const total = unites + sorts + gears;
  for (const [nom, v] of [["Unités", unites], ["Sorts", sorts], ["Équipements", gears]] as const) {
    console.log(`| ${nom} | ${fr(v / n)} | ${fr((v / total) * 100)} % |`);
  }

  // --- Cartes les plus jouées ------------------------------------------------
  const parCarte = new Map<string, { listes: number; copies: number }>();
  for (const d of avecCartes) {
    const vues = new Map<string, number>();
    for (const c of d.cards) {
      if (c.section === "side" || c.card.type === "Legend" || c.card.type === "Rune") continue;
      if (c.card.type === "Battlefield") continue;
      vues.set(c.card.name, (vues.get(c.card.name) ?? 0) + c.quantity);
    }
    for (const [nom, q] of vues) {
      const e = parCarte.get(nom) ?? { listes: 0, copies: 0 };
      e.listes++; e.copies += q;
      parCarte.set(nom, e);
    }
  }
  console.log(`\n### Les 30 cartes les plus jouées (toutes Légendes, ${n} listes)\n`);
  console.log("| Carte | Listes | Part | Copies moyennes |");
  console.log("|---|---:|---:|---:|");
  for (const [nom, e] of [...parCarte].sort((a, b) => b[1].listes - a[1].listes).slice(0, 30)) {
    console.log(`| ${nom} | ${e.listes} | ${fr((e.listes / n) * 100)} % | ${fr(e.copies / e.listes, 2)} |`);
  }

  // --- Champs de bataille ----------------------------------------------------
  const parTerrain = new Map<string, number>();
  for (const d of avecCartes) {
    const vus = new Set<string>();
    for (const c of d.cards) if (c.card.type === "Battlefield" && c.section !== "side") vus.add(c.card.name);
    for (const t of vus) parTerrain.set(t, (parTerrain.get(t) ?? 0) + 1);
  }
  console.log(`\n### Les 15 champs de bataille les plus joués (${n} listes)\n`);
  console.log("| Champ de bataille | Listes | Part |");
  console.log("|---|---:|---:|");
  for (const [nom, c] of [...parTerrain].sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`| ${nom} | ${c} | ${fr((c / n) * 100)} % |`);
  }

  // --- Listes par Légende, pour recaler les titres de section -----------------
  const parLegende = new Map<string, number>();
  for (const d of decks) parLegende.set(d.legendName, (parLegende.get(d.legendName) ?? 0) + 1);
  console.log(`\n### Listes par Légende (pour recaler les titres de section)\n`);
  for (const [nom, c] of [...parLegende].sort((a, b) => b[1] - a[1])) console.log(`- ${nom} : ${c}`);

  // --- Paires de domaines ----------------------------------------------------
  // La paire se lit sur les RUNES du deck, la seule déclaration explicite : les
  // domaines des cartes jouées incluent les incolores et les éclaboussures.
  const parPaire = new Map<string, number>();
  for (const d of avecCartes) {
    const domaines = new Set<string>();
    for (const c of d.cards) {
      if (c.card.type !== "Rune") continue;
      for (const dom of c.card.domains) if (dom !== "Colorless") domaines.add(dom);
    }
    if (domaines.size !== 2) continue;
    const cle = [...domaines].sort().join("/");
    parPaire.set(cle, (parPaire.get(cle) ?? 0) + 1);
  }
  console.log(`\n### Paires de domaines\n`);
  console.log("| Paire | Listes | Part |");
  console.log("|---|---:|---:|");
  const totalPaires = [...parPaire.values()].reduce((s, v) => s + v, 0);
  for (const [nom, c] of [...parPaire].sort((a, b) => b[1] - a[1])) {
    console.log(`| ${nom} | ${c} | ${fr((c / totalPaires) * 100)} % |`);
  }
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
