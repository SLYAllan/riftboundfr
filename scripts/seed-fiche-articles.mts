/**
 * Articles ÉCRITS À LA MAIN à partir des fiches réelles (data/fiches/) + des
 * textes de cartes réels. Forme partagée (illustration de la Légende, sections,
 * 2-3 listes RÉELLES complètes à 64 cartes), contenu unique par Légende.
 *
 * Aucune donnée inventée : les listes sont sélectionnées parmi les decks réels.
 * Usage : npx tsx scripts/seed-fiche-articles.mts
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();
const DL = "data/decklists";
const LABELS = ["Version principale", "Variante", "Autre variante"];

type DeckJson = {
  legend: string; champion: string | null; player: string;
  placement: number | null; playerCount: number; date: string; set: string;
  mainDeck: { name: string; quantity: number; type?: string }[];
  runes: Record<string, number>; battlefields: string[];
  sideDeck?: { name: string; quantity: number }[];
};
const lk = (l: string) => l.toLowerCase().replace(/[’'`]/g, "'").trim();
function renderTotal(d: DeckJson): number {
  const champ = d.champion ? 1 : 0;
  const main = d.mainDeck.filter((c) => (c.type ?? "").toLowerCase() !== "champion").reduce((s, c) => s + (c.quantity || 0), 0);
  const runes = Object.values(d.runes ?? {}).reduce((s: number, n) => s + (Number(n) || 0), 0);
  const bf = (d.battlefields ?? []).length;
  const side = (d.sideDeck ?? []).reduce((s, c) => s + (c.quantity || 0), 0);
  return 1 + champ + main + runes + bf + side;
}
function topLists(legend: string): DeckJson[] {
  const out: DeckJson[] = [];
  for (const dir of readdirSync(DL).filter((n) => statSync(join(DL, n)).isDirectory())) {
    for (const f of readdirSync(join(DL, dir)).filter((x) => x.endsWith(".json"))) {
      let d: DeckJson; try { d = JSON.parse(readFileSync(join(DL, dir, f), "utf-8")); } catch { continue; }
      if (!d || d.set !== "Unleashed" || !d.legend) continue;
      if (lk(d.legend) !== lk(legend)) continue;
      if (!Array.isArray(d.mainDeck) || d.mainDeck.length === 0) continue;
      if (renderTotal(d) !== 64) continue;
      out.push(d);
    }
  }
  const p = (d: DeckJson) => (typeof d.placement === "number" && d.placement > 0) ? d.placement : 9999;
  out.sort((a, b) => p(a) - p(b) || (b.playerCount || 0) - (a.playerCount || 0) || (b.date || "").localeCompare(a.date || ""));
  const seen = new Set<string>(); const top: DeckJson[] = [];
  for (const d of out) { const s = `${d.player}|${d.placement}`; if (seen.has(s)) continue; seen.add(s); top.push(d); if (top.length >= 3) break; }
  return top;
}
function deckCode(d: DeckJson): string {
  const p: string[] = [];
  if (d.champion) { p.push("== Champion =="); p.push(`1x ${d.champion}`); }
  p.push("== Main Deck ==");
  for (const c of d.mainDeck) if ((c.type ?? "").toLowerCase() !== "champion") p.push(`${c.quantity}x ${c.name}`);
  const r = Object.entries(d.runes ?? {}).map(([n, q]) => `${q}x ${n.endsWith(" Rune") ? n : n + " Rune"}`);
  if (r.length) { p.push("== Runes =="); p.push(...r); }
  if (d.battlefields?.length) { p.push("== Battlefield =="); for (const b of d.battlefields) p.push(`1x ${b}`); }
  const s = d.sideDeck ?? [];
  if (s.length) { p.push("== Side Deck =="); for (const x of s) p.push(`${x.quantity}x ${x.name}`); }
  return p.join("\n");
}
const ART = (h: string, dim = "744x1039") => `https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/${h}-${dim}.png`;

// Bannières de Légende PRÉ-CADRÉES (public/bannieres/*.webp) = cover propre et
// centré sur la liste /articles. Copie du mapping de src/lib/banners.ts (l'alias
// "@/" ne se résout pas dans ce script tsx). Fallback sur l'art de carte si absent.
const BANNER_MAP: Record<string, string> = {
  irelia: "irelia", sivir: "sivir", diana: "diana", vex: "vex", "master yi": "maitreyi_1",
  leblanc: "leblanc", fiora: "fiora", "miss fortune": "missfortune", sett: "sett",
  draven: "draven", rengar: "rengar", azir: "azir", poppy: "poppy", annie: "annie",
  viktor: "viktor", ezreal: "ezreal", "kha'zix": "khazix", khazix: "khazix",
  "kai'sa": "kaisa", kaisa: "kaisa", lillia: "lillia", teemo: "teemo", lucian: "lucian",
  ornn: "ornn", pyke: "pyke", darius: "darius", jax: "jax", "rek'sai": "reksai",
  reksai: "reksai", jhin: "Jhin", "renata glasc": "renataglasc", volibear: "volibear",
  vi: "vi", jinx: "jinx", ahri: "ahri", leona: "leona", lux: "lux", "lee sin": "leesin",
  yasuo: "yasuo", rumble: "rumble", ivern: "ivern", garen: "garen",
};
const bannerUrl = (legendName: string): string | null => {
  const key = legendName.toLowerCase().split(",")[0].split(" -")[0].trim();
  const file = BANNER_MAP[key];
  return file ? `/bannieres/${file}.webp` : null;
};

type Content = {
  slug: string; title: string; excerpt: string; tags: string[];
  legendName: string; art: string; caption: string;
  lead: string; bref: string; gagne: string; plan: string; cartes: string; forces: string;
};

const CONTENT: Content[] = [
  {
    slug: "meilleur-deck-master-yi-wuju-bladesman",
    title: "Master Yi, Wuju Bladesman : le deck le plus solide d'Unleashed",
    excerpt: "Master Yi, Wuju Bladesman est le deck de contrôle de terrain d'Unleashed : des défenseurs surdimensionnés, un mur intuable avec Ruin Runner, et une victoire qui se construit point par point.",
    tags: ["Unleashed", "Master Yi", "Contrôle de terrain", "Guide débutant"],
    legendName: "Master Yi, Wuju Bladesman",
    art: ART("8231ced23eaf22ca3bf62ec8cb86b83a3e222da6"),
    caption: "Master Yi, Wuju Bladesman : Corps/Calme, la Légende défensive d'Unleashed.",
    lead: `Master Yi, Wuju Bladesman, c'est probablement le deck le plus régulier d'Unleashed, et l'un des plus simples à comprendre. Son plan tient en une idée : prendre un champ de bataille, et ne plus jamais le rendre. Sa capacité de Légende donne **+2 de Puissance à chacune de tes unités qui défend un champ de bataille**. Tes défenseurs sont donc toujours plus gros que les attaquants d'en face, et un terrain conquis devient un mur. Pendant que l'adversaire s'épuise à vouloir te déloger, toi, tu marques.`,
    bref: `Master Yi est un deck **Corps/Calme** de **contrôle de terrain**, classé parmi les meilleurs du format. C'est aussi l'un des meilleurs choix pour débuter en compétition : facile à prendre en main, difficile à mal jouer, et il t'apprend les fondamentaux du jeu, les combats, la pioche et l'interaction.`,
    gagne: `Il y a deux façons de marquer à Riftbound : conquérir un champ de bataille, ou le **contrôler**, c'est-à-dire commencer ton tour en tenant un terrain déjà conquis. Master Yi est bâti pour la seconde. Tu conquiers une fois, ta capacité rend la reconquête adverse presque impossible, et chaque tour te rapporte un point.

Le cœur du moteur, c'est **[[Ruin Runner]]** : une unité à 6 d'énergie et 5 de Puissance que **les sorts et capacités adverses ne peuvent pas cibler**. En défense avec le +2 de la Légende, elle encaisse 7, ne part pas sur un retrait, et verrouille un terrain à elle seule. Ajoute **[[Zhonya's Hourglass]]**, un équipement caché qui sauve une unité de la mort, et tu obtiens une position que l'adversaire ne sait pas comment franchir.`,
    plan: `**Début de partie.** Pose un défenseur tôt, comme **[[Scuttle Crab]]**, qui pioche et révèle la main adverse, ou **[[Lonely Poro]]**, et installe-toi sur un premier terrain. Les premiers tours servent à exister et à tenir, pas à tuer.

**Milieu de partie.** Déploie tes grosses unités, **[[Rengar, Trophy Hunter]]** puis **[[Ruin Runner]]**, et score en contrôlant. Tes réactions **[[Discipline]]** et **[[En Garde]]** gonflent un défenseur au bon moment et repiochent dans la foulée.

**Fin de partie.** Tu as plus de cartes, des murs intuables et un terrain qui rapporte un point par tour. Il ne reste qu'à fermer la porte : **[[Sabotage]]** retire la meilleure carte adverse, **[[Charm]]** déplace un attaquant gênant, **[[Defy]]** contre le sort qui renverserait tout.`,
    cartes: `- **[[Master Yi, Tempered]]**, le Champion (4 d'énergie, 4 de Puissance). Il gagne de l'XP en conquérant et en contrôlant ; au niveau 6, il devient intuable et mobile.
- **[[Ruin Runner]]**, le mur central, impossible à cibler avec un sort.
- **[[Zhonya's Hourglass]]**, l'assurance-vie qui sauve ton unité clé d'un combat perdu.
- **[[Punch First]]** et **[[Primal Strength]]**, des bonus de +5 et +7 de Puissance le temps d'un combat.
- **[[Sabotage]]**, qui voit la main adverse et recycle sa meilleure carte non-unité.`,
    forces: `**Ce qui rend le deck fort**
- Le plus régulier du format : il fait presque toujours quelque chose d'utile.
- Des défenseurs surdimensionnés grâce à la capacité de Légende.
- Beaucoup de pioche et d'interaction, donc rarement à court de réponses.

**Ce à quoi faire attention**
- Pas de tour explosif : tu marques lentement, point par point.
- Si l'adversaire prend une grosse avance avant que tu sois installé, le retour est compliqué.`,
  },
  {
    slug: "meilleur-deck-diana-scorn-of-the-moon",
    title: "Diana, Scorn of the Moon : le deck de tempo qui demande le plus de talent",
    excerpt: "Diana, Scorn of the Moon est l'aggro-tempo d'Unleashed : une avalanche de sorts bon marché pour gagner chaque combat, dominer l'early game et marquer avant que l'adversaire ne comprenne.",
    tags: ["Unleashed", "Diana", "Aggro-tempo", "Guide"],
    legendName: "Diana, Scorn of the Moon",
    art: ART("b00d922d62daca19190e13149fe3cf725c900330"),
    caption: "Diana, Scorn of the Moon : Esprit/Chaos, la Légende qui domine les combats.",
    lead: `Diana, c'est la Légende qui demande le plus de talent d'Unleashed, et celle qui en récompense le plus. Sur le papier, c'est un deck de tempo agressif. En vrai, c'est une partie d'échecs jouée à toute vitesse : tu enchaînes des sorts bon marché pour gagner chaque combat, tu déplaces tes unités au pire moment pour l'adversaire, et tu files en tête au score avant qu'il ait compris ce qui se passe.`,
    bref: `Diana est un deck **Esprit/Chaos** d'**aggro-tempo**, parmi les tout meilleurs du format mais aussi l'un des plus exigeants. Énormément de décisions à chaque tour et une faible marge d'erreur : ce n'est pas un premier deck idéal, mais c'est l'un des plus gratifiants à apprendre.`,
    gagne: `Une grande partie de Riftbound se joue en confrontation : quand deux armées se croisent sur un champ de bataille, chacun peut jouer des sorts pour faire pencher le combat. Diana est faite pour gagner ces échanges. Tes unités grossissent dès que tu lances un sort grâce à **[[Ravenbloom Student]]**, et tu disposes d'un arsenal de réactions à 1 d'énergie : **[[Gust]]** renvoie un attaquant, **[[Stupefy]]** affaiblit une unité, **[[Stacked Deck]]** te trouve la bonne carte. À chaque combat, tu as une réponse de plus que l'adversaire.`,
    plan: `**Début de partie.** Prends le contrôle des premiers combats. Tes petites unités, gonflées par tes sorts, gagnent des échanges qu'elles ne devraient pas, et tu prends la tête au score.

**Milieu de partie.** **[[Hwei, Brooding Painter]]** devient ton moteur : il pioche et défausse à chaque déplacement. **[[Moonfall]]** et **[[Star-Crossed]]** repositionnent tes unités pour transformer un combat perdu en combat gagné.

**Fin de partie.** Tu fermes avec ce que l'adversaire ne peut pas anticiper, un déplacement surprise ou un sort de tempo au bon moment. **[[Vex, Apathetic]]** verrouille la fin de partie en punissant chaque unité déployée en face.`,
    cartes: `- **[[Diana, Lunari]]**, le Champion. Quand un combat s'engage là où elle se trouve, elle anticipe ta pioche et te donne du carburant.
- **[[Ravenbloom Student]]**, qui grossit à chaque sort lancé, le cœur du moteur de tempo.
- **[[Hwei, Brooding Painter]]**, ta machine à filtrer et piocher en milieu de partie.
- **[[Gust]]** et **[[Stupefy]]**, les réactions à 1 d'énergie qui gagnent les combats.
- **[[Moonfall]]**, qui déplace tes unités pour créer les bons combats.`,
    forces: `**Ce qui rend le deck fort**
- Un arsenal Esprit/Chaos qui répond à tout : contresort, retrait, pioche, mouvement.
- Domine l'early game en gagnant les confrontations.
- Une profondeur de jeu quasi infinie une fois maîtrisée.

**Ce à quoi faire attention**
- Une complexité élevée : des dizaines de choix à chaque tour.
- Moins présente en Top 8 que les decks plus directs, faute de pilotes assez aguerris.`,
  },
  {
    slug: "meilleur-deck-irelia-blade-dancer",
    title: "Irelia, Blade Dancer : la Légende de tempo la plus régulière d'Unleashed",
    excerpt: "Irelia, Blade Dancer est le tempo pur d'Unleashed : peu d'unités, un mur de réactions bon marché, et une menace que tu protèges jusqu'à ce qu'elle pousse les derniers points.",
    tags: ["Unleashed", "Irelia", "Tempo", "Guide"],
    legendName: "Irelia, Blade Dancer",
    art: ART("656ef2d1724b818e9e737ec5dcce923de067a316"),
    caption: "Irelia, Blade Dancer : Calme/Chaos, la Légende de tempo la plus régulière.",
    lead: `Si Diana est l'épée, Irelia est le bouclier qui pique. C'est la Légende la plus régulière d'Unleashed : présente dans presque tous les Top cut, et championne de plusieurs Regional. Son plan, c'est le tempo pur, garder une menace en vie et marquer avec, en répondant à tout ce que l'adversaire tente.`,
    bref: `Irelia est un deck **Calme/Chaos** de **tempo**, l'un des plus solides et des mieux définis du format. Le pilotage demande un peu d'habitude, savoir quand protéger et quand pousser, mais le deck pardonne davantage que Diana tout en restant au plus haut niveau.`,
    gagne: `Irelia ne cherche pas à envahir le plateau : elle veut garder UNE menace et marquer avec. **[[Irelia, Fervent]]** grossit à chaque fois que tu la choisis ou la prépares, et elle est difficile à viser puisque l'adversaire doit payer une rune de plus pour la cibler. Autour, tu joues une muraille de réactions à 1 d'énergie : **[[Defy]]** contre un sort, **[[Discipline]]** et **[[Defiant Dance]]** gonflent ta défenseuse et repiochent, **[[Charm]]** déplace un attaquant. **[[Zhonya's Hourglass]]** sauve ta pièce maîtresse d'un combat perdu.`,
    plan: `**Début de partie.** Pose **[[Tideturner]]** et **[[Stellacorn Herder]]**, qui pioche à chaque déplacement, et garde tes positions avec tes sorts bon marché.

**Milieu de partie.** Installe **[[Irelia, Fervent]]**, protège-la avec tes contresorts et tes équipements cachés, et commence à pousser des points en déplaçant tes unités au bon moment.

**Fin de partie.** Le timing fait tout : trop tôt, tu manques de runes ; trop tard, l'adversaire s'installe. Quand la fenêtre s'ouvre, tu enchaînes mouvements et bonus, et tu fermes la partie d'un coup.`,
    cartes: `- **[[Irelia, Fervent]]**, le Champion et la condition de victoire : elle grossit quand tu la choisis et résiste au retrait.
- **[[Stellacorn Herder]]**, qui pioche à chaque déplacement et fait tourner la main.
- **[[Zhonya's Hourglass]]**, la protection cachée qui sauve ta pièce clé.
- **[[Defy]]** et **[[Discipline]]**, les réactions qui contrent et renforcent.
- **[[Charm]]**, pour déplacer l'attaquant qui te gêne au pire moment pour lui.`,
    forces: `**Ce qui rend le deck fort**
- Parfaitement adapté à un méta de tempo : c'est son terrain de jeu.
- Un noyau extrêmement résilient et très peu de mauvais choix de construction.
- Le domaine Calme excelle à neutraliser les sorts et les grosses unités adverses.

**Ce à quoi faire attention**
- Une stratégie rigide, construite autour de sa menace : pas vraiment de plan B.
- Vulnérable si l'adversaire retire ta pièce clé avant que tu puisses la protéger.`,
  },
  {
    slug: "meilleur-deck-leblanc-deceiver",
    title: "LeBlanc, Deceiver : le deck qui gagne en sacrifiant ses propres unités",
    excerpt: "LeBlanc, Deceiver est l'unique deck d'Agonie d'Unleashed : chaque unité qui meurt déclenche pioche, runes et dégâts, pour un moteur de valeur que l'adversaire ne peut pas tarir.",
    tags: ["Unleashed", "LeBlanc", "Agonie", "Guide"],
    legendName: "LeBlanc, Deceiver",
    art: ART("c17d29602d61d6702372fec4db44c6fb2a29e8a2"),
    caption: "LeBlanc, Deceiver : Esprit/Ordre, la seule Légende à moteur d'Agonie.",
    lead: `LeBlanc est la seule Légende qui transforme la mort de ses propres unités en moteur de victoire. Son archétype, l'Agonie, déclenche un effet à chaque fois qu'une de tes unités meurt : pioche, runes, dégâts. Le deck est unique, difficile à cibler, et une fois lancé, presque impossible à arrêter.`,
    bref: `LeBlanc est un deck **Esprit/Ordre** à moteur d'**Agonie** : tes unités meurent, et chaque mort te rapporte quelque chose. Accessible une fois le principe compris, c'est l'un des decks les plus satisfaisants à faire tourner.`,
    gagne: `Le truc de LeBlanc, c'est que perdre une unité n'est jamais une mauvaise nouvelle. **[[Soaring Scout]]** te rend une rune en mourant, **[[Watchful Sentry]]** te fait piocher, **[[Ruined Rex]]** inflige 4 dégâts. Et **[[Karthus, Eternal]]** double tous ces déclenchements. Ajoute **[[Sacrifice]]**, qui tue ta propre unité au bon moment pour relancer la machine, et **[[Mirror Image]]**, qui crée des copies vouées à mourir, et tu obtiens un flot de valeur que l'adversaire ne peut pas tarir.`,
    plan: `**Début de partie.** Mets en place tes petites unités d'Agonie et cherche **[[Karthus, Eternal]]**, la pièce qui double tout.

**Milieu de partie.** Sacrifie sans hésiter : chaque échange te fait piocher et avancer. **[[Glasc Mixologist]]** rejoue une unité depuis la défausse, et le moteur s'emballe.

**Fin de partie.** Tu as plus de cartes et plus de menaces que l'adversaire. **[[Harnessed Dragon]]** retire une unité en arrivant, **[[Vi, Peacekeeper]]** surgit en embuscade et étourdit, et tu fermes pendant qu'en face on manque de ressources.`,
    cartes: `- **[[LeBlanc, Fragmented]]**, le Champion, qui crée des copies destinées à mourir pour nourrir le moteur.
- **[[Karthus, Eternal]]**, la pièce maîtresse : il déclenche chaque effet d'Agonie une fois de plus.
- **[[Watchful Sentry]]** et **[[Soaring Scout]]**, les petites unités qui paient en mourant.
- **[[Sacrifice]]**, pour tuer ta propre unité au moment idéal.
- **[[Mirror Image]]**, qui transforme une unité en deux, dont une jetable.`,
    forces: `**Ce qui rend le deck fort**
- La seule Légende d'Agonie : un archétype unique et difficile à cibler.
- Un moteur de valeur quasi inarrêtable une fois en place.
- Les copies de LeBlanc alimentent naturellement la machine.

**Ce à quoi faire attention**
- La synergie limite la construction : peu de marge pour s'écarter du noyau.
- Le build est connu de tous, il faut savoir y glisser ses propres astuces.`,
  },
  {
    slug: "meilleur-deck-sivir-battle-mistress",
    title: "Sivir, Battle Mistress : la machine de rampe d'Unleashed",
    excerpt: "Sivir, Battle Mistress accélère son énergie pour déployer Dazzling Aurora et Elder Dragon, et écraser une fin de partie que personne ne peut suivre.",
    tags: ["Unleashed", "Sivir", "Rampe", "Guide"],
    legendName: "Sivir, Battle Mistress",
    art: ART("fd060882c32a8deac04aea4241c6ab7b97236a05"),
    caption: "Sivir, Battle Mistress : Corps/Chaos, la Légende de rampe la plus redoutée.",
    lead: `Sivir, c'est le deck qui joue une autre partie que tout le monde. Pendant que l'adversaire se bat pour des points, toi tu accélères ton énergie, tu survis, et tu vises une seule carte : **[[Dazzling Aurora]]**, un équipement à 9 d'énergie qui prend à lui seul le contrôle de la partie. Une fois la machine lancée, le plateau t'appartient.`,
    bref: `Sivir est un deck **Corps/Chaos** de **rampe** construit autour de Dazzling Aurora. Le plan est clair, mais il faut bien gérer ses ressources et survivre à la phase de mise en place. Un excellent deck pour qui aime construire une machine et écraser la fin de partie.`,
    gagne: `Le plan tient en deux temps. D'abord, tu accélères : **[[Mobilize]]**, **[[Catalyst of Aeons]]** et tes équipements bon marché te donnent de l'avance sur l'énergie pendant que tu encaisses. Ensuite, tu déploies **[[Dazzling Aurora]]**, qui invoque une grosse unité chaque tour et nettoie le plateau adverse, puis **[[Elder Dragon]]**, un finisher de 10 de Puissance dont les dégâts suffisent toujours à tuer. À ce stade, l'adversaire n'a plus les moyens de suivre.`,
    plan: `**Début de partie.** Survis et accélère. Tes sorts de rampe et tes équipements bon marché préparent le terrain pendant que tu gères les premières unités adverses.

**Milieu de partie.** Pioche pour trouver **[[Dazzling Aurora]]** et installe-la. **[[Mindsplitter]]** retire la meilleure carte de la main adverse, **[[Sabotage]]** fait de même côté sorts.

**Fin de partie.** Aurora tourne, **[[Elder Dragon]]** verrouille les combats, et tu conquiers un plateau que personne ne peut te disputer.`,
    cartes: `- **[[Sivir, Mercenary]]**, le Champion, taillée pour porter la stratégie de rampe.
- **[[Dazzling Aurora]]**, le moteur du deck : une grosse unité gratuite chaque tour.
- **[[Elder Dragon]]**, le finisher dont n'importe quel dégât suffit à tuer.
- **[[Mindsplitter]]**, qui vide la main adverse de sa meilleure carte.
- **[[Catalyst of Aeons]]** et **[[Mobilize]]**, l'accélération qui fait tout démarrer.`,
    forces: `**Ce qui rend le deck fort**
- La meilleure Légende pour Dazzling Aurora : la synergie est optimale.
- Des fins de partie écrasantes que les decks honnêtes ne peuvent pas suivre.
- Des résultats prouvés en tournoi, dont une finale de Regional.

**Ce à quoi faire attention**
- Le méta peut se charger en retrait d'équipement, qui vise directement Aurora.
- Fragile pendant la phase de mise en place, avant que la machine ne tourne.`,
  },
  {
    slug: "meilleur-deck-azir-emperor-of-the-sands",
    title: "Azir, Emperor of the Sands : l'empire de sable qui ne s'arrête jamais",
    excerpt: "Azir, Emperor of the Sands invoque une armée de Sand Soldiers en jouant des équipements, puis conquiert sans relâche en transmettant son arsenal d'unité en unité.",
    tags: ["Unleashed", "Azir", "Jetons et équipements", "Guide"],
    legendName: "Azir, Emperor of the Sands",
    art: ART("0472274c49f6540858758ebf9bd2f107a601541a"),
    caption: "Azir, Emperor of the Sands : Calme/Ordre, l'empereur qui invoque ses soldats.",
    lead: `Azir, c'est un empire qui se construit pièce par pièce. Chaque fois que tu joues un équipement, ta capacité de Légende invoque un Sand Soldier, un petit soldat qui vient grossir ton armée. Tu équipes, tu invoques, tu conquiers, et très vite l'adversaire fait face à une marée de soldats que tu déplaces et rééquipes à volonté.`,
    bref: `Azir est un deck **Calme/Ordre** de **jetons et équipements**, double vainqueur de Regional. Le plan est limpide et l'un des plus satisfaisants à dérouler : c'est un bon deck pour qui aime voir un plateau se construire et déborder l'adversaire.`,
    gagne: `Le moteur d'Azir, ce sont ses équipements bon marché : **[[Soul Sword]]**, **[[B.F. Sword]]**, **[[Brutalizer]]**. Chacun déclenche la capacité de Légende et fait apparaître un Sand Soldier. Tu te retrouves vite avec plus d'unités que l'adversaire, et comme l'équipement passe d'une créature à l'autre, un seul arsenal sert toute ton armée. Pendant ce temps, **[[Defy]]** et **[[Discipline]]** protègent tes positions, et tu conquiers terrain après terrain.`,
    plan: `**Début de partie.** Pose tes premiers équipements pour lancer la machine à Sand Soldiers et occupe un champ de bataille.

**Milieu de partie.** Empile l'équipement sur tes meilleures unités, transmets-le au fil des combats, et commence à conquérir sur deux fronts.

**Fin de partie.** Ton armée de soldats équipés est partout. **[[Deathgrip]]** te permet de passer par-dessus un mur adverse pour aller chercher les derniers points, et l'empire se referme.`,
    cartes: `- **[[Azir, Sovereign]]**, le Champion, qui porte la stratégie de conquête à coups de soldats.
- **[[B.F. Sword]]** et **[[Soul Sword]]**, des équipements bon marché qui déclenchent l'invocation des Sand Soldiers.
- **[[Brutalizer]]**, pour transformer un soldat en véritable menace.
- **[[Deathgrip]]**, la réponse qui débloque une situation et va chercher un point.
- **[[Defy]]** et **[[En Garde]]**, les réactions qui gardent tes positions.`,
    forces: `**Ce qui rend le deck fort**
- Un plan de jeu clair et un noyau d'équipements stable d'un set à l'autre.
- Une armée de Sand Soldiers qui déborde les decks plus lents.
- Des conquêtes imprévisibles grâce aux cartes cachées.

**Ce à quoi faire attention**
- Très dépendant des équipements : le retrait de gear vise directement ton moteur.
- Peu d'unités « réelles » : sans tes soldats, le plateau se vide vite.`,
  },
  {
    slug: "meilleur-deck-ezreal-prodigal-explorer",
    title: "Ezreal, Prodigal Explorer : le contrôle qui pioche à l'infini",
    excerpt: "Ezreal, Prodigal Explorer pioche dès qu'il vise les cartes adverses, ce qui en fait une machine à réponses qui ne tombe jamais à court. Le deck de contrôle au plafond le plus élevé.",
    tags: ["Unleashed", "Ezreal", "Contrôle", "Guide"],
    legendName: "Ezreal, Prodigal Explorer",
    art: ART("d0e143d9edbc14971b2a7b463b3c25b2b6a0c098"),
    caption: "Ezreal, Prodigal Explorer : Esprit/Chaos, le contrôle à pioche infinie.",
    lead: `Ezreal, c'est le deck de contrôle pour ceux qui veulent réfléchir. Sa capacité le fait piocher dès qu'il vise deux cartes adverses dans un tour, et comme un deck de contrôle passe son temps à répondre à ce qu'en face déploie, Ezreal pioche presque gratuitement. Résultat, une machine à réponses qui ne tombe jamais à court.`,
    bref: `Ezreal est un deck **Esprit/Chaos** de **contrôle**, l'un des plus exigeants du format mais aussi l'un des plus puissants entre de bonnes mains. Ce n'est pas un deck pour débuter, c'est un deck pour progresser.`,
    gagne: `Tout tourne autour du ciblage. **[[Deadly Flourish]]** inflige des dégâts et laisse une récompense, **[[Stupefy]]** affaiblit, **[[Bellows Breath]]** répond. Chaque carte que tu vises côté adverse fait avancer ta capacité et te fait piocher. **[[Fizz, Trickster]]** rejoue un sort depuis ta défausse, et tu finis par enchaîner plus de réponses que l'adversaire n'a de menaces. Quand il n'a plus rien, tu conquiers le plateau vide.`,
    plan: `**Début de partie.** Installe ton économie et gère les premières menaces sans te précipiter : tes grosses cartes arrivent plus tard.

**Milieu de partie.** Prends le contrôle avec **[[Deadly Flourish]]** et **[[Stacked Deck]]**, et commence à piocher gratuitement en visant la main et le plateau adverses.

**Fin de partie.** Ta capacité tourne à plein, tu rejoues tes meilleurs sorts avec **[[Fizz, Trickster]]**, et l'adversaire n'a tout simplement plus les ressources pour suivre.`,
    cartes: `- **[[Ezreal, Prodigy]]**, le Champion, dont la pioche gratuite libère le deck.
- **[[Deadly Flourish]]**, du retrait qui laisse de la valeur derrière lui.
- **[[Fizz, Trickster]]**, pour rejouer tes sorts depuis la défausse.
- **[[Stupefy]]** et **[[Bellows Breath]]**, les réponses bon marché qui alimentent la capacité.
- **[[Pack of Wonders]]**, qui renvoie une de tes pièces pour la rejouer.`,
    forces: `**Ce qui rend le deck fort**
- Esprit/Chaos est le meilleur duo de contrôle du jeu : une réponse à tout.
- La pioche gratuite rend le deck d'une efficacité redoutable.
- Un plafond très élevé, particulièrement fort sur la scène occidentale.

**Ce à quoi faire attention**
- Complexe à piloter : il faut trouver deux cibles par tour pour lancer la machine.
- Une condition de victoire lente, qui peut se faire déborder par les decks les plus explosifs.`,
  },
  {
    slug: "meilleur-deck-fiora-grand-duelist",
    title: "Fiora, Grand Duelist : la Légende qui récompense les grosses unités",
    excerpt: "Fiora, Grand Duelist transforme ses unités en menaces surpuissantes : une fois assez grosses, elles débloquent des mots-clés qui les rendent presque intuables.",
    tags: ["Unleashed", "Fiora", "Midrange", "Guide"],
    legendName: "Fiora, Grand Duelist",
    art: ART("37064aa79c13316b5dd28f0a2b054821a43f6650"),
    caption: "Fiora, Grand Duelist : Corps/Ordre, la duelliste qui mise sur la puissance.",
    lead: `Fiora récompense les grosses unités. Dès qu'une de tes créatures devient assez puissante, elle débloque des mots-clés qui la rendent quasi intuable, et Fiora en fait une machine à claquer des combats. C'est un midrange solide, au plan de jeu clair, qui sait punir aussi bien l'agression que le contrôle.`,
    bref: `Fiora est un deck **Corps/Ordre** de **midrange**, régulièrement présent en Top 8. Le plan est direct et lisible : c'est un bon deck pour qui veut un style proactif sans la complexité des decks de contrôle.`,
    gagne: `L'idée est de rendre tes unités « puissantes », c'est-à-dire assez grosses pour franchir un seuil de Puissance. **[[Fiora, Victorious]]** devient alors quasi imprenable, avec protection, mobilité et bouclier d'un coup. **[[Akshan, Mischievous]]** attache des équipements à prix réduit, **[[Sett, Brawler]]** grossit à chaque conquête, et tout ce petit monde devient vite trop gros à gérer pour l'adversaire.`,
    plan: `**Début de partie.** Déploie tes premières unités et commence à les renforcer pour viser le seuil de puissance.

**Milieu de partie.** **[[Fiora, Victorious]]** et **[[Sett, Brawler]]** prennent le contrôle des combats. Une fois « puissantes », tes unités encaissent et débordent.

**Fin de partie.** Tes menaces sont devenues impossibles à retirer proprement, et **[[Elder Dragon]]** vient sceller la partie en verrouillant les combats.`,
    cartes: `- **[[Fiora, Worthy]]**, le Champion, le cœur du plan de jeu offensif.
- **[[Fiora, Victorious]]**, qui débloque protection, mobilité et bouclier une fois puissante.
- **[[Akshan, Mischievous]]**, pour équiper tes unités à moindre coût.
- **[[Sett, Brawler]]**, qui grossit à chaque conquête.
- **[[Elder Dragon]]**, le finisher dont le moindre dégât suffit à tuer.`,
    forces: `**Ce qui rend le deck fort**
- Un plan midrange clair, accessible et proactif.
- Des unités buffées extrêmement difficiles à retirer.
- Compétitif pour le Top 8 dans la plupart des tournois.

**Ce à quoi faire attention**
- Plus compliqué face au tout premier tier sans un plan de finition dédié.
- Sensible au retrait, qui peut briser une unité juste avant qu'elle devienne menaçante.`,
  },
  {
    slug: "meilleur-deck-vex-gloomist",
    title: "Vex, Gloomist : le deck qui joue dans l'ombre",
    excerpt: "Vex, Gloomist tient ses positions et retourne les combats avec des cartes cachées que l'adversaire n'a pas vues venir. Un deck d'attrition qui use l'adversaire à petit feu.",
    tags: ["Unleashed", "Vex", "Contrôle défensif", "Guide"],
    legendName: "Vex, Gloomist",
    art: ART("653e9b8fc4989bba59aa7ade4e0c33ffd5596e5a"),
    caption: "Vex, Gloomist : Calme/Chaos, la Légende qui frappe depuis l'ombre.",
    lead: `Vex joue dans l'ombre. Une bonne partie de son deck se pose face cachée, prête à surgir au pire moment pour l'adversaire. Tu tiens tes positions, tu retournes les combats avec des cartes qu'il n'a pas vues venir, et tu l'épuises à petit feu jusqu'à ce qu'il craque.`,
    bref: `Vex est un deck **Calme/Chaos** de **contrôle défensif** bâti sur les cartes cachées et l'attrition. Exigeant à piloter, c'est l'un des meilleurs decks de tenue du format pour qui aime frustrer l'adversaire.`,
    gagne: `Le principe, c'est l'incertitude. **[[Tideturner]]**, **[[Evelynn, Entrancing]]** et **[[Edge of Night]]** se posent face cachée et se révèlent en réaction, au moment où ça fait le plus mal. L'adversaire ne sait jamais ce que tu tiens, donc il attaque mal. Autour, **[[Defy]]** contre ses sorts et **[[Discipline]]** renforce tes défenseurs. Tu ne perds presque jamais un combat que tu as décidé de gagner, et la partie s'étire à ton avantage.`,
    plan: `**Début de partie.** Installe **[[Tideturner]]** et tes unités clés sur un champ de bataille, et garde-les en vie à tout prix.

**Milieu de partie.** Pose tes cartes face cachée et protège tes positions avec tes réactions Calme. Chaque combat retourné fait pencher la partie.

**Fin de partie.** L'adversaire s'est épuisé sur tes murs. Tu prends l'initiative au moment où il n'a plus de ressources et tu conclus.`,
    cartes: `- **[[Vex, Apathetic]]**, le Champion, qui punit chaque unité que l'adversaire déploie.
- **[[Evelynn, Entrancing]]**, une menace cachée qui surgit en défense.
- **[[Edge of Night]]**, l'équipement caché qui surprend dans les combats.
- **[[Tideturner]]**, la pièce flexible posée face cachée.
- **[[Defy]]**, le contresort qui sécurise tes tours clés.`,
    forces: `**Ce qui rend le deck fort**
- Calme et Chaos forment un excellent mélange de soutien et de perturbation.
- Les cartes cachées créent une incertitude permanente pour l'adversaire.
- L'un des meilleurs decks de tenue jamais vus en dehors de Master Yi.

**Ce à quoi faire attention**
- Un manque de puissance brute pour conclure quand l'occasion se présente.
- Une fin de partie parfois floue : il faut savoir saisir le bon moment.`,
  },
  {
    slug: "meilleur-deck-viktor-herald-of-the-arcane",
    title: "Viktor, Herald of the Arcane : le contrôle qui répond à tout",
    excerpt: "Viktor, Herald of the Arcane élimine chaque menace adverse et transforme même ses unités mortes en valeur. Le deck de contrôle le plus dense en sorts du format.",
    tags: ["Unleashed", "Viktor", "Contrôle", "Guide"],
    legendName: "Viktor, Herald of the Arcane",
    art: ART("913236dabf1e4f71650bbba46870fff8163e2eff"),
    caption: "Viktor, Herald of the Arcane : Esprit/Ordre, le maître du contrôle.",
    lead: `Viktor, c'est le contrôle pur. Le deck répond à tout, élimine chaque menace adverse, et transforme même ses propres unités mortes en valeur. Pendant que l'adversaire s'épuise à reconstruire son plateau, Viktor accumule les réponses et finit par conquérir un terrain vide. Finaliste surprise du dernier Regional européen, ce n'est pas un hasard.`,
    bref: `Viktor est un deck **Esprit/Ordre** de **contrôle**, le plus dense en sorts du format. Exigeant et patient, il récompense les joueurs qui savent gérer leurs ressources et lire la partie sur la durée.`,
    gagne: `Viktor gagne par attrition. **[[Cull the Weak]]** et **[[Imperial Decree]]** nettoient le plateau, **[[Hidden Blade]]** élimine une menace en réaction. Et quand ses propres unités tombent, elles laissent quelque chose : **[[Carrion Dredger]]** invoque un oiseau, **[[Honest Broker]]** crée un équipement. Tu réponds, tu échanges, et tu ressors toujours avec une carte d'avance. À la fin, l'adversaire n'a plus de menaces et toi, tu as encore tout ton arsenal.`,
    plan: `**Début de partie.** Réponds aux premières menaces avec tes sorts bon marché et tes petites unités à valeur.

**Milieu de partie.** **[[Cull the Weak]]** et **[[Imperial Decree]]** prennent le contrôle du plateau pendant que **[[Card Sharp]]** alimente ta machine.

**Fin de partie.** L'adversaire est à court de ressources. Tu poses une menace, **[[Vi, Peacekeeper]]** surgit pour étourdir, et tu conquiers tranquillement.`,
    cartes: `- **[[Viktor, Leader]]**, le Champion, qui orchestre le contrôle.
- **[[Cull the Weak]]** et **[[Imperial Decree]]**, le retrait qui vide le plateau adverse.
- **[[Carrion Dredger]]** et **[[Honest Broker]]**, des unités qui paient même en mourant.
- **[[Hidden Blade]]**, l'élimination cachée jouée au bon moment.
- **[[Vi, Peacekeeper]]**, l'embuscade qui étourdit et débloque la fin de partie.`,
    forces: `**Ce qui rend le deck fort**
- Un noyau de retrait extrêmement consistant : un contrôle très fiable.
- Le deck le plus dense en sorts du jeu, donc une réponse à presque tout.
- Excellent contre l'agression et les decks linéaires.

**Ce à quoi faire attention**
- Peu d'unités : un plateau vide peut devenir un problème.
- Une condition de victoire lente, vulnérable aux decks de combinaison rapides.`,
  },
  {
    slug: "meilleur-deck-rengar-pridestalker",
    title: "Rengar, Pridestalker : l'agression qui ne prévient jamais",
    excerpt: "Rengar, Pridestalker fait surgir la moitié de son armée en embuscade, là où l'adversaire ne l'attend pas. Un aggro proactif et imprévisible, finaliste de Regional.",
    tags: ["Unleashed", "Rengar", "Aggro", "Guide"],
    legendName: "Rengar, Pridestalker",
    art: ART("b3d3085f62aee993b9f5b80d4659a88439da83be"),
    caption: "Rengar, Pridestalker : Corps/Furie, le chasseur qui frappe par surprise.",
    lead: `Rengar, c'est l'agression qui ne prévient jamais. La moitié de son armée surgit en embuscade, en pleine défense adverse, là où on ne l'attend pas. L'adversaire ne sait jamais combien de puissance tu as vraiment en réserve, et c'est exactement comme ça que tu prends le dessus. Une liste qui a poussé jusqu'en finale de Regional.`,
    bref: `Rengar est un deck **Corps/Furie** d'**aggro** proactif basé sur l'embuscade. Accessible et explosif, c'est un excellent deck pour qui aime dicter le rythme et mettre la pression sans relâche.`,
    gagne: `Le jeu de Rengar repose sur l'imprévu. **[[Nidalee, Cat Form]]**, **[[Grim Apothecary]]** et **[[Pyke, Dockside Butcher]]** se jouent en embuscade, en réaction, sur un champ de bataille où l'adversaire pensait être en sécurité. **[[Irresistible Faefolk]]** force ses unités à se déplacer pour créer des combats à ton avantage, et **[[Pit Rookie]]** renforce ton plateau. Tu prends le lead tôt et tu ne le rends plus.`,
    plan: `**Début de partie.** Prends l'initiative avec tes petites unités agressives et installe-toi sur un champ de bataille.

**Milieu de partie.** Garde des runes ouvertes et frappe en embuscade au pire moment pour l'adversaire. **[[Kai'Sa, Survivor]]** et **[[Pit Rookie]]** renforcent la poussée.

**Fin de partie.** L'adversaire ne peut pas anticiper tes attaques. Tu fermes la partie avec des unités qu'il n'a pas vues arriver.`,
    cartes: `- **[[Rengar, Trophy Hunter]]**, le Champion, qui surgit en embuscade comme menace lourde.
- **[[Nidalee, Cat Form]]** et **[[Grim Apothecary]]**, l'embuscade qui retourne les combats.
- **[[Irresistible Faefolk]]**, qui déplace une unité adverse pour créer le bon échange.
- **[[Pit Rookie]]**, le renfort qui buff ton plateau.
- **[[Kai'Sa, Survivor]]**, une menace souple qui entre prête.`,
    forces: `**Ce qui rend le deck fort**
- Une pression constante : l'adversaire ne connaît jamais ta vraie puissance.
- Un plan proactif simple et efficace.
- Régulièrement présent en Top 8 des plus petits tournois.

**Ce à quoi faire attention**
- Le style embuscade demande de garder des runes ouvertes : une tension permanente.
- Les joueurs aguerris savent jouer autour de l'embuscade, qui perd alors de son impact.`,
  },
  {
    slug: "meilleur-deck-khazix-voidreaver",
    title: "Kha'Zix, Voidreaver : le tempo qui grandit en se battant",
    excerpt: "Kha'Zix, Voidreaver gagne de l'expérience à chaque combat pour renforcer ses unités, et les protège après une conquête. Un deck de tempo sous-estimé qui monte en puissance.",
    tags: ["Unleashed", "Kha'Zix", "Tempo", "Guide"],
    legendName: "Kha'Zix, Voidreaver",
    art: ART("a5db0b3340a189de1cf9d8174b11eb583f19ea28"),
    caption: "Kha'Zix, Voidreaver : Corps/Chaos, le prédateur qui évolue en combat.",
    lead: `Kha'Zix grandit en se battant. Chaque combat lui donne de l'expérience, et cette expérience renforce ses unités. Sa seconde capacité protège même ses créatures après une conquête en les renvoyant à l'abri. Résultat, un deck de tempo qui monte en puissance et que peu de gens voient venir, car personne ne construit vraiment contre lui.`,
    bref: `Kha'Zix est un deck **Corps/Chaos** de **tempo** qui carbure à l'expérience. Un peu technique, mais gratifiant : c'est une Légende sous-estimée qui récompense ceux qui la maîtrisent.`,
    gagne: `Le plan, c'est de gagner des combats pour gagner de l'XP, et de convertir cette XP en avantage. **[[Demacian Diplomat]]** lance la machine, **[[Grim Resolve]]** offre +3 de Puissance pour remporter un échange, et **[[Void Assault]]** déplace tes unités et celles de l'adversaire pour créer la bonne confrontation. **[[Qiyana, Victorious]]** verrouille un terrain en résistant au retrait. Et quand tu conquiers, ta capacité ramène tes unités à l'abri, prêtes à recommencer.`,
    plan: `**Début de partie.** Gagne tes premiers combats pour accumuler de l'expérience et lancer tes capacités.

**Milieu de partie.** **[[Qiyana, Victorious]]** et tes unités renforcées prennent le contrôle. **[[Void Assault]]** met en place les échanges qui t'arrangent.

**Fin de partie.** Vise les deux champs de bataille : ta capacité protège tes unités après la conquête, ce qui rend la double poussée bien plus sûre qu'elle n'en a l'air.`,
    cartes: `- **[[Kha'Zix, Mutating Horror]]**, le Champion, qui buff tôt puis protège après conquête.
- **[[Qiyana, Victorious]]**, une menace difficile à retirer qui tient un terrain.
- **[[Void Assault]]**, pour déplacer les unités et fabriquer le bon combat.
- **[[Grim Resolve]]**, le bonus de +3 qui vole un échange.
- **[[Demacian Diplomat]]**, le lanceur d'expérience du deck.`,
    forces: `**Ce qui rend le deck fort**
- Une double capacité : renforcement tôt, protection plus tard.
- Sous-estimé, donc rarement ciblé par les adversaires.
- Régulièrement présent en Top 8 des plus petits tournois.

**Ce à quoi faire attention**
- Les unités du début de partie sont faibles en combat : il faut imposer son rythme.
- Le deck demande de bien enchaîner ses combats pour que la machine tourne.`,
  },
  {
    slug: "meilleur-deck-miss-fortune-bounty-hunter",
    title: "Miss Fortune, Bounty Hunter : la rampe qui frappe sur deux fronts",
    excerpt: "Miss Fortune, Bounty Hunter accélère vers Dazzling Aurora et donne le Gank à ses monstres : une seule grosse unité peut conquérir deux champs de bataille dans le même tour.",
    tags: ["Unleashed", "Miss Fortune", "Rampe", "Guide"],
    legendName: "Miss Fortune, Bounty Hunter",
    art: ART("cc11261fcdbf0851525030bd9e835b718efad3bc", "744x1040"),
    caption: "Miss Fortune, Bounty Hunter : Corps/Chaos, la rampe qui frappe sur deux fronts.",
    lead: `Miss Fortune, c'est Sivir avec un tour dans son sac. Elle joue la même grande partie de rampe vers **[[Dazzling Aurora]]**, mais sa capacité donne le Gank à ses unités : une seule grosse créature peut alors conquérir deux champs de bataille dans le même tour. C'est l'arme parfaite pour aller chercher les derniers points quand l'adversaire pensait tenir.`,
    bref: `Miss Fortune est un deck **Corps/Chaos** de **rampe** taillé autour de Dazzling Aurora et du Gank. Un peu technique, c'est un excellent choix pour qui aime les fins de partie spectaculaires.`,
    gagne: `Comme Sivir, tu accélères, tu survis, et tu vises Dazzling Aurora pour invoquer des monstres chaque tour. La différence, c'est la finition : ta capacité donne le Gank, c'est-à-dire la possibilité de déplacer une unité d'un champ de bataille à l'autre. Une seule créature massive, comme **[[Baron Nashor]]** ou **[[Elder Dragon]]**, peut alors marquer sur deux terrains d'un coup. C'est souvent comme ça que tombe le huitième point.`,
    plan: `**Début de partie.** Survis et accélère avec **[[Mobilize]]** et tes équipements bon marché.

**Milieu de partie.** Trouve **[[Dazzling Aurora]]**, installe-la, et commence à déployer tes monstres pendant que **[[Flurry of Blades]]** nettoie les petites unités adverses.

**Fin de partie.** Lance le Gank sur une grosse unité pour conquérir deux champs de bataille dans le même tour, et referme la partie d'un coup.`,
    cartes: `- **[[Miss Fortune, Captain]]**, le Champion, qui donne le Gank pour la double conquête.
- **[[Dazzling Aurora]]**, le moteur de monstres gratuits.
- **[[Baron Nashor]]** et **[[Elder Dragon]]**, les colosses que tu déplaces pour marquer partout.
- **[[Mobilize]]**, l'accélération qui lance la machine.
- **[[Flurry of Blades]]**, le balai à petites unités.`,
    forces: `**Ce qui rend le deck fort**
- Le Gank est la meilleure capacité du jeu pour aller chercher le dernier point.
- Des fins de partie explosives que peu de decks peuvent anticiper.
- Excellente contre les stratégies lentes grâce à sa perturbation Chaos.

**Ce à quoi faire attention**
- Moins d'outils de survie que Sivir pendant la phase de mise en place.
- Très dépendante de trouver Dazzling Aurora à temps.`,
  },
  {
    slug: "meilleur-deck-draven-glorious-executioner",
    title: "Draven, Glorious Executioner : le midrange qui pioche en se battant",
    excerpt: "Draven, Glorious Executioner pioche à chaque combat gagné et met l'adversaire devant un dilemme permanent : t'attaquer te donne des cartes, te laisser te laisse pousser.",
    tags: ["Unleashed", "Draven", "Midrange", "Guide"],
    legendName: "Draven, Glorious Executioner",
    art: ART("b01b2d0454ceeffdc106c4c64a390b275ebf390b"),
    caption: "Draven, Glorious Executioner : Chaos/Furie, le bourreau qui pioche en gagnant.",
    lead: `Draven adore le combat, et il te le fait payer. Chaque fois qu'il gagne un échange, en attaque comme en défense, il pioche. L'adversaire se retrouve devant un dilemme permanent : t'attaquer, c'est risquer de te donner des cartes ; ne pas t'attaquer, c'est te laisser pousser. Dans les deux cas, tu avances.`,
    bref: `Draven est un deck **Chaos/Furie** de **midrange** explosif, roi du set précédent et toujours dangereux. Accessible et agressif, c'est un bon deck pour qui aime mettre la pression tout en gardant la main pleine.`,
    gagne: `Le moteur, c'est la capacité de Draven : gagne un combat, pioche une carte. Tes unités de milieu de partie comme **[[Darius, Trifarian]]** et **[[Noxus Hopeful]]** dominent les échanges, **[[Spinning Axe]]** s'attache gratuitement pour gonfler un attaquant, et chaque combat remporté te creuse une avance en cartes. L'adversaire ne peut pas se permettre de te combattre, ni de te laisser tranquille.`,
    plan: `**Début de partie.** Développe tes unités et impose des combats que tu peux gagner pour lancer la pioche.

**Milieu de partie.** **[[Darius, Trifarian]]** et **[[Noxus Hopeful]]** prennent le contrôle du plateau. Chaque échange gagné te rapporte une carte.

**Fin de partie.** Ton avance en cartes finit par étouffer l'adversaire. Tu pousses les derniers points pendant qu'il manque de ressources.`,
    cartes: `- **[[Draven, Showboat]]**, le Champion, qui pioche à chaque combat gagné.
- **[[Noxus Hopeful]]**, une grosse unité bon marché si tu as déjà joué une carte.
- **[[Spinning Axe]]**, l'équipement qui s'attache en réaction pour voler un combat.
- **[[Darius, Trifarian]]**, le bruiser qui se prépare tout seul.
- **[[Kai'Sa, Survivor]]**, une menace souple qui entre prête.`,
    forces: `**Ce qui rend le deck fort**
- La capacité crée un dilemme constant pour l'adversaire.
- Explosif en milieu de partie, difficile à contenir.
- Un noyau très solide qui n'a presque pas besoin de cartes récentes.

**Ce à quoi faire attention**
- Un peu en difficulté face aux toutes grosses menaces qu'il faut renvoyer en main.
- Le deck a peu évolué : son plafond est connu et stable.`,
  },
  {
    slug: "meilleur-deck-sett-the-boss",
    title: "Sett, The Boss : le deck dont les unités ne meurent jamais",
    excerpt: "Sett, The Boss rappelle ses unités vaincues au lieu de les laisser mourir, et les renforce sans cesse : une puissance totale qui ne fait que grimper jusqu'à étouffer l'adversaire.",
    tags: ["Unleashed", "Sett", "Midrange", "Guide"],
    legendName: "Sett, The Boss",
    art: ART("b132becb843b2cf418cb110ead64758f49f51554"),
    caption: "Sett, The Boss : Corps/Ordre, le patron dont les unités reviennent toujours.",
    lead: `Sett, c'est le patron : ses unités ne meurent pas vraiment. Sa capacité rappelle une créature vaincue au lieu de la laisser tomber, et comme le deck les renforce sans arrêt, ta puissance totale ne fait que grimper. À ce petit jeu, l'adversaire finit toujours par s'épuiser le premier.`,
    bref: `Sett est un deck **Corps/Ordre** de **midrange** résistant. Exigeant à piloter mais au plafond très élevé, c'est une Légende pour les joueurs qui aiment bâtir un plateau impossible à démanteler.`,
    gagne: `Tout repose sur la résilience. Tes unités sont renforcées en permanence par **[[Pit Rookie]]**, **[[Arena Bar]]** et **[[Showstopper]]**, et quand l'une tombe, la capacité de Sett la rappelle. **[[Fiora, Victorious]]** et **[[Rengar, Trophy Hunter]]** deviennent des menaces que l'adversaire ne peut pas retirer durablement, et **[[Punch First]]** vole les combats serrés. Ta puissance totale grimpe tour après tour, jusqu'à déborder.`,
    plan: `**Début de partie.** Déploie tes unités et commence à les renforcer dès que possible.

**Milieu de partie.** Tiens tes positions avec des créatures massives. Chaque unité rappelée par la capacité de Sett relance ton avantage.

**Fin de partie.** Ton plateau est devenu ingérable : les unités reviennent toujours, plus grosses. Tu conquiers et tu gardes.`,
    cartes: `- **[[Sett, Kingpin]]**, le Champion, autour duquel se construit le mur de buffs.
- **[[Showstopper]]**, qui renforce une unité et la lance au combat.
- **[[Pit Rookie]]** et **[[Arena Bar]]**, les sources de bonus permanents.
- **[[Fiora, Victorious]]**, une menace que les buffs rendent intuable.
- **[[Punch First]]**, le +5 qui vole un échange décisif.`,
    forces: `**Ce qui rend le deck fort**
- Les unités ne meurent jamais vraiment : une valeur qui s'accumule sans fin.
- Corps et Ordre regorgent de bonus, ce qui rend la capacité facile à exploiter.
- Un plafond très élevé entre des mains expertes.

**Ce à quoi faire attention**
- L'une des Légendes les plus difficiles à piloter du format.
- Le plan demande de la mise en place : un mauvais départ se paie cher.`,
  },
  {
    slug: "meilleur-deck-ahri-nine-tailed-fox",
    title: "Ahri, Nine-Tailed Fox : le contrôle qui carbure aux sorts",
    excerpt: "Ahri, Nine-Tailed Fox renforce ses unités à chaque sort lancé et garde le plateau sous cloche. Un contrôle flexible et bourré de réponses, pour qui aime jongler avec sa main.",
    tags: ["Unleashed", "Ahri", "Contrôle", "Guide"],
    legendName: "Ahri, Nine-Tailed Fox",
    art: ART("fbce641f5e4d8cdf2956e8ead5884b6cd3ccd90d", "744x1040"),
    caption: "Ahri, Nine-Tailed Fox : Calme/Esprit, la renarde qui contrôle par les sorts.",
    lead: `Ahri carbure aux sorts. Chaque sort lancé renforce ses unités et fait tourner sa machine de contrôle. Le deck répond à tout, garde le plateau sous cloche et l'emporte à l'usure, à condition d'aimer jongler avec une main pleine d'options.`,
    bref: `Ahri est un deck **Calme/Esprit** de **contrôle** très dense en sorts. Exigeant, flexible et adaptable au méta local, c'est une Légende pour les joueurs qui aiment réfléchir à chaque échange.`,
    gagne: `Le plan, c'est de transformer chaque sort en avantage. **[[Ravenbloom Student]]** grossit dès que tu lances un sort, **[[Sona, Harmonious]]** relance tes runes pour que tu n'aies jamais à choisir entre te défendre et te développer. Tes défenseurs tanky, comme **[[Blue Sentinel]]**, tiennent les champs de bataille pendant que **[[Defy]]** et tes réactions repoussent les assauts. Tu accumules la valeur, et tu conquiers une fois l'adversaire à sec.`,
    plan: `**Début de partie.** Pose tes petites unités et commence à accumuler des sorts en main.

**Milieu de partie.** **[[Blue Sentinel]]** et tes défenseurs tiennent le plateau pendant que **[[Sona, Harmonious]]** garde tes runes disponibles.

**Fin de partie.** Tu noies l'adversaire sous les réponses et tu conquiers les positions qu'il ne peut plus défendre.`,
    cartes: `- **[[Ahri, Inquisitive]]**, le Champion, qui tire parti de chaque sort lancé.
- **[[Ravenbloom Student]]**, l'unité qui grossit au rythme de tes sorts.
- **[[Sona, Harmonious]]**, qui relance tes runes pour ne jamais manquer de ressources.
- **[[Blue Sentinel]]**, un défenseur tanky qui verrouille un terrain.
- **[[Defy]]**, le contresort qui sécurise tes tours décisifs.`,
    forces: `**Ce qui rend le deck fort**
- Très dense en sorts : beaucoup de réponses et de flexibilité.
- Excellent contre l'agression grâce à ses tours de tempo.
- Adaptable au méta local, avec de nombreux choix de cartes souples.

**Ce à quoi faire attention**
- Peu d'équipements : vulnérable aux stratégies qui ciblent les sorts.
- Dépendante des matchups, moins à l'aise face aux decks les plus rapides.`,
  },
  {
    slug: "meilleur-deck-lillia-bashful-bloom",
    title: "Lillia, Bashful Bloom : la Légende des échanges impossibles",
    excerpt: "Lillia, Bashful Bloom génère des Sprites prêts au combat qui forcent l'adversaire à un choix perdant : sacrifier de vraies unités, ou laisser passer des conquêtes gratuites.",
    tags: ["Unleashed", "Lillia", "Tempo", "Guide"],
    legendName: "Lillia, Bashful Bloom",
    art: ART("7e1554365120c5042947aef8bcac48a07445e9f3"),
    caption: "Lillia, Bashful Bloom : Calme/Esprit, la faonne aux échanges asymétriques.",
    lead: `Lillia met l'adversaire face à un dilemme cruel. Elle génère des Sprites, de petits jetons éphémères qui arrivent prêts à se battre. En face, on doit choisir : sacrifier de vraies unités pour les tuer, ou laisser passer des conquêtes gratuites. Quoi qu'il choisisse, c'est toi qui gagnes l'échange.`,
    bref: `Lillia est un deck **Calme/Esprit** de **tempo** bâti sur ses jetons Sprites. Accessible et malin, c'est un deck qui récompense ceux qui aiment gagner la partie un petit avantage à la fois.`,
    gagne: `Le cœur du deck, ce sont les Sprites. **[[Sprite Fountain]]** et tes générateurs créent des jetons de 3 de Puissance qui entrent prêts, donc immédiatement menaçants. L'adversaire perd de vraies cartes pour les arrêter, ou encaisse des conquêtes. Pendant ce temps, **[[Ravenbloom Student]]** grossit à chaque sort, **[[Charm]]** déplace un attaquant gênant, et **[[Thousand-Tailed Watcher]]** vient conclure. Tu marques en continu sur des échanges toujours favorables.`,
    plan: `**Début de partie.** Garde ta première unité hors des combats et laisse l'adversaire choisir ses échanges : tes Sprites arrivent vite.

**Milieu de partie.** Génère des Sprites tour après tour. Chaque jeton échangé contre une vraie unité adverse est une victoire.

**Fin de partie.** Continue de produire des jetons et conclus avec **[[Thousand-Tailed Watcher]]** pendant que l'adversaire s'épuise.`,
    cartes: `- **[[Lillia, Fae Fawn]]**, le Champion, qui génère les Sprites prêts au combat.
- **[[Sprite Fountain]]**, la source de jetons qui rythme le deck.
- **[[Ravenbloom Student]]**, l'unité qui grossit à chaque sort.
- **[[Thousand-Tailed Watcher]]**, le finisher qui entre prêt.
- **[[Charm]]**, pour déplacer l'attaquant au pire moment pour l'adversaire.`,
    forces: `**Ce qui rend le deck fort**
- Des échanges systématiquement à l'avantage de Lillia.
- Des Sprites qui entrent prêts, donc une pression immédiate.
- Régulièrement présent en Top 8 des plus petits tournois.

**Ce à quoi faire attention**
- Un plan de jeu évident, peu flexible une fois lancé.
- Le duo Calme/Esprit manque parfois de puissance brute pour conclure.`,
  },
  {
    slug: "meilleur-deck-leona-radiant-dawn",
    title: "Leona, Radiant Dawn : le midrange qui ne se laisse jamais surprendre",
    excerpt: "Leona, Radiant Dawn garde toujours une réponse cachée prête à retourner un combat. Un midrange défensif solide, qui use l'adversaire avec des coups fourrés.",
    tags: ["Unleashed", "Leona", "Midrange", "Guide"],
    legendName: "Leona, Radiant Dawn",
    art: ART("822b8bc7987a47498550708b18ef166b121fd620"),
    caption: "Leona, Radiant Dawn : Calme/Ordre, la gardienne aux coups fourrés.",
    lead: `Leona, c'est le midrange qui ne se laisse jamais surprendre. Le deck garde toujours une réponse cachée, prête à retourner un combat que l'adversaire croyait gagné. Tu conquiers lentement, tu défends tes positions avec des coups fourrés, et tu uses ton adversaire jusqu'à le faire craquer.`,
    bref: `Leona est un deck **Calme/Ordre** de **midrange** défensif. Accessible et solide, avec un noyau très consistant, c'est un bon deck pour apprendre à défendre et à retourner les combats.`,
    gagne: `Leona gagne en transformant chaque combat en piège. **[[Call to Glory]]** se joue en réaction pour rallier tes unités au pire moment pour l'adversaire, et **[[Zhonya's Hourglass]]** sauve ta pièce clé d'un échange perdu. Tes défenseurs, comme **[[Vi, Peacekeeper]]** qui surgit et étourdit, tiennent les champs de bataille pendant que **[[Stellacorn Herder]]** fait tourner ta main. Tu avances prudemment et tu punis chaque attaque mal calculée.`,
    plan: `**Début de partie.** Établis ton plateau avec **[[Scuttle Crab]]** et tes petites unités, et garde une réponse cachée en réserve.

**Milieu de partie.** **[[Vi, Peacekeeper]]** et tes défenseurs prennent le contrôle des combats. **[[Call to Glory]]** retourne un échange que l'adversaire pensait gagné.

**Fin de partie.** Tu défends tes positions conquises avec tes coups fourrés et tu marques régulièrement jusqu'à conclure.`,
    cartes: `- **[[Leona, Determined]]**, le Champion, taillée pour tenir et retourner les combats.
- **[[Call to Glory]]**, le coup caché qui renverse un échange.
- **[[Zhonya's Hourglass]]**, l'assurance-vie de ta pièce maîtresse.
- **[[Vi, Peacekeeper]]**, l'embuscade qui étourdit un attaquant.
- **[[Stellacorn Herder]]**, qui pioche à chaque déplacement.`,
    forces: `**Ce qui rend le deck fort**
- Un noyau de quatre cartes très solide, donc des listes consistantes.
- Beaucoup de coups fourrés qui rendent les combats imprévisibles.
- Un excellent deck pour apprendre à défendre.

**Ce à quoi faire attention**
- Peu d'équipements et une dépendance aux sorts : vulnérable aux contresorts.
- Un manque de pointe pour conclure rapidement les parties.`,
  },
  {
    slug: "meilleur-deck-ornn-fire-below-the-mountain",
    title: "Ornn, Fire Below the Mountain : le forgeron aux unités monstrueuses",
    excerpt: "Ornn, Fire Below the Mountain empile les équipements comme aucune autre Légende et transforme ses unités en monstres au fil de la partie. Un archétype unique et satisfaisant.",
    tags: ["Unleashed", "Ornn", "Équipements", "Guide"],
    legendName: "Ornn, Fire Below the Mountain",
    art: ART("ed58d654034d545e54c85d836f3a6552772dd75b"),
    caption: "Ornn, Fire Below the Mountain : Calme/Esprit, le forgeron de Riftbound.",
    lead: `Ornn, c'est le forgeron de Riftbound. Son deck empile les équipements comme aucune autre Légende, et plus la partie avance, plus ses unités deviennent monstrueuses. C'est un archétype unique, satisfaisant à construire, qui récompense la patience et la mise en place.`,
    bref: `Ornn est un deck **Calme/Esprit** centré sur les **équipements**, le plus dense en gear du jeu. Exigeant mais consistant grâce à son large noyau, c'est une Légende pour qui aime bâtir une machine.`,
    gagne: `Le plan, c'est l'accumulation. Tes équipements bon marché, **[[Poro Snax]]**, **[[Seal of Focus]]**, **[[Brutalizer]]**, posent les bases tout en piochant et en générant des ressources. **[[Pit Crew]]** se prépare à chaque équipement joué et devient une présence constante. Au fil des tours, tu empiles tellement de gear sur tes unités, **[[Thousand-Tailed Watcher]]** en tête, qu'elles deviennent impossibles à arrêter, et **[[Consult the Past]]** te permet de tout recycler.`,
    plan: `**Début de partie.** Pose tes équipements bon marché pour installer le plateau, piocher et accumuler des ressources.

**Milieu de partie.** **[[Pit Crew]]** s'active à chaque gear et tes unités commencent à grossir. Protège ta mise en place.

**Fin de partie.** Tes unités croulent sous l'équipement et deviennent intuables. Tu écrases les combats et tu conquiers.`,
    cartes: `- **[[Ornn, Forge God]]**, le Champion, le cœur de la stratégie d'équipement.
- **[[Pit Crew]]**, qui se prépare à chaque équipement joué.
- **[[Brutalizer]]**, un équipement qui transforme une unité en menace.
- **[[Thousand-Tailed Watcher]]**, la grosse unité que tu rends monstrueuse.
- **[[Consult the Past]]**, pour recycler tes meilleures cartes.`,
    forces: `**Ce qui rend le deck fort**
- Un archétype unique, le plus dense en équipements du jeu.
- Un large noyau qui rend les listes très consistantes.
- Une accumulation de valeur difficile à arrêter si on te laisse t'installer.

**Ce à quoi faire attention**
- Peu de sorts de retrait : vulnérable aux plateaux agressifs.
- Dépendant de la pioche d'équipements, parfois inconsistant.`,
  },
  {
    slug: "meilleur-deck-teemo-swift-scout",
    title: "Teemo, Swift Scout : le petit éclaireur qui joue sur le doute",
    excerpt: "Teemo, Swift Scout pose ses pièges face cachée et prend l'avantage tôt, pendant que l'adversaire tente de deviner ce qui l'attend. Un tempo malicieux qui punit les plans trop précis.",
    tags: ["Unleashed", "Teemo", "Tempo", "Guide"],
    legendName: "Teemo, Swift Scout",
    art: ART("9723181e3392bb61c2aabc804a44f7b0558cedf1"),
    caption: "Teemo, Swift Scout : Esprit/Chaos, l'éclaireur qui mise sur le doute.",
    lead: `Teemo joue sur le doute. Le petit éclaireur pose ses pièges face cachée et prend l'avantage tôt, pendant que l'adversaire essaie de deviner ce qui l'attend. C'est un deck de tempo malicieux, parfait contre ceux qui aiment planifier chaque tour au cordeau.`,
    bref: `Teemo est un deck **Esprit/Chaos** de **tempo** basé sur les cartes cachées. Exigeant à piloter, c'est une Légende qui récompense la ruse et la lecture de l'adversaire.`,
    gagne: `Comme Diana, Teemo enchaîne les sorts bon marché pour gagner les combats, mais il y ajoute une couche de bluff. **[[Tideturner]]** et ses cartes cachées créent une incertitude permanente : l'adversaire ne sait jamais ce que tu tiens en réserve. **[[Ravenbloom Student]]** grossit à chaque sort, **[[Gust]]** et **[[Stupefy]]** retournent les échanges, et **[[Hwei, Brooding Painter]]** fait tourner ta main. Tu prends la tête tôt et tu gardes l'adversaire dans le flou.`,
    plan: `**Début de partie.** Prends l'avantage avec tes petites unités gonflées par tes sorts, et pose tes premières cartes cachées.

**Milieu de partie.** **[[Hwei, Brooding Painter]]** alimente ta main pendant que tes menaces cachées dissuadent l'adversaire d'attaquer.

**Fin de partie.** Tu conclus avec ce qu'il n'a pas vu venir : une réaction cachée au bon moment, et les derniers points tombent.`,
    cartes: `- **[[Teemo, Scout]]**, le Champion, qui bâtit son avantage autour des cartes cachées.
- **[[Tideturner]]**, la menace posée face cachée qui sème le doute.
- **[[Hwei, Brooding Painter]]**, le moteur de pioche du milieu de partie.
- **[[Gust]]** et **[[Stupefy]]**, les réactions à 1 d'énergie qui gagnent les combats.
- **[[Ravenbloom Student]]**, l'unité qui grossit à chaque sort.`,
    forces: `**Ce qui rend le deck fort**
- Les cartes cachées créent une incertitude permanente pour l'adversaire.
- Excellent contre les decks qui planifient précisément leurs tours.
- Un tempo agressif capable de prendre le contrôle tôt.

**Ce à quoi faire attention**
- Une performance globale en dents de scie : la liste demande un pilote averti.
- Très proche de Diana, mais avec un peu moins de puissance brute.`,
  },
  {
    slug: "meilleur-deck-volibear-relentless-storm",
    title: "Volibear, Relentless Storm : l'orage qui fait tomber les dragons",
    excerpt: "Volibear, Relentless Storm accélère son énergie pour déployer des dragons massifs bien avant l'heure, des menaces que l'adversaire n'a pas les moyens de gérer.",
    tags: ["Unleashed", "Volibear", "Rampe", "Guide"],
    legendName: "Volibear, Relentless Storm",
    art: ART("f1842ef373434db3e8109d8959832f9d184866c3", "744x1040"),
    caption: "Volibear, Relentless Storm : Corps/Furie, l'orage qui invoque les dragons.",
    lead: `Volibear, c'est l'orage qui gronde puis s'abat. Le deck accélère son énergie pour faire tomber des dragons bien avant l'heure, des créatures si grosses que l'adversaire n'a tout simplement pas les moyens de les gérer. Tu montes en puissance, puis tu écrases.`,
    bref: `Volibear est un deck **Corps/Furie** de **rampe** à grosses unités. Accessible et spectaculaire, c'est un bon deck pour qui aime accélérer et claquer des menaces démesurées.`,
    gagne: `Le plan tient en deux temps : accélérer, puis frapper fort. **[[Mobilize]]** et **[[Catalyst of Aeons]]** te donnent de l'avance sur l'énergie, et **[[Gentle Gemdragon]]** relance tes runes dès que tu poses un dragon. Tu déroules ensuite **[[Kadregrin the Infernal]]** et **[[Elder Dragon]]**, des finishers que personne ne bat en combat. **[[Sabotage]]** retire la réponse adverse avant qu'elle ne pose problème, et le plateau t'appartient.`,
    plan: `**Début de partie.** Accélère ton énergie avec tes sorts de rampe et tiens le coup face aux premières unités adverses.

**Milieu de partie.** **[[Gentle Gemdragon]]** lance la cascade de dragons et te permet de jouer tes menaces bien plus tôt que prévu.

**Fin de partie.** **[[Kadregrin the Infernal]]** et **[[Elder Dragon]]** verrouillent les combats. L'adversaire n'a pas les moyens de répondre, tu conquiers.`,
    cartes: `- **[[Volibear, Furious]]**, le Champion, qui porte la stratégie de rampe et de dragons.
- **[[Kadregrin the Infernal]]** et **[[Elder Dragon]]**, des finishers quasi imbattables en combat.
- **[[Gentle Gemdragon]]**, qui accélère dès que tu poses un dragon.
- **[[Mobilize]]** et **[[Catalyst of Aeons]]**, l'accélération qui fait tout démarrer.
- **[[Sabotage]]**, pour retirer la réponse adverse avant l'heure.`,
    forces: `**Ce qui rend le deck fort**
- Des dragons finisseurs presque imbattables au combat.
- L'accélération permet de jouer ses menaces bien avant l'adversaire.
- Un bon équilibre entre unités et sorts.

**Ce à quoi faire attention**
- Très peu d'équipements, donc presque aucune protection.
- Dépendant de la rampe : sans accélération, le deck est trop lent.`,
  },
  {
    slug: "meilleur-deck-master-yi-wuju-master",
    title: "Master Yi, Wuju Master : le pari de la montée en puissance",
    excerpt: "Master Yi, Wuju Master mise tout sur la Chasse et l'expérience : une fois certains paliers atteints, toute son armée devient surpuissante. Ambitieux, fragile, mais redoutable au bout.",
    tags: ["Unleashed", "Master Yi", "Hunt", "Guide"],
    legendName: "Master Yi, Wuju Master",
    art: ART("ed9af55066593b4ee738b9529b847f2f738078e0"),
    caption: "Master Yi, Wuju Master : Corps/Calme, le pari de la montée en puissance.",
    lead: `Attention, il y a deux Master Yi. Celui-ci, le Wuju Master, n'a rien à voir avec le Bladesman défensif : c'est un pari sur la montée en puissance. Tes unités chassent, le mot-clé Hunt, pour gagner de l'expérience, et une fois certains paliers franchis, toute ton armée devient surpuissante. C'est ambitieux, un peu fragile, mais redoutable si la machine arrive au bout.`,
    bref: `Master Yi, Wuju Master est un deck **Corps/Calme** de **montée en niveau** (Hunt), une variante de niche à ne pas confondre avec le Bladesman. Difficile et un peu casse-gueule, c'est un deck pour qui aime les plans à fort potentiel.`,
    gagne: `Tout repose sur l'expérience. Tes unités à Chasse, comme **[[Mosstomper]]** et **[[Master Yi, Tempered]]**, gagnent de l'XP en conquérant et en tenant les champs de bataille, et **[[Herald of Spring]]** en offre d'entrée. À mesure que tu montes en niveau, tes unités deviennent plus grosses, puis entrent prêtes : aux paliers les plus élevés, c'est toute ton armée qui frappe sans s'épuiser, un plateau tout simplement impossible à contenir. **[[Concentrate]]** repioche pour entretenir la pression.`,
    plan: `**Début de partie.** Déploie tes unités à Chasse et commence à accumuler de l'expérience en tenant les champs de bataille. Attention, tu n'as pas d'avantage immédiat : il faut survivre.

**Milieu de partie.** Atteins les premiers paliers : tes unités gagnent en puissance et deviennent plus dures à retirer.

**Fin de partie.** Au palier maximal, toute ton armée entre prête et renforcée. À ce stade, l'adversaire ne peut plus suivre le rythme.`,
    cartes: `- **[[Master Yi, Unstoppable]]**, le Champion, qui récompense la montée en niveau.
- **[[Master Yi, Tempered]]** et **[[Mosstomper]]**, des unités à Chasse qui montent vite en expérience.
- **[[Herald of Spring]]**, qui offre de l'expérience d'entrée.
- **[[Concentrate]]**, la pioche qui devient quasi gratuite à haut niveau.
- **[[Grim Resolve]]**, le bonus qui vole un combat le temps de monter.`,
    forces: `**Ce qui rend le deck fort**
- La récompense de palier maximal est l'une des plus puissantes du jeu.
- Les paliers intermédiaires rendent déjà tes unités plus résistantes.
- Un concept original et grisant autour de la Chasse.

**Ce à quoi faire attention**
- Aucun avantage en début de partie : un vrai handicap dans un méta de tempo.
- Le jeu regorge d'effets qui ignorent la taille des unités : la montée peut être annulée.`,
  },
];

function buildBlocks(c: Content) {
  const lists = topLists(c.legendName);
  const blocks: object[] = [
    { type: "text", id: "lead", content: `${c.lead}\n\n> 💡 Survole (ou touche, sur mobile) les noms de cartes surlignés pour voir la carte.` },
    { type: "text", id: "bref", content: `## Le deck en bref\n\n${c.bref}` },
    { type: "text", id: "gagne", content: `## Comment ce deck gagne\n\n${c.gagne}` },
    { type: "text", id: "plan", content: `## Le plan de jeu, tour par tour\n\n${c.plan}` },
    { type: "text", id: "cartes", content: `## Les cartes qui font le deck\n\n${c.cartes}` },
    { type: "text", id: "forces", content: `## Forces et limites\n\n${c.forces}` },
    { type: "separator", id: "sep" },
    { type: "text", id: "liste-intro", content: `## Les listes\n\n${lists.length > 1 ? "La version conseillée, suivie de ses variantes. Déplie celle que tu veux voir : chaque liste fait 64 cartes." : "La liste conseillée. Déplie-la pour voir les 64 cartes."}` },
  ];
  lists.forEach((d, i) => blocks.push({
    type: "decklist", id: `deck-${i}`, deckCode: deckCode(d),
    deckName: lists.length > 1 ? (LABELS[i] ?? `Variante ${i}`) : "Version de référence",
    legendName: c.legendName, collapsed: true,
  }));
  return { blocks, nLists: lists.length };
}

// Date de publication FIXE pour la création (déterministe). On NE remet PAS
// publishedAt dans la branche `update` : un regen ne doit jamais écraser la date
// de publication existante d'un article (sinon tout remonte en tête de liste).
const FICHE_PUBLISHED_AT = new Date("2026-06-24");

for (const c of CONTENT) {
  const { blocks, nLists } = buildBlocks(c);
  const cover = bannerUrl(c.legendName) ?? c.art;
  await prisma.article.upsert({
    where: { slug: c.slug },
    update: { title: c.title, excerpt: c.excerpt, tags: c.tags, blocks: blocks as object[], category: "meta", coverImage: cover, published: true },
    create: { slug: c.slug, title: c.title, excerpt: c.excerpt, tags: c.tags, blocks: blocks as object[], category: "meta", coverImage: cover, published: true, publishedAt: FICHE_PUBLISHED_AT },
  });
  console.log(`  ✅ ${c.slug} (${nLists} listes)`);
}
console.log(`\n${CONTENT.length} articles écrits à la main seedés.`);
await prisma.$disconnect();
