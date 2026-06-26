/**
 * Un article PAR Légende (catégorie "meta") : pour chaque Légende du format
 * Unleashed, ses 2-3 meilleures listes RÉELLES (repliées par défaut) + un guide
 * complet pensé pour les DÉBUTANTS qui veulent commencer Riftbound.
 *
 * - Aucune decklist fabriquée : on sélectionne des listes réelles de data/decklists/.
 * - Terminologie FR officielle (champ de bataille, équipement, Contrôle, retrait…),
 *   pas d'anglicisme ni de citation de tournois/joueurs.
 * - Cartes clés regroupées par type FR (le texte des cartes est en anglais en base,
 *   on ne l'affiche donc pas : le survol [[carte]] donne l'effet complet).
 * - URLs/noms unifiés pour le SEO : slug `meilleur-deck-<légende>`.
 *
 * Usage : npx tsx scripts/seed-bestof-unleashed-article.mts [--publish]
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();
const DECKLISTS = "data/decklists";

type DeckJson = {
  legend: string; champion: string | null; player: string;
  tournament: string; date: string; placement: number | null;
  playerCount: number; set: string; domains?: string[];
  mainDeck: { name: string; quantity: number; type?: string }[];
  runes: Record<string, number>; battlefields: string[];
  sideDeck?: { name: string; quantity: number }[];
  _file?: string;
};

const legendKey = (l: string) => l.toLowerCase().replace(/[’'`]/g, "'").trim();
const slugify = (l: string) =>
  l.toLowerCase().replace(/[’'`,]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const DOMAIN_FR: Record<string, string> = {
  Fury: "Furie", Calm: "Calme", Mind: "Esprit", Body: "Corps", Chaos: "Chaos", Order: "Ordre",
};
const domainsFr = (d: DeckJson) => (d.domains ?? []).map((x) => DOMAIN_FR[x] ?? x).join("/");
const FR_TYPE: Record<string, string> = {
  Unit: "Unité", Spell: "Sort", Gear: "Équipement", Battlefield: "Champ de bataille", Legend: "Légende", Rune: "Rune",
};

// ── Guide par famille d'archétype, orienté débutants (terminologie FR) ──
type Fam = "aggro" | "tempo" | "hold" | "midrange" | "control" | "ramp" | "tokens" | "deathknell" | "assassin" | "combo" | "support";
type FamGuide = {
  resume: string; dynamique: string; forces: [string, string, string];
  gagne: string; plan: string; tip: string; pourQui: string; difficulte: string; faiblesses: string;
};
const FAM: Record<Fam, FamGuide> = {
  aggro: {
    resume: "Un deck rapide et agressif : tu déploies des unités dès les premiers tours et tu mets la pression sans relâche.",
    dynamique: "Le deck est à son meilleur tôt dans la partie. Les premiers tours sont décisifs : tu poses vite et tu imposes le rythme. Plus la partie traîne, plus ton avantage fond, donc tu cherches toujours à conclure rapidement.",
    forces: ["Pression immédiate dès les premiers tours", "Plan de jeu simple et lisible", "Punit les decks lents à démarrer"],
    gagne: "Tu vises les 8 points de victoire en conquérant les champs de bataille plus vite que l'adversaire, avant que les decks plus lents ne s'installent.",
    plan: "Pose tes unités sans attendre, cherche les combats favorables et garde l'initiative. Chaque tour passé sans pression profite à l'adversaire.",
    tip: "Ne surcharge pas un seul champ de bataille trop défendu : garde de quoi ouvrir un second front.",
    pourQui: "Idéal pour débuter : les décisions sont directes et les parties, rapides.",
    difficulte: "Accessible",
    faiblesses: "S'essouffle si la partie s'éternise et souffre face aux decks qui encaissent puis reprennent la main en fin de partie.",
  },
  tempo: {
    resume: "Un deck de rythme : tu réponds aux actions adverses tout en avançant tes propres menaces.",
    dynamique: "Tu alternes en permanence entre développer tes menaces et répondre à celles d'en face. La partie se joue sur une série de petits avantages qui s'accumulent.",
    forces: ["Très flexible selon l'adversaire", "Garde l'initiative sur le plateau", "De bonnes réponses à la plupart des menaces"],
    gagne: "Tu prends l'avantage peu à peu sur le plateau, puis tu transformes cette domination en points de conquête.",
    plan: "Joue la bonne carte au bon moment : développe quand tu peux, réponds quand il le faut, garde une longueur d'avance.",
    tip: "Garde un sort de réaction en main : c'est souvent l'échange au bon moment qui fait basculer la partie.",
    pourQui: "Pour ceux qui aiment réagir et lire la partie. Un cran au-dessus de l'agression pure.",
    difficulte: "Intermédiaire",
    faiblesses: "Demande de bons choix tour après tour ; une mauvaise séquence peut faire perdre le fil de la partie.",
  },
  hold: {
    resume: "Un deck défensif qui verrouille les champs de bataille : tu installes tes positions et tu marques en les gardant.",
    dynamique: "Le deck monte en puissance lentement. Tu encaisses au début, tu sécurises un champ de bataille, puis tu marques régulièrement en le conservant. Le rythme est posé, presque méthodique.",
    forces: ["Très résistant face à l'agression", "Marque des points de façon régulière", "Plan de jeu clair et rassurant"],
    gagne: "Tu conquiers un champ de bataille puis tu le défends : commencer ton tour en le contrôlant te rapporte un point chaque tour (le Contrôle). La patience paie.",
    plan: "Stabilise le plateau, sécurise un champ de bataille et défends-le. Laisse les points s'accumuler plutôt que de tout risquer d'un coup.",
    tip: "Sécurise un champ de bataille avant d'en attaquer un second : un champ tenu vaut mieux qu'une double conquête risquée.",
    pourQui: "Pour les joueurs patients. Plan solide et résistant, parfait pour apprendre à défendre.",
    difficulte: "Accessible à intermédiaire",
    faiblesses: "Peut manquer de rapidité face aux decks qui filent à 8 points ; il faut savoir quand passer à l'offensive.",
  },
  midrange: {
    resume: "Un deck équilibré entre attaque et défense, avec des unités solides au milieu de partie.",
    dynamique: "Le deck cherche le juste milieu : ni trop rapide, ni trop lent. Tu prends le contrôle vers le milieu de partie avec des unités solides, puis tu transformes cet avantage en victoire.",
    forces: ["Polyvalent contre la plupart des decks", "Des unités solides et rentables", "Pardonne les erreurs de débutant"],
    gagne: "Tu prends l'ascendant vers le milieu de partie avec des unités plus grosses que celles de l'adversaire, puis tu conclus une fois le plateau dominé.",
    plan: "Adapte-toi : sois agressif contre les decks lents, défensif contre l'agression. Le bon plan dépend de l'adversaire.",
    tip: "Décide vite si tu es le deck agressif ou défensif du duel : tout ton choix de main de départ en dépend.",
    pourQui: "Excellent pour débuter : flexible et indulgent.",
    difficulte: "Accessible",
    faiblesses: "Peut se faire dépasser par les decks plus extrêmes (agression très rapide ou contrôle très lent) s'il ne choisit pas son rôle.",
  },
  control: {
    resume: "Un deck patient qui répond à tout et gagne sur la durée.",
    dynamique: "Le deck joue la montre. Tu encaisses, tu réponds, tu épuises les ressources adverses, et tu ne prends l'initiative qu'une fois la partie verrouillée. Les parties sont longues.",
    forces: ["Des réponses à presque toutes les menaces", "Domine les parties longues", "Très fort contre les decks linéaires"],
    gagne: "Tu survis aux premiers tours, tu neutralises les menaces adverses, puis tu imposes ta condition de victoire quand l'adversaire est à court de ressources.",
    plan: "Échange, temporise, garde la main. Ne te précipite pas : ton avantage grandit à mesure que la partie s'éternise.",
    tip: "Ne gaspille pas ta meilleure réponse sur la première unité venue : garde-la pour la vraie menace.",
    pourQui: "Plutôt pour joueurs un peu expérimentés : beaucoup de décisions et de gestion de ressources.",
    difficulte: "Exigeant",
    faiblesses: "Vulnérable à l'agression très rapide ; chaque mauvaise réponse coûte cher.",
  },
  ramp: {
    resume: "Un deck qui accélère ses ressources pour déployer de grosses cartes en avance.",
    dynamique: "Le deck investit tôt dans son économie pour frapper plus gros, plus vite. Les premiers tours préparent le terrain ; l'explosion arrive au milieu de partie.",
    forces: ["Des cartes maîtresses surdimensionnées", "Prend de vitesse les decks classiques", "Des fins de partie écrasantes"],
    gagne: "Tu prends de l'avance sur l'économie, tu poses tes cartes maîtresses plus tôt que prévu, et tu écrases la fin de partie.",
    plan: "Développe ton énergie en priorité, protège tes cartes clés et vise un plateau que l'adversaire ne peut plus gérer.",
    tip: "Le retrait d'équipement est fréquent dans le métagame : garde une seconde menace pour rebondir après un retrait.",
    pourQui: "Pour ceux qui aiment construire une machine. Récompense l'anticipation.",
    difficulte: "Intermédiaire",
    faiblesses: "Fragile pendant sa phase de mise en place ; sensible au retrait d'équipement et à l'agression rapide.",
  },
  tokens: {
    resume: "Un deck qui crée beaucoup de petites unités (jetons) et les fait monter en puissance ensemble.",
    dynamique: "Le deck construit un plateau de plus en plus large. Chaque tour ajoute des unités, et l'ensemble devient vite difficile à gérer pour l'adversaire.",
    forces: ["Une présence massive sur le plateau", "Attaque plusieurs champs de bataille à la fois", "Encaisse la perte d'unités isolées"],
    gagne: "Tu envahis le plateau de jetons et tu transformes ce nombre en conquêtes répétées sur plusieurs champs de bataille.",
    plan: "Multiplie les unités, partage équipements et bonus entre elles, et attaque sur plusieurs fronts à la fois.",
    tip: "Étale tes menaces : un plateau large résiste mieux aux sorts de zone qu'une seule grosse unité.",
    pourQui: "Pour ceux qui aiment gérer un large plateau. Demande un peu d'organisation.",
    difficulte: "Intermédiaire",
    faiblesses: "Sensible aux sorts de zone ; demande de bien répartir ses forces.",
  },
  deathknell: {
    resume: "Un deck qui tire profit de la mort de ses propres unités (le mot-clé Agonie).",
    dynamique: "Le deck carbure aux échanges. Le moteur s'emballe à mesure que tes unités tombent : plus ça échange, plus tu repioches et plus tu reviens.",
    forces: ["Un avantage de cartes continu", "Récompense chaque échange", "Très difficile à épuiser"],
    gagne: "Chaque unité qui meurt te rapporte de la valeur (pioche, effets). Tu submerges l'adversaire sous un flot continu de menaces.",
    plan: "Échange tes unités sans hésiter, enchaîne les déclenchements d'Agonie et repioche pour ne jamais manquer de cartes.",
    tip: "N'aie pas peur de perdre tes unités : c'est le carburant du deck.",
    pourQui: "Pour ceux qui aiment les decks à moteur. Un peu technique mais gratifiant.",
    difficulte: "Intermédiaire",
    faiblesses: "Démarrage parfois lent ; a besoin que les échanges s'enchaînent pour lancer la machine.",
  },
  assassin: {
    resume: "Un deck précis qui élimine les bonnes cibles et frappe dans les ouvertures.",
    dynamique: "Le deck cherche les ouvertures. Tu élimines les unités clés de l'adversaire et tu frappes dans les brèches, en gardant l'initiative sur les échanges.",
    forces: ["Élimine les menaces ciblées", "Un rythme agressif et précis", "Punit les plateaux mal protégés"],
    gagne: "Tu vises les unités clés de l'adversaire, tu ouvres des brèches avec tes sorts, et tu transformes chaque échange gagné en avance.",
    plan: "Choisis tes cibles, garde tes sorts pour les moments décisifs et capitalise sur chaque combat remporté.",
    tip: "Éliminer la bonne unité adverse vaut plus que deux petits échanges : vise juste.",
    pourQui: "Pour ceux qui aiment le jeu chirurgical. Demande de bien lire l'adversaire.",
    difficulte: "Exigeant",
    faiblesses: "Peu de marge d'erreur ; un mauvais choix de cible peut coûter la partie.",
  },
  combo: {
    resume: "Un deck qui cherche à assembler une combinaison de cartes pour gagner d'un coup.",
    dynamique: "Le deck prépare sa combinaison en coulisses. Tu survis et tu réunis tes pièces, puis tout bascule d'un coup quand la combinaison se déclenche.",
    forces: ["Un potentiel de victoire explosif", "Un plan de jeu unique et surprenant", "Récompense la maîtrise"],
    gagne: "Tu réunis tes cartes clés, tu protèges ton moteur, et tu déclenches ta combinaison quand l'adversaire ne peut plus l'empêcher.",
    plan: "Prépare ta séquence, survis en attendant, et ne te lance que lorsque c'est sûr.",
    tip: "Une combinaison précipitée se fait punir, une combinaison préparée gagne : apprends ta séquence.",
    pourQui: "Pour joueurs expérimentés : il faut connaître son deck par cœur.",
    difficulte: "Exigeant",
    faiblesses: "Inefficace si les cartes clés manquent ; vulnérable tant que la combinaison n'est pas en place.",
  },
  support: {
    resume: "Un deck qui développe son économie et soutient son plateau avant de basculer.",
    dynamique: "Le deck joue la durée. Tu développes ton économie et tu soutiens ton plateau, en attendant le moment de basculer sur ta finition.",
    forces: ["Solide sur la longueur", "Un bon soutien de plateau", "Difficile à presser dans la durée"],
    gagne: "Tu installes ton avantage sur la durée puis tu conclus avec une menace décisive en fin de partie.",
    plan: "Construis ton économie, garde le plateau stable et bascule au bon moment sur ta finition.",
    tip: "Ne te laisse pas distancer au rythme : ton avantage vient de la durée, sécurise le milieu de partie.",
    pourQui: "Pour les joueurs patients qui aiment jouer la longueur.",
    difficulte: "Intermédiaire",
    faiblesses: "Manque de rapidité ; peut se faire distancer s'il subit trop tôt.",
  },
};

// ── Méta par Légende (tier + archétype FR + famille de gameplan) ──
type Meta = { tier: 1 | 2 | 3 | 4 | 5; archetype: string; fam: Fam; display?: string };
const META: Record<string, Meta> = {
  "diana, scorn of the moon": { tier: 1, archetype: "Aggro-tempo", fam: "tempo" },
  "irelia, blade dancer": { tier: 1, archetype: "Tempo à équipements", fam: "tempo" },
  "master yi, wuju bladesman": { tier: 1, archetype: "Contrôle de terrain", fam: "hold" },
  "azir, emperor of the sands": { tier: 1, archetype: "Jetons et équipements", fam: "tokens" },
  "leblanc, deceiver": { tier: 2, archetype: "Midrange Agonie", fam: "deathknell" },
  "annie, dark child": { tier: 2, archetype: "Aggro", fam: "aggro" },
  "sivir, battle mistress": { tier: 2, archetype: "Rampe à équipements", fam: "ramp" },
  "ezreal, prodigal explorer": { tier: 2, archetype: "Contrôle à dégâts", fam: "control" },
  "rek'sai, void burrower": { tier: 2, archetype: "Aggro", fam: "aggro", display: "Rek'Sai, Void Burrower" },
  "vex, gloomist": { tier: 2, archetype: "Contrôle défensif", fam: "control" },
  "fiora, grand duelist": { tier: 2, archetype: "Midrange à bonus", fam: "midrange" },
  "viktor, herald of the arcane": { tier: 2, archetype: "Contrôle à jetons", fam: "tokens" },
  "rengar, pridestalker": { tier: 2, archetype: "Aggro", fam: "aggro" },
  "kha'zix, voidreaver": { tier: 2, archetype: "Aggro-combo", fam: "aggro" },
  "miss fortune, bounty hunter": { tier: 2, archetype: "Rampe mobile", fam: "ramp" },
  "draven, glorious executioner": { tier: 3, archetype: "Aggro", fam: "aggro" },
  "sett, the boss": { tier: 3, archetype: "Midrange résistant", fam: "midrange" },
  "darius, hand of noxus": { tier: 3, archetype: "Aggro frontal", fam: "aggro" },
  "lillia, bashful bloom": { tier: 3, archetype: "Contrôle-tempo", fam: "control" },
  "pyke, bloodharbor ripper": { tier: 3, archetype: "Assassin", fam: "assassin" },
  "kai'sa, daughter of the void": { tier: 3, archetype: "Tempo-combo", fam: "tempo" },
  "lux, lady of luminosity": { tier: 3, archetype: "Contrôle-combo", fam: "control" },
  "teemo, swift scout": { tier: 3, archetype: "Tempo perturbateur", fam: "tempo" },
  "master yi, wuju master": { tier: 4, archetype: "Contrôle de terrain", fam: "hold" },
  "poppy, keeper of the hammer": { tier: 4, archetype: "Rampe à équipements", fam: "ramp" },
  "volibear, relentless storm": { tier: 4, archetype: "Rampe midrange", fam: "midrange" },
  "ahri, nine-tailed fox": { tier: 4, archetype: "Tempo de valeur", fam: "tempo" },
  "vi, piltover enforcer": { tier: 4, archetype: "Aggro à équipements", fam: "aggro" },
  "jax, grandmaster at arms": { tier: 4, archetype: "Valeur d'équipements", fam: "ramp" },
  "lucian, purifier": { tier: 4, archetype: "Aggro à équipements", fam: "aggro" },
  "ornn, fire below the mountain": { tier: 4, archetype: "Valeur d'équipements", fam: "ramp" },
  "jhin, virtuoso": { tier: 5, archetype: "Combo de précision", fam: "combo" },
  "yasuo, unforgiven": { tier: 5, archetype: "Tempo", fam: "tempo" },
  "lee sin, blind monk": { tier: 5, archetype: "Tempo", fam: "tempo" },
  "jinx, loose cannon": { tier: 5, archetype: "Aggro explosif", fam: "aggro" },
  "leona, radiant dawn": { tier: 5, archetype: "Midrange défensif", fam: "midrange" },
  "ivern, green father": { tier: 5, archetype: "Rampe de soutien", fam: "support" },
  "renata glasc, chem-baroness": { tier: 5, archetype: "Contrôle", fam: "control" },
  "rumble, mechanized menace": { tier: 5, archetype: "Aggro à dégâts directs", fam: "aggro" },
  "garen, might of demacia": { tier: 5, archetype: "Rampe", fam: "ramp" },
};

// Total tel qu'affiché : Légende (1) + Champion + deck principal + runes + champs de
// bataille + réserve. 64 = deck COMPLET (règle projet, cf. scripts/check-deck-counts.ts).
// On n'inclut que des listes complètes (jamais de deck partiel/non sourcé).
function renderTotal(d: DeckJson): number {
  const champ = d.champion ? 1 : 0;
  const main = d.mainDeck.filter((c) => (c.type ?? "").toLowerCase() !== "champion").reduce((s, c) => s + (c.quantity || 0), 0);
  const runes = Object.values(d.runes ?? {}).reduce((s, n) => s + (Number(n) || 0), 0);
  const bf = (d.battlefields ?? []).length;
  const side = (d.sideDeck ?? []).reduce((s, c) => s + (c.quantity || 0), 0);
  return 1 + champ + main + runes + bf + side;
}

// ── Sélection : top 3 listes Unleashed COMPLÈTES (64 cartes) par Légende ──
function selectTopPerLegend(): Map<string, DeckJson[]> {
  const byLegend = new Map<string, DeckJson[]>();
  const dirs = readdirSync(DECKLISTS).filter((d) => statSync(join(DECKLISTS, d)).isDirectory());
  for (const dir of dirs) {
    for (const f of readdirSync(join(DECKLISTS, dir)).filter((x) => x.endsWith(".json"))) {
      let d: DeckJson;
      try { d = JSON.parse(readFileSync(join(DECKLISTS, dir, f), "utf-8")); } catch { continue; }
      if (!d || d.set !== "Unleashed" || !d.legend) continue;
      if (!Array.isArray(d.mainDeck) || d.mainDeck.length === 0) continue;
      if (renderTotal(d) !== 64) continue; // deck incomplet → exclu
      d._file = join(dir, f);
      const key = legendKey(d.legend);
      (byLegend.get(key) ?? byLegend.set(key, []).get(key)!).push(d);
    }
  }
  const p = (d: DeckJson) => (typeof d.placement === "number" && d.placement > 0) ? d.placement : 9999;
  for (const [k, arr] of byLegend) {
    arr.sort((a, b) => p(a) - p(b) || (b.playerCount || 0) - (a.playerCount || 0) || (b.date || "").localeCompare(a.date || ""));
    const seen = new Set<string>();
    const top: DeckJson[] = [];
    for (const d of arr) {
      const sig = `${d.player}|${d.tournament}|${p(d)}`;
      if (seen.has(sig)) continue;
      seen.add(sig); top.push(d);
      if (top.length >= 3) break;
    }
    byLegend.set(k, top);
  }
  return byLegend;
}

function buildDeckCode(d: DeckJson): string {
  const parts: string[] = [];
  if (d.champion) { parts.push("== Champion =="); parts.push(`1x ${d.champion}`); }
  parts.push("== Main Deck ==");
  for (const c of d.mainDeck) {
    if ((c.type ?? "").toLowerCase() === "champion") continue;
    parts.push(`${c.quantity}x ${c.name}`);
  }
  const runes = Object.entries(d.runes ?? {}).map(([n, q]) => `${q}x ${n.endsWith(" Rune") ? n : n + " Rune"}`);
  if (runes.length) { parts.push("== Runes =="); parts.push(...runes); }
  if (d.battlefields?.length) { parts.push("== Battlefield =="); for (const b of d.battlefields) parts.push(`1x ${b}`); }
  const side = d.sideDeck ?? [];
  if (side.length) { parts.push("== Side Deck =="); for (const s of side) parts.push(`${s.quantity}x ${s.name}`); }
  return parts.join("\n");
}

// Cartes les plus jouées de la meilleure liste (hors champion).
function topCardNames(d: DeckJson): string[] {
  const cards = d.mainDeck.filter((c) => (c.type ?? "").toLowerCase() !== "champion");
  return [...cards].sort((a, b) => (b.quantity || 0) - (a.quantity || 0)).slice(0, 5).map((c) => c.name);
}

// ── Génération ──
const byLegend = selectTopPerLegend();
let created = 0;
const skipped: string[] = [];

// Désambiguïsation des noms courts (deux Master Yi → on garde le sous-titre).
const shortCount = new Map<string, number>();
for (const [key, decks] of byLegend) {
  const m = META[key]; if (!m) continue;
  const champ0 = (m.display ?? decks[0].legend).split(",")[0];
  shortCount.set(champ0, (shortCount.get(champ0) ?? 0) + 1);
}

// Type FR des cartes clés (pour les regrouper). Le texte des cartes (anglais en
// base) n'est PAS affiché : le survol [[carte]] donne l'effet complet.
const allNames = new Set<string>();
for (const [key, decks] of byLegend) {
  if (!META[key]) continue;
  if (decks[0].champion) allNames.add(decks[0].champion);
  for (const n of topCardNames(decks[0])) allNames.add(n);
}
const cardRows = await prisma.card.findMany({ where: { name: { in: [...allNames] } }, select: { name: true, type: true, imageUrl: true } });
const cardType = new Map<string, string>();
const cardImg = new Map<string, string>();
for (const c of cardRows) {
  if (!cardType.has(c.name)) cardType.set(c.name, c.type);
  if (c.imageUrl && !cardImg.has(c.name)) cardImg.set(c.name, c.imageUrl);
}

// Nettoyage des anciens slugs (renommage SEO unifié → meilleur-deck-*).
const purged = await prisma.article.deleteMany({ where: { slug: { startsWith: "unleashed-best-" } } });
if (purged.count) console.log(`🧹 Anciens slugs supprimés : ${purged.count}`);
const doPublish = process.argv.includes("--publish");
const LIST_LABELS = ["Version principale", "Variante", "Autre variante"];

for (const [key, decks] of byLegend) {
  const meta = META[key];
  if (!meta) { skipped.push(decks[0]?.legend ?? key); continue; }
  const best = decks[0];
  const legendName = meta.display ?? best.legend;
  const champ = legendName.split(",")[0];
  const subtitle = legendName.includes(",") ? legendName.split(",").slice(1).join(",").trim() : "";
  const short = (shortCount.get(champ) ?? 0) > 1 && subtitle ? `${champ} ${subtitle}` : champ;
  const doms = domainsFr(best);
  const g = FAM[meta.fam];

  // Cartes clés regroupées par type FR.
  const join5 = (a: string[]) => a.map((n) => `[[${n}]]`).join(", ");
  const units: string[] = [], spells: string[] = [], gears: string[] = [], autres: string[] = [];
  for (const n of topCardNames(best)) {
    const t = cardType.get(n);
    if (t === "Unit") units.push(n);
    else if (t === "Spell") spells.push(n);
    else if (t === "Gear") gears.push(n);
    else autres.push(n);
  }
  const keyLines: string[] = [];
  if (best.champion) keyLines.push(`- **Champion :** [[${best.champion}]]`);
  if (units.length) keyLines.push(`- **Unités à connaître :** ${join5(units)}`);
  if (spells.length) keyLines.push(`- **Sorts clés :** ${join5(spells)}`);
  if (gears.length) keyLines.push(`- **Équipements :** ${join5(gears)}`);
  if (autres.length) keyLines.push(`- **Autres cartes importantes :** ${join5(autres)}`);

  const intro = `Tu veux te lancer avec **${short}** ? ${g.resume} ${g.dynamique}

**Domaines :** ${doms || "—"} · **Archétype :** ${meta.archetype} · **Difficulté :** ${g.difficulte} · **Tier ${meta.tier}/5**

**Ses forces :** ${g.forces.join(" ; ")}.

> 💡 Survole (ou touche, sur mobile) les noms de cartes surlignés pour voir la carte en détail.`;

  const guide = `## Comment le jouer

**Pour gagner.** ${g.gagne}

**Au fil de la partie.** ${g.plan} ${g.tip}

**Pour qui ?** ${g.pourQui}

**À surveiller.** ${g.faiblesses}

## Les cartes à connaître

Survole chaque carte pour voir son effet.

${keyLines.join("\n")}`;

  const blocks: object[] = [
    { type: "text", id: "intro", content: intro },
    { type: "text", id: "guide", content: guide },
    { type: "separator", id: "sep" },
    {
      type: "text",
      id: "decks-intro",
      content: decks.length > 1
        ? `## La liste\n\nLa version conseillée pour ${short}, suivie de ses variantes. Déplie celle que tu veux voir.`
        : `## La liste\n\nLa liste conseillée pour ${short}. Déplie-la pour voir les cartes.`,
    },
  ];

  decks.forEach((d, i) => {
    const label = decks.length > 1 ? (LIST_LABELS[i] ?? `Variante ${i}`) : "Liste conseillée";
    blocks.push({
      type: "decklist",
      id: `deck-${i}`,
      deckCode: buildDeckCode(d),
      deckName: label,
      legendName,
      collapsed: true,
    });
  });

  const data = {
    title: `Meilleur deck ${short} Unleashed — guide et liste`,
    slug: `meilleur-deck-${slugify(legendName)}`,
    excerpt: `Meilleur deck ${short} en Unleashed (${meta.archetype}, tier ${meta.tier}/5) : une liste solide et un guide complet (forces, plan de jeu, cartes clés) pour débuter avec la Légende.`,
    coverImage: null as string | null,
    category: "meta",
    tags: ["Unleashed", "Meilleur deck", champ, meta.archetype],
    blocks: blocks as object[],
    published: doPublish,
    publishedAt: doPublish ? new Date() : null,
  };

  await prisma.article.upsert({ where: { slug: data.slug }, update: data, create: data });
  created++;
  console.log(`  ✅ ${data.slug} (${decks.length} liste${decks.length > 1 ? "s" : ""}, tier ${meta.tier})`);
}

console.log(`\n${created} articles seedés (published=${doPublish}, catégorie meta, listes repliées).`);
if (skipped.length) console.warn("⚠️  Légendes sans entrée META (ignorées) :", skipped);
await prisma.$disconnect();
