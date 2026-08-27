/**
 * Reconstruit le CLASSEMENT COMPLET de chaque tournoi, pas seulement les decks publiés.
 *
 *   npx tsx --env-file=.env scripts/classements-tournois.mts
 *   → data/tournaments/classements.json
 *
 * Pourquoi. Une tier list bâtie sur `data/decklists/` est biaisée : sur Barcelone,
 * 106 listes publiées pour 2 126 joueurs classés, et ce sont les joueurs qui
 * performent qui publient. Une liste incomplète (réserve absente) est écartée de
 * la publication, à raison, mais elle dit quand même QUELLE Légende a joué et à
 * QUELLE place elle a fini. C'est tout ce qu'il faut pour une part de méta et un
 * taux de conversion.
 *
 * Trois sources, dans cet ordre pour chaque joueur :
 *   1. la Légende écrite dans la ligne de classement riftdecks (Barcelone) ;
 *   2. sinon la page de deck déjà scrapée (`<slug>/<deck-id>.md`), fil d'Ariane ;
 *   3. pour les tournois chinois, `legend_en` de hexgate, présent pour tous.
 *
 * Un joueur dont la Légende reste inconnue est compté à part, jamais deviné. Le
 * rapport donne le taux de couverture par tournoi : sous 90 %, se méfier des
 * parts calculées dessus.
 */
import { readFileSync, readdirSync, existsSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { sansHomoglyphes } from "./parse-riftdecks-integrity";
import { chargerCorpus, seuilsDeCoupe } from "./corpus-tournois";

const prisma = new PrismaClient();

const RAW = "data/raw-scrapes";

/**
 * Le nombre de joueurs annoncé par `tournament-flags.ts`, par inclusion du nom
 * comme le fait `getTournamentInfo` : les clés ne sont pas toujours le contexte
 * exact (« Sydney RQ 2026 » contre « RQ Sydney 2026 »).
 */
const JOUEURS_DECLARES: Array<[string, number]> = [
  ...readFileSync("src/lib/tournament-flags.ts", "utf8")
    .matchAll(/"([^"]+)":\s*\{[^}]*playerCount:\s*(\d+)/g),
].map((m) => [m[1], Number(m[2])] as [string, number]);

function joueursDeclares(contexte: string): number | null {
  const bas = contexte.toLowerCase();
  for (const [cle, n] of JOUEURS_DECLARES) if (bas.includes(cle.toLowerCase())) return n;
  return null;
}

/**
 * Dossiers dont le contexte ne se retrouve pas tout seul.
 *
 * Le script rattache normalement un dossier à son tournoi en cherchant en base un
 * deck dont le `slug` est l'identifiant riftdecks du fichier. Ça marche pour les
 * tournois importés par `parse-riftdecks.ts`, pas pour ceux qui ont été seedés
 * avec leurs propres slugs (« rq-hartford-2026-496th-… »). Et ces dossiers-ci ne
 * portent QUE des pages de classement, jamais de page de deck : il n'y a rien à
 * rapprocher. On l'écrit donc à la main, une ligne par tournoi.
 */
const CONTEXTES: Record<string, { contexte: string; set: string; decks?: string }> = {
  "hartford-rq-classement": { contexte: "RQ Hartford 2026", set: "Unleashed" },
  "utrecht-rq-classement": { contexte: "RQ Utrecht 2026", set: "Unleashed" },
  "vancouver-rq-classement": { contexte: "RQ Vancouver 2026", set: "Unleashed" },
  "sydney-rq-classement": { contexte: "RQ Sydney 2026", set: "Unleashed" },
  // riftdecks l'appelle « S3 Suzhou Regional Open », la base « Suzhou Regional
  // Qualifier » : même tournoi, deux noms. Vérifié par l'adresse source des decks.
  // `decks` : le dossier où lire les pages de deck quand la ligne de classement
  // ne porte pas la Légende. Les joueurs chinois donnent un nom à leur deck
  // (« 1-0 », « 0516 ») au lieu de laisser celui de la Légende : sans ce renvoi,
  // les 638 classés de Suzhou entraient dans le corpus sans aucune Légende.
  "suzhou-rq-classement": { contexte: "Suzhou Regional Qualifier", set: "Unleashed", decks: "suzhou-regional" },

  // Spiritforged : les quatre Regional Qualifier occidentaux, publiés entre 6 et
  // 9 % de leurs listes. À eux seuls, 6 400 joueurs qui n'existaient pas dans le
  // corpus. Le dossier de decks sert de repli pour lire la Légende quand le
  // joueur a donné un nom à son deck.
  "atlanta-rq-classement": { contexte: "Atlanta Regional Qualifier", set: "Spiritforged", decks: "atlanta-rq" },
  "lille-rq-classement": { contexte: "Lille Regional Qualifier", set: "Spiritforged", decks: "lille-rq" },
  "bologna-rq-classement": { contexte: "Bologna Regional Qualifier", set: "Spiritforged", decks: "bologna-rq" },
  "vegas-rq-classement": { contexte: "Las Vegas Regional Qualifier", set: "Spiritforged", decks: "las-vegas-rq" },

  // Origines : Houston, 80 listes publiées sur 1 347 joueurs.
  "houston-rq-classement": { contexte: "Houston Regional Qualifier", set: "Origins", decks: "houston-rq" },
};

