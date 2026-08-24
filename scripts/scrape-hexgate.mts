/**
 * Scrape un tournoi hexgate.cn (source chinoise) vers `data/raw-scrapes/hexgate/`.
 *
 *   npx tsx scripts/scrape-hexgate.mts 238 239 240
 *
 * Le site rend ses pages en chinois, mais la charge React (`self.__next_f`) porte
 * pour chaque carte son numéro de collection ET son nom anglais. **On rattache par
 * `card_no`, jamais par le nom chinois** : le numéro est la clé sûre, le nom anglais
 * sert de contrôle. Voir `data/raw-scrapes/hexgate/RAPPORT.md`.
 *
 * Le script ne seede rien et ne touche pas à `data/decklists/`. Il écrit :
 *   - la capture brute de chaque page (preuve, comme pour riftdecks) ;
 *   - un JSON par deck lu ;
 *   - un rapport des listes écartées, avec la raison.
 *
 * Une liste incomplète est ÉCARTÉE, jamais complétée : règle d'intégrité
 * d'AGENTS.md. Mieux vaut un deck manquant qu'un deck faux.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RACINE = "data/raw-scrapes/hexgate";
const NAVIGATEUR =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

// Sans User-Agent de navigateur, hexgate répond 308 et rien d'autre.
async function recuperer(url: string): Promise<string> {
  const rep = await fetch(url, { headers: { "user-agent": NAVIGATEUR } });
  if (!rep.ok) throw new Error(`${rep.status} sur ${url}`);
  return rep.text();
}

/**
 * Recolle la charge React d'une page Next.js.
 *
 * Chaque `self.__next_f.push([1,"…"])` porte un morceau de chaîne JSON échappée :
 * on la repasse par `JSON.parse` plutôt que par un décodage à la main, sinon les
 * caractères chinois ressortent en mojibake et les noms de tournoi sont faux.
 */
function chargeReact(html: string): string {
  const morceaux = [...html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)];
  return morceaux.map((m) => JSON.parse(m[1]) as string).join("");
}

interface Place {
  deck_id: number;
  rank: number;
  legend_en: string;
  player_name: string;
}

interface CarteLue {
  card_no: string;
  en_name: string;
  cn_name: string;
  quantity: number;
  slot_type: string;
  card_type: string;
  energy: number | null;
}

interface Tournoi {
  id: number;
  name: string;
  date: string;
  activity_type: string;
  players_count: number;
  expansion: string;
  places: Place[];
}

function lireTournoi(charge: string, id: number): Tournoi {
  const meta = charge.match(
    /"id":(\d+),"name":"((?:[^"\\]|\\.)*)","date":"([^"]+)","activity_type":"([^"]*)","players_count":(\d+),"expansion":"([^"]*)"/,
  );
  if (!meta) throw new Error(`tournoi ${id} : en-tête introuvable dans la charge React`);

  const places: Place[] = [];
  const vus = new Set<number>();
  for (const m of charge.matchAll(
    /"deck_id":(\d+),"rank":(\d+),"legend":"((?:[^"\\]|\\.)*)","legend_en":"((?:[^"\\]|\\.)*)"[^}]*?"player_name":"((?:[^"\\]|\\.)*)"/g,
  )) {
    const deckId = Number(m[1]);
    // `top8` et `all_placements` répètent les mêmes decks : on garde la première vue.
    if (vus.has(deckId)) continue;
    vus.add(deckId);
    places.push({
      deck_id: deckId,
      rank: Number(m[2]),
      legend_en: JSON.parse(`"${m[4]}"`),
      player_name: JSON.parse(`"${m[5]}"`),
    });
  }

  return {
    id: Number(meta[1]),
    name: JSON.parse(`"${meta[2]}"`),
    date: meta[3],
    activity_type: meta[4],
    players_count: Number(meta[5]),
    expansion: meta[6],
    places: places.sort((a, b) => a.rank - b.rank),
  };
}

