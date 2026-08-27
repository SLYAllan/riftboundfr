/**
 * Quelle part des joueurs d'un tournoi a réellement publié sa decklist ?
 *
 *   npx tsx --env-file=.env scripts/couverture-tournois.mts [set]
 *   npx tsx --env-file=.env scripts/couverture-tournois.mts Spiritforged
 *
 * Pourquoi ça compte. Une part de méta calculée sur les listes publiées suppose
 * que ceux qui publient ressemblent à ceux qui ne publient pas. C'est faux : ce
 * sont les joueurs qui performent qui envoient leur liste. Tant que la couverture
 * est proche de 100 %, l'écart est négligeable ; à 5 %, le chiffre ne décrit plus
 * le tournoi mais son top.
 *
 * Le constat qui a motivé cet outil : les Regional Qualifier occidentaux publient
 * entre 3 % et 9 % de leurs listes, là où les City Challenge chinoises en
 * publient plus de 90 %. Le « méta Unleashed » et le « méta Spiritforged »
 * n'étaient donc que des métas chinois, sans que rien ne le dise.
 *
 * La colonne « classement » dit si le classement complet a été relevé
 * (`scripts/scrape-classement.sh`) : quand c'est le cas, la couverture des
 * listes n'a plus d'importance, on compte les joueurs.
 */
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { getTournamentInfo } from "../src/lib/tournament-flags";

/**
 * Tournois dont riftdecks NE PUBLIE PAS le classement complet, seulement les
 * decks. Vérifié en scrapant leur page : elle annonce elle-même 120 classés pour
 * 1 719 joueurs (Bologna), 130 pour 1 670 (Las Vegas), 66 pour 1 347 (Houston).
 * Ce n'est pas un scrape à relancer, c'est une donnée qui n'existe pas. Sans
 * cette liste, l'outil réclamait indéfiniment un relevé impossible.
 */
const SANS_CLASSEMENT = new Set([
  "Bologna Regional Qualifier",
  "Las Vegas Regional Qualifier",
  "Houston Regional Qualifier",
  "Fuzhou Regional Qualifier",
  "Beijing Regional Open Day 1",
  "Chengdu City Challenge (2025-11-09)",
]);

const prisma = new PrismaClient();
const setDemande = process.argv[2];

async function main() {
  let releves = new Set<string>();
  try {
    const places: Array<{ contexte: string }> = JSON.parse(
      readFileSync("data/tournaments/classements.json", "utf8"),
    );
    releves = new Set(places.map((p) => p.contexte));
  } catch {
    /* pas encore de corpus */
  }

  const groupes = await prisma.deck.groupBy({
    by: ["tournamentContext", "setTag"],
    where: { published: true, tournamentContext: { not: null },
             ...(setDemande ? { setTag: setDemande } : {}) },
    _count: { _all: true },
  });

  const parSet = new Map<string, Array<{ ctx: string; listes: number; joueurs: number | null }>>();
  for (const g of groupes) {
    const ctx = g.tournamentContext!;
    const liste = parSet.get(g.setTag) ?? [];
    liste.push({ ctx, listes: g._count._all, joueurs: getTournamentInfo(ctx)?.playerCount ?? null });
    parSet.set(g.setTag, liste);
  }

  const ORDRE = ["Vendetta", "Unleashed", "Spiritforged", "Origins"];
  for (const set of [...parSet.keys()].sort((a, b) => ORDRE.indexOf(a) - ORDRE.indexOf(b))) {
    const lignes = parSet.get(set)!.sort((a, b) => {
      const ca = a.joueurs ? a.listes / a.joueurs : 9;
      const cb = b.joueurs ? b.listes / b.joueurs : 9;
      return ca - cb;
    });
    const manquants = (garder: (ctx: string) => boolean) =>
      lignes.reduce(
        (s, l) => s + (l.joueurs && !releves.has(l.ctx) && garder(l.ctx) ? Math.max(0, l.joueurs - l.listes) : 0),
        0,
      );
    const invisibles = manquants(() => true);
    const perdus = manquants((ctx) => SANS_CLASSEMENT.has(ctx));
    console.log(
      `\n=== ${set} : ${lignes.length} tournois, ${invisibles} joueurs invisibles ` +
      `(${invisibles - perdus} récupérables, ${perdus} que riftdecks ne publie pas) ===`,
    );
    console.log("listes / joueurs   couv.  classement  tournoi");
    for (const l of lignes) {
      if (!l.joueurs) { console.log(`${String(l.listes).padStart(6)} /     ?      ?              -  ${l.ctx}`); continue; }
      const pct = Math.round((l.listes / l.joueurs) * 100);
      if (pct >= 90 && !releves.has(l.ctx)) continue; // rien à signaler
      const etat = releves.has(l.ctx) ? "RELEVÉ" : SANS_CLASSEMENT.has(l.ctx) ? "indispo." : "à relever";
      console.log(
        `${String(l.listes).padStart(6)} / ${String(l.joueurs).padStart(5)}  ${String(pct).padStart(3)} %  ` +
        `${etat.padEnd(10)}  ${l.ctx}`,
      );
    }
    const ok = lignes.filter((l) => l.joueurs && l.listes / l.joueurs >= 0.9 && !releves.has(l.ctx)).length;
    if (ok) console.log(`  (+ ${ok} tournois au-dessus de 90 %, rien à faire)`);
  }
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