export interface Place {
  contexte: string;
  set: string;
  rang: number;
  player: string | null;
  legend: string | null;
  source: "riftdecks" | "hexgate";
}

/** Les noms de Légende qui font foi, pour reconnaître une Légende dans un titre de deck. */
const CANONIQUES = (() => {
  const carte: Record<string, string> = JSON.parse(
    readFileSync(join(RAW, "legend-map.json"), "utf8"),
  );
  const m = new Map<string, string>();
  for (const nom of Object.values(carte)) m.set(nom.toLowerCase().replace(/[^a-z0-9]/g, ""), nom);
  return m;
})();

const canonique = (nom: string | null | undefined): string | null =>
  nom ? CANONIQUES.get(nom.toLowerCase().replace(/[^a-z0-9]/g, "")) ?? null : null;

/** La carte de Légende de `legend-map.json` : « OGS-017/024 » → clé « OGS-17 ». */
const PAR_NUMERO: Record<string, string> = JSON.parse(
  readFileSync(join(RAW, "legend-map.json"), "utf8"),
);

function legendeParNumero(carteNo: string | null | undefined): string | null {
  const m = carteNo?.match(/^([A-Za-z]+)-(\d+)/);
  return m ? PAR_NUMERO[`${m[1].toUpperCase()}-${Number(m[2])}`] ?? null : null;
}

/** La Légende du fil d'Ariane d'une page de deck riftdecks. */
function legendeDeLaPage(chemin: string): string | null {
  if (!existsSync(chemin)) return null;
  const md = readFileSync(chemin, "utf8");
  const m = md.match(
    /\[([A-Z][^[\]]+?)\]\(https:\/\/riftdecks\.com\/legends\/constructed\//,
  );
  return canonique(m?.[1]);
}

/**
 * Une ligne de classement riftdecks. Trois gabarits coexistent selon le tournoi :
 * Barcelone met la Légende dans la ligne, les City Challenge chinoises y mettent
 * le titre que le joueur a donné à son deck. On ne retient donc un nom comme
 * Légende que s'il figure dans `legend-map.json` ; sinon on va lire la page.
 */
function lignesRiftdecks(dossier: string, dossierDecks?: string): Array<{ rang: number; player: string | null; legend: string | null }> {
  const parRang = new Map<number, { rang: number; player: string | null; legend: string | null }>();
  const pages = readdirSync(join(RAW, dossier))
    .filter((f) => /^_page-\d+\.md$/.test(f))
    .sort((a, b) => Number(a.match(/\d+/)![0]) - Number(b.match(/\d+/)![0]));

  for (const page of pages) {
    for (const ligne of readFileSync(join(RAW, dossier, page), "utf8").split("\n")) {
      const rang = ligne.match(/^\|\s*\*\*(\d+)(?:st|nd|rd|th)\*\*/);
      if (!rang) continue;
      const n = Number(rang[1]);
      // Chaque deck paraît deux fois par page (rendu large et rendu étroit).
      if (parRang.has(n)) continue;

      const joueur = ligne.match(/<br>by ([^<|]+)/);
      const titres = [...ligne.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1]);
      let legend: string | null = null;
      for (const t of titres) {
        const c = canonique(t);
        if (c) { legend = c; break; }
      }
      if (!legend) {
        const lien = ligne.match(/riftbound-metagame\/(deck-[a-z0-9-]+)/);
        if (lien) {
          // Deux nommages coexistent sur le disque : le slug entier
          // (« deck-1-0-153021.md ») et le seul numéro (« deck-153021.md »),
          // selon le scrape qui a produit le dossier. On essaie les deux.
          const numero = lien[1].match(/(\d+)$/)?.[1];
          const candidats = [lien[1], numero ? `deck-${numero}` : null].filter(Boolean) as string[];
          for (const base of [dossier, dossierDecks].filter(Boolean) as string[]) {
            for (const nom of candidats) {
              legend = legendeDeLaPage(join(RAW, base, `${nom}.md`));
              if (legend) break;
            }
            if (legend) break;
          }
        }
      }
      parRang.set(n, {
        rang: n,
        player: joueur ? sansHomoglyphes(joueur[1].trim()) : null,
        legend,
      });
    }
  }
  return [...parRang.values()].sort((a, b) => a.rang - b.rang);
}