function lireCartes(charge: string): CarteLue[] {
  const cartes: CarteLue[] = [];
  for (const m of charge.matchAll(
    /\{"card_no":"([^"]+)","card_name":"(?:[^"\\]|\\.)*","cn_name":"((?:[^"\\]|\\.)*)","en_name":"((?:[^"\\]|\\.)*)","quantity":(\d+),"card_type":"((?:[^"\\]|\\.)*)","slot_type":"([^"]*)"[^}]*?"energy":(null|\d+)/g,
  )) {
    cartes.push({
      card_no: m[1],
      cn_name: JSON.parse(`"${m[2]}"`),
      en_name: JSON.parse(`"${m[3]}"`),
      quantity: Number(m[4]),
      card_type: JSON.parse(`"${m[5]}"`),
      slot_type: m[6],
      energy: m[7] === "null" ? null : Number(m[7]),
    });
  }
  return cartes;
}

function totalPar(cartes: CarteLue[], slot: string): number {
  return cartes.filter((c) => c.slot_type === slot).reduce((s, c) => s + c.quantity, 0);
}

/**
 * Une liste Vendetta valide porte 40 cartes principales (39 + le Champion), 12 runes,
 * 3 champs de bataille, 10 en réserve et 1 Légende. Tout écart = liste partielle : on
 * l'écarte au lieu de la compléter.
 */
function defautDeForme(cartes: CarteLue[]): string | null {
  const attendu: Array<[string, number]> = [
    ["legend", 1],
    ["main", 40],
    ["rune", 12],
    ["battlefield", 3],
    ["sideboard", 10],
  ];
  for (const [slot, n] of attendu) {
    const vu = totalPar(cartes, slot);
    if (vu !== n) return `${slot} = ${vu}, attendu ${n}`;
  }
  return null;
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const ids = process.argv.slice(2).filter((a) => /^\d+$/.test(a));
  if (!ids.length) {
    console.error("Usage : npx tsx scripts/scrape-hexgate.mts <id> [<id>…]");
    process.exit(1);
  }
  mkdirSync(join(RACINE, "decks"), { recursive: true });

  for (const id of ids) {
    const urlTournoi = `https://hexgate.cn/tournaments/${id}`;
    const htmlTournoi = await recuperer(urlTournoi);
    writeFileSync(join(RACINE, `tournoi-${id}.html`), htmlTournoi);
    const tournoi = lireTournoi(chargeReact(htmlTournoi), Number(id));
    console.log(
      `\n=== ${id} · ${tournoi.name} · ${tournoi.date} · ${tournoi.players_count} joueurs · ${tournoi.expansion}`,
    );
    console.log(`    ${tournoi.places.length} decks publiés`);

    const retenus: unknown[] = [];
    const ecartes: Array<{ deck_id: number; raison: string }> = [];

    for (const place of tournoi.places) {
      const urlDeck = `${urlTournoi}/decks/${place.deck_id}`;
      await pause(1500); // on ne martèle pas la source
      let htmlDeck: string;
      try {
        htmlDeck = await recuperer(urlDeck);
      } catch (e) {
        ecartes.push({ deck_id: place.deck_id, raison: String(e) });
        continue;
      }
      writeFileSync(join(RACINE, "decks", `${id}-${place.deck_id}.html`), htmlDeck);

      const cartes = lireCartes(chargeReact(htmlDeck));
      if (!cartes.length) {
        ecartes.push({ deck_id: place.deck_id, raison: "aucune carte dans la charge React" });
        continue;
      }
      const defaut = defautDeForme(cartes);
      if (defaut) {
        ecartes.push({ deck_id: place.deck_id, raison: `liste partielle (${defaut})` });
        continue;
      }
      const legende = cartes.find((c) => c.slot_type === "legend");
      retenus.push({
        source: urlDeck,
        tournoi: { id: tournoi.id, nom: tournoi.name, date: tournoi.date, joueurs: tournoi.players_count, set: tournoi.expansion },
        deck_id: place.deck_id,
        rang: place.rank,
        joueur: place.player_name,
        legende_en: legende?.en_name ?? place.legend_en,
        legende_no: legende?.card_no ?? null,
        cartes,
      });
      process.stdout.write(`.`);
    }

    writeFileSync(
      join(RACINE, `tournoi-${id}-decks.json`),
      `${JSON.stringify(retenus, null, 2)}\n`,
    );
    writeFileSync(
      join(RACINE, `tournoi-${id}-ecartes.json`),
      `${JSON.stringify(ecartes, null, 2)}\n`,
    );
    console.log(`\n    retenus ${retenus.length} · écartés ${ecartes.length}`);
    for (const e of ecartes.slice(0, 5)) console.log(`      ${e.deck_id} : ${e.raison}`);
  }
}

main();