/**
 * Le nombre de classés que riftdecks annonce lui-même en pied de page :
 * « Page 1 of 26, showing 64 record(s) out of 1,659 total ».
 *
 * Sert à refuser un tournoi à moitié scrapé. Sans ce contrôle, un scrape coupé en
 * route entrait dans le corpus avec ses seules premières pages, c'est-à-dire ses
 * seuls mieux classés : la part de chaque Légende en sortait fausse et rien ne le
 * signalait. Une part de méta bâtie sur le haut du classement n'est pas
 * approximative, elle est à l'envers.
 */
function totalAnnonce(dossier: string): number | null {
  const page1 = join(RAW, dossier, "_page-1.md");
  if (!existsSync(page1)) return null;
  const m = readFileSync(page1, "utf8").match(/out of ([\d,]+) total/);
  return m ? Number(m[1].replace(/,/g, "")) : null;
}

async function main() {
  // Le contexte de tournoi vient de la BASE, jamais du nom de dossier : c'est lui
  // que portent les decks, les best-of et les drapeaux.
  const decks = await prisma.deck.findMany({
    where: { tournamentContext: { not: null } },
    select: { slug: true, tournamentContext: true, setTag: true, sourceUrl: true },
  });
  const contexteParSlug = new Map(decks.map((d) => [d.slug, d]));

  const places: Place[] = [];
  const rapport: Array<{ contexte: string; source: string; lignes: number; connues: number }> = [];

  // --- riftdecks : les dossiers qui portent des pages de classement -----------
  for (const dossier of readdirSync(RAW)) {
    const chemin = join(RAW, dossier);
    if (!statSync(chemin).isDirectory()) continue;
    if (!existsSync(join(chemin, "_page-1.md"))) continue;

    const lignes = lignesRiftdecks(dossier, CONTEXTES[dossier]?.decks);
    if (!lignes.length) continue;

    // Deux refus, et ils ne disent pas la même chose.
    //
    // 1. Moins de 90 % de ce que la PAGE annonce : le scrape est incomplet.
    const annonce = totalAnnonce(dossier);
    if (annonce && lignes.length < annonce * 0.9) {
      console.log(
        `  ${dossier} : ÉCARTÉ, ${lignes.length} lignes pour ${annonce} classés annoncés ` +
        `(${Math.round((lignes.length / annonce) * 100)} %). Relancer scrape-classement.sh.`,
      );
      continue;
    }
    // Le contexte : la table explicite d'abord, sinon n'importe quel deck du
    // dossier retrouvé en base par son slug.
    let contexte: string | null = CONTEXTES[dossier]?.contexte ?? null;
    let set = CONTEXTES[dossier]?.set ?? "Vendetta";
    if (!contexte) {
      for (const f of readdirSync(chemin)) {
        if (!f.startsWith("deck-") || !f.endsWith(".md")) continue;
        const d = contexteParSlug.get(f.replace(/\.md$/, ""));
        if (d) { contexte = d.tournamentContext!; set = d.setTag; break; }
      }
    }
    if (!contexte) {
      console.log(`  ${dossier} : aucun deck de ce dossier en base, ignoré`);
      continue;
    }

    // 2. La page est complète, mais elle ne porte qu'une fraction du VRAI champ :
    //    riftdecks ne publie alors pas le classement de ce tournoi, seulement ses
    //    decks. Bologna annonce 120 classés pour 1 719 joueurs, Las Vegas 130 pour
    //    1 670, Houston 66 pour 1 347. Les laisser entrer ferait passer un top 120
    //    pour un tournoi entier, avec une coupe à 10 % de douze joueurs. C'est
    //    exactement le biais qu'on corrige : ne pas le réintroduire par le corpus.
    const reels = joueursDeclares(contexte);
    if (reels && lignes.length < reels * 0.5) {
      console.log(
        `  ${dossier} : ÉCARTÉ, riftdecks ne publie que ${lignes.length} classés sur ` +
        `${reels} joueurs (${Math.round((lignes.length / reels) * 100)} %). Ce n'est pas un classement complet.`,
      );
      continue;
    }

    for (const l of lignes) places.push({ contexte, set, ...l, source: "riftdecks" });
    rapport.push({
      contexte, source: `riftdecks/${dossier}`,
      lignes: lignes.length,
      connues: lignes.filter((l) => l.legend).length,
    });
  }

  // --- hexgate : le relevé porte déjà la Légende de chaque joueur -------------
  const dejaVu = new Set(rapport.map((r) => r.contexte));
  const hexgate = join(RAW, "hexgate");
  if (existsSync(hexgate)) {
    for (const f of readdirSync(hexgate).filter((x) => /^tournoi-\d+-decks\.json$/.test(x))) {
      const brut = JSON.parse(readFileSync(join(hexgate, f), "utf8")) as Array<{
        rang: number; joueur: string; legende_en: string; legende_no: string | null;
        tournoi: { id: number; nom: string; date: string };
      }>;
      if (!brut.length) continue;
      const conv = join(hexgate, `tournoi-${brut[0].tournoi.id}-conversion.json`);
      if (!existsSync(conv)) continue;
      const contexte: string = JSON.parse(readFileSync(conv, "utf8")).contexte;
      // riftdecks a déjà donné ce tournoi : ne pas compter les joueurs deux fois.
      if (dejaVu.has(contexte)) continue;
      dejaVu.add(contexte);

      const parRang = new Map<number, Place>();
      for (const d of brut) {
        if (parRang.has(d.rang)) continue;
        parRang.set(d.rang, {
          contexte, set: "Vendetta", rang: d.rang,
          player: d.joueur || null,
          // Par le NUMÉRO de collection d'abord, jamais par le nom : hexgate
          // appelle « Wuju Bladesman - Starter » la carte OGS-19, qui est
          // Master Yi, Wuju Bladesman. Sur le nom seul, 134 joueurs se
          // retrouvaient dans une Légende fantôme, et Master Yi perdait autant.
          legend: legendeParNumero(d.legende_no) ?? canonique(d.legende_en),
          source: "hexgate",
        });
      }
      const lignes = [...parRang.values()].sort((a, b) => a.rang - b.rang);
      places.push(...lignes);
      rapport.push({
        contexte, source: `hexgate/${brut[0].tournoi.id}`,
        lignes: lignes.length,
        connues: lignes.filter((l) => l.legend).length,
      });
    }
  }

  places.sort((a, b) => a.contexte.localeCompare(b.contexte) || a.rang - b.rang);
  writeFileSync("data/tournaments/classements.json", JSON.stringify(places, null, 1));

  // Agrégat pour /meta et pour l'accueil.
  //
  // Il sort du corpus PARTAGÉ (`corpus-tournois.ts`), le même que les tier lists,
  // et pas des seuls classements : /meta annonçait 10 470 joueurs en Spiritforged
  // quand la tier list en comptait 9 685. L'écart était exactement les tournois
  // trop peu publiés pour être mesurés (Bologna 120 listes sur 1 719 joueurs,
  // Las Vegas 153 sur 1 670, Fuzhou 511 sur 800). Deux pages du site, deux
  // totaux, et rien pour dire lequel lire.
  //
  // La page n'a donc plus besoin de retomber sur la base : ce fichier porte tout.
  const corpusComplet = await chargerCorpus(null);
  const seuils = seuilsDeCoupe(corpusComplet.places);
  const agg = new Map<string, { legendName: string; tournament: string; set: string; joueurs: number; coupe: number }>();
  for (const p of corpusComplet.places) {
    if (!p.legend) continue;
    const cle = `${p.contexte}||${p.legend}`;
    const e = agg.get(cle) ?? { legendName: p.legend, tournament: p.contexte, set: p.set, joueurs: 0, coupe: 0 };
    e.joueurs++;
    if (p.rang <= seuils.get(p.contexte)!) e.coupe++;
    agg.set(cle, e);
  }
  writeFileSync(
    "data/tournaments/meta-parts.json",
    JSON.stringify([...agg.values()].sort((a, b) => a.tournament.localeCompare(b.tournament) || b.joueurs - a.joueurs), null, 1),
  );
  if (corpusComplet.ecartes.length) {
    console.log(`\n${corpusComplet.ecartes.length} tournoi(s) hors agrégat, trop peu publiés pour être mesurés :`);
    for (const e of corpusComplet.ecartes) console.log(`  ${e}`);
  }

  console.log(`\n${places.length} places relevées sur ${rapport.length} tournois\n`);
  console.log("contexte".padEnd(46) + "source".padEnd(30) + "places  Légende connue");
  for (const r of rapport.sort((a, b) => b.lignes - a.lignes)) {
    const pct = Math.round((r.connues / r.lignes) * 100);
    console.log(
      r.contexte.slice(0, 44).padEnd(46) + r.source.padEnd(30) +
      String(r.lignes).padStart(5) + String(pct + " %").padStart(10) + (pct < 90 ? "  ⚠" : ""),
    );
  }
  const connues = places.filter((p) => p.legend).length;
  console.log(`\ntotal : ${connues}/${places.length} places avec Légende (${Math.round((connues / places.length) * 100)} %)`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
