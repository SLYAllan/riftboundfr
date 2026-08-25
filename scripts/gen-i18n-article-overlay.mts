// Génère `src/lib/i18n-articles-en.ts` pour les titres et chapôs publiés, ainsi
// que les blocs de l'article « Streamer Riftbound avec un téléphone ».
//
// Le dictionnaire est indexé par le texte français LUI-MÊME : une clé recopiée à
// la main avec une apostrophe droite au lieu d'une courbe ne trouve rien et la
// phrase reste en français, sans erreur. Les clés sont donc relues depuis les
// blocs réellement enregistrés, jamais retapées. L'anglais, lui, est écrit ici,
// repéré par l'identifiant du bloc et le nom du champ.
//
// À relancer après toute retouche du texte français, sinon le passage modifié
// repasse en français sur /en.
//
//   npx tsx --env-file=.env scripts/gen-i18n-article-overlay.mts
import { writeFileSync } from "node:fs";
import { prisma } from "../src/lib/prisma";

const SLUG_OVERLAY = "streamer-riftbound-avec-un-telephone";

const TRADUCTIONS_ARTICLES: Record<string, { title: string; excerpt: string }> = {
  "streamer-riftbound-avec-un-telephone": {
    title: "How to stream a Riftbound game with a phone",
    excerpt: "One phone films the table, the players track points on a second device, and the overlay updates. Here is the gear and setup you need.",
  },
  "proving-grounds-quel-deck-monter": {
    title: "Proving Grounds: which deck should you build with Annie, Master Yi, Lux or Garen?",
    excerpt: "You opened the starter set and want to play in tournaments. For each of its four Legends, here is the best list that actually placed and what it requires.",
  },
  "best-of-national-open-s3": {
    title: "National Open S3 best decks - Every Legend",
    excerpt: "The best decklist for each Legend at National Open S3, the largest Unleashed tournament ever played: 2,048 players, 1,957 published lists and an Irelia mirror in the final.",
  },
  "best-of-hartford-rq": {
    title: "Hartford best decks - Every Legend",
    excerpt: "The best decklists for each Legend at the Hartford Regional Qualifier, the final Unleashed RQ. Factor won with Master Yi.",
  },
  "recap-hartford-rq-top8": {
    title: "Hartford RQ: Factor crowns Master Yi and avenges his Vancouver loss",
    excerpt: "At the final Regional Qualifier of the Unleashed format, Factor takes Master Yi to his first Western RQ title and gets revenge on bsweitz, who beat him in Vancouver. A recap of Hartford's Top 8.",
  },
  "best-of-utrecht-rq": {
    title: "Utrecht best decks - Every Legend",
    excerpt: "The best decklists for each Legend at the Utrecht Regional Qualifier, with more than 1,900 players. Squirtle won with Azir.",
  },
  "recap-utrecht-rq-top8": {
    title: "Utrecht RQ: Squirtle keeps his crown and makes history",
    excerpt: "Squirtle defends his European title with Azir and becomes Riftbound's second two-time Regional Qualifier champion. A recap of the most open Utrecht Top 8 yet.",
  },
  "best-of-changsha-ro": {
    title: "Changsha best decks - Every Legend",
    excerpt: "The best deck for each Legend at the Changsha Regional Open, with 640 players in the Unleashed set. 咕咕嘎嘎.阿门.Gambit won with Irelia.",
  },
  "best-of-tianjin-ro": {
    title: "Tianjin best decks - Every Legend",
    excerpt: "The best deck for each Legend at the Tianjin Regional Open, with 640 players in the Unleashed set. 陈千语 won with Master Yi.",
  },
  "best-of-vancouver-rq": {
    title: "Vancouver best decks - Every Legend",
    excerpt: "The best decklists for each Legend at the Vancouver Regional Qualifier, with more than 1,800 players. AlanZQ won with Diana.",
  },
  "recap-regional-qualifier-vancouver": {
    title: "Vancouver RQ: AlanZQ makes history with Diana",
    excerpt: "A recap of the Vancouver Regional Qualifier Top 8: AlanZQ becomes the first two-time champion with Diana, Sam D Sherman's surprise Rengar, decklists and meta analysis.",
  },
  "le-rift-tour-circuit-competitif-france": {
    title: "Le Rift Tour: France's first competitive Riftbound circuit",
    excerpt: "Riot Games launches Le Rift Tour, a three-stage national circuit taking French players from local stores to Paris Games Week, with two places at the 2026 European Regional Championship at stake.",
  },
  "best-of-atlanta-rq-2026": {
    title: "Atlanta best decks - Every Legend",
    excerpt: "The best decklists for each Legend at the 2026 Atlanta Regional Qualifier, with about 1,500 players. The final Spiritforged Regional.",
  },
  "top-8-atlanta-rq-2026": {
    title: "2026 Atlanta Regional Qualifier Top 8",
    excerpt: "The eight decklists from the 2026 Atlanta Regional Qualifier Top 8, the final Spiritforged Regional. Annie won and Draven finished second.",
  },
  "best-of-xian-regional-open-s3": {
    title: "Xi'an Regional Open S3 best decks",
    excerpt: "The best of Xi'an Regional Open S3: 640 players, 636 decklists and the Unleashed format. The largest competitive tournament in China.",
  },
  "best-of-sydney-rq-2026": {
    title: "Sydney best decks - Every Legend",
    excerpt: "The best decklists for each Legend at the 2026 Sydney Regional Qualifier, with 1,405 players.",
  },
  "top-8-sydney-rq-2026": {
    title: "2026 Sydney Regional Qualifier Top 8",
    excerpt: "The eight decklists from the 2026 Sydney Regional Qualifier Top 8, with 1,405 players in the Unleashed format. Irelia won.",
  },
  "top-8-lille-rq-2026": {
    title: "2026 Lille Regional Qualifier Top 8",
    excerpt: "The eight decklists from the 2026 Lille Regional Qualifier Top 8, with 1,949 players after the ban. Azir went undefeated at 14-0-2.",
  },
  "best-of-lille-rq-2026": {
    title: "2026 Lille RQ best decks",
    excerpt: "The best of the 2026 Lille Regional Qualifier: 1,949 players at the largest Spiritforged RQ. Undefeated Azir, dominant Irelia and spicy picks.",
  },
  "best-of-las-vegas-rq-2026": {
    title: "2026 Las Vegas RQ best decks",
    excerpt: "The best decklists from the 2026 Las Vegas Regional Qualifier, with 1,670 players. Draven locks up the Top 4, but the rebels hold out.",
  },
  "top-8-las-vegas-rq-2026": {
    title: "2026 Las Vegas Regional Qualifier Top 8",
    excerpt: "The eight decklists from the 2026 Las Vegas Regional Qualifier Top 8, with 1,670 players. Draven crushes the field: the entire Top 5 plays Draven.",
  },
  "best-of-bologna-rq-2026": {
    title: "2026 Bologna RQ best decks",
    excerpt: "The most creative decklists from the 2026 Bologna Regional Qualifier, with 1,719 players at the first Spiritforged RQ. Draven dominates, but the diversity is surprising.",
  },
  "top-8-bologna-rq-2026": {
    title: "2026 Bologna Regional Qualifier Top 8",
    excerpt: "The eight decklists from the 2026 Bologna Regional Qualifier Top 8, with 1,719 players in the Spiritforged format. Alanzq won with Ezreal.",
  },
  "best-of-houston-rq-2025": {
    title: "2025 Houston RQ best decks",
    excerpt: "A selection of the most interesting and surprising decklists from the 2025 Houston Regional Qualifier, with 1,347 players in the Origins format.",
  },
  "top-8-houston-rq-2025": {
    title: "2025 Houston Regional Qualifier Top 8",
    excerpt: "The eight decklists from the 2025 Houston Regional Qualifier Top 8, with 1,347 players in the Origins format. Annie dominates with four of the eight places.",
  },
};

type Bloc = { id: string; type: string; content?: string; alt?: string; caption?: string; title?: string; description?: string; ctaText?: string };

/** Anglais, par « identifiant de bloc . champ ». */
const EN: Record<string, string> = {
  "intro.content": `The site's overlay lets you stream a game with OBS. At a local tournament or a game with friends, a PC, a camera and a second screen quickly take up too much room.

This new version runs on two devices: a phone on a tripod films the table and displays the overlay; a tablet, or an old phone, sits between the players to track points. The players manage their match, the score updates on stream, and you can focus on the broadcast.`,

  "demo.caption":
    "The phone films the table while the players track their points on the tablet.",

  "compact.content": `## An overlay made for phones

The compact overlay keeps what viewers need to follow the game: the score, both Legends with their chosen champion, the battlefields, games won and the card on display. It removes the camera frames, layout, timer and event logo.

Its transparent background sits over the video without hiding the playmat. Text remains readable on a phone's small screen.`,

  "compact-partie.alt": "A game in progress seen from above, with the compact overlay laid over it.",
  "compact-partie.caption":
    "The score, Legends and battlefields remain visible during the game.",

  "compact-details.content": `You can start the scene before receiving the decklists. The card frame stays empty, then you paste each list while the players get ready.`,

  "compact-cartes.content": `During the game, one click shows a card from the decklist and a second hides it. Search also lets you show a card that is in neither deck. If nobody is running the broadcast, automatic mode cycles through the cards at the chosen speed.`,

  "compact-plateau.alt": "The empty table before the game starts, with both Legends and the score already on screen.",
  "compact-plateau.caption": "The viewer sees both decks before the game begins.",

  "compagnon.content": `## The match companion

Players open a link, with no account or app to install. They choose the format, the points needed to win, then their names, Legend, chosen champion and battlefield. After the recap, "Start the game" sends everything to the overlay.

The screen then splits lengthwise. Each player reads their half the right way up from their seat and changes their points with two large buttons.`,

  "compagnon-tablette.alt": "The match companion on a tablet lying flat between the two players, the screen split in two.",
  "compagnon-tablette.caption":
    "Each player tracks their points from their side of the table.",

  "compagnon-mecanique.content": `At the end of a game, players tap "End game", choose the winner and select the next battlefield. "Undo last game" fixes a mistake.

On your side, you can change the title or displayed card without changing the score entered by the players.`,

  "compagnon-securite.content": `Anyone with the companion link can change the score. Do not show this link on stream or leave it visible in a screenshot.`,

  "montage.content": `## Installing the overlay on your phone

It all starts on the **[Overlay](/profil/overlay)** page in your profile. Sign in with Discord, and keep these two links within reach:

| Link | What it is for |
|---|---|
| The compact overlay | The overlay to lay over your phone's picture |
| The companion link | The players' side, to send to them |

## Preparing the match on the site

The Overlay page controls the broadcast. Every change is saved and sent to the screen immediately: there is no Save button.

1. Open **Links and OBS display**, then copy the **compact overlay**. This is the address you will paste into Moblin.
2. Copy the **companion link**, then open it on the tablet placed between the players.
3. The players choose the format, points needed to win, their names, Legends, chosen champions and battlefields. As soon as they tap **Start the game**, the overlay receives these details.
4. To show cards, open **Cards on screen** in the dashboard. Paste one decklist for each player, tap **Load**, then choose the display. Tap a card to show it; **Auto slideshow** cycles through them.

You can correct a name, score or displayed card from the dashboard during the match. The companion and Overlay page update different parts of the screen, so players can keep tracking points while you make changes.

## With Moblin

[Moblin](https://apps.apple.com/app/moblin/id6466745933) is a free, open-source iPhone app. It films, streams to Twitch, YouTube or Kick, and can place a web page over the video.

The compact overlay loads in Moblin as a transparent Browser widget. Moblin receives a 1920 × 1080 web page, then scales it to the phone's video. Keep this size even if the iPhone screen uses a different resolution.

Setup takes six steps:

1. **Settings**, then **Scene widgets**, then **Create**.
2. Type **Browser**, and a name so you can find it again.
3. Paste the compact overlay link into the **URL** field.
4. Tick the scene that films the table.
5. In the widget settings, keep the width at **1920** and height at **1080** so the overlay does not stretch.
6. Check that the widget is switched on in the scene.

The video below shows all six steps. The app appears in English because it follows the phone's language.`,

  "moblin-video.caption":
    "The whole setup inside Moblin, from creating the widget to the overlay showing on the scene.",

  "irl-pro.content": `## On Android with IRL Pro

[IRL Pro](https://play.google.com/store/apps/details?id=app.irlpro.android) can add the overlay as a web page over the camera feed.

1. Open **Settings**, then **Overlays** and **Web Overlays**.
2. Tap **New web overlay**.
3. Name the overlay, then paste the compact overlay link into **URL**.
4. Under **WebView options**, set the width to **1920**, height to **1080**, and scale to **100%**.
5. Return to the camera and check that the overlay appears before going live.`,
  "irl-pro-video.caption":
    "Adding the compact overlay in IRL Pro, then checking it on the camera feed.",

  "prism-live.content": `## On Android with PRISM Live Studio

[PRISM Live Studio](https://play.google.com/store/apps/details?id=com.prism.live) can also add a web page to the scene.

1. Open **My Studio** from the camera screen.
2. Tap **Web**.
3. Paste the compact overlay link into **URL**, add a title, then tap **Save**.
4. Fit the overlay to the full frame in the editor.
5. Close the editor and check the camera view before going live.`,
  "prism-live-video.caption":
    "Adding the compact overlay in PRISM Live Studio and fitting it to the frame.",


  "moblin-telephone.alt": "An iPhone on a small tripod, filming the playmat with the compact overlay already in place.",
  "moblin-telephone.caption": "On the camera side, the setup fits into a phone and a tripod.",

  "materiel.content": `## Choosing a mount

To keep the picture steady for the whole game, place the phone on a tripod or an arm clamped to the table. **Neither of these links is sponsored**: I earn nothing from sales and prices may change.`,

  "materiel-1.content": `### On the table, beside the playmat

This small tripod films at an angle from the edge of the playmat and fits in a bag pocket. You need to add a phone clamp: the model has a camera screw, not a cradle.`,

  "lien-pixi.title": "Manfrotto PIXI, tabletop tripod",
  "lien-pixi.description": "A small tripod to place beside the playmat.",

  "materiel-2.content": `### Above the playmat

A top-down view shows the game better, but requires suspending the phone without getting in the players' way. This articulated arm clamps to the table edge and holds an iPhone with a MagSafe magnet. It includes a magnetic ring for other phones.`,

  "lien-ugreen.title": "UGREEN, magnetic articulated arm",
  "lien-ugreen.description": "Clamps to the table edge, holds the phone by magnet.",

  "lien.cta": "See on Amazon",
};

/** Champs traduits d'un bloc, dans l'ordre où le rendu les lit. */
const CHAMPS = ["content", "alt", "caption", "title", "description"] as const;

async function main() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { slug: "asc" },
    select: { slug: true, title: true, excerpt: true },
  });
  const paires: [string, string][] = [];
  const articlesManquants: string[] = [];
  for (const article of articles) {
    const traduction = TRADUCTIONS_ARTICLES[article.slug];
    if (!traduction?.title || (article.excerpt && !traduction.excerpt)) {
      articlesManquants.push(article.slug);
      continue;
    }
    paires.push([article.title, traduction.title]);
    if (article.excerpt) paires.push([article.excerpt, traduction.excerpt]);
  }
  if (articlesManquants.length) {
    throw new Error(`traduction d’article manquante : ${articlesManquants.join(", ")}`);
  }

  const articleOverlay = await prisma.article.findUnique({
    where: { slug: SLUG_OVERLAY },
    select: { blocks: true },
  });
  if (!articleOverlay) throw new Error(`article absent de la base : ${SLUG_OVERLAY}. Lancer d'abord seed-article-overlay-compagnon.mts`);

  const manquants: string[] = [];
  for (const bloc of articleOverlay.blocks as unknown as Bloc[]) {
    for (const champ of CHAMPS) {
      const fr = bloc[champ];
      if (typeof fr !== "string" || !fr.trim()) continue;
      const en = EN[`${bloc.id}.${champ}`];
      if (!en) {
        manquants.push(`${bloc.id}.${champ}`);
        continue;
      }
      paires.push([fr, en]);
    }
    // Les liens de matériel partagent le même libellé de bouton.
    if (bloc.type === "sponsor_link" && bloc.ctaText) paires.push([bloc.ctaText, EN["lien.cta"]]);
  }
  if (manquants.length) throw new Error(`traduction de bloc manquante : ${manquants.join(", ")}`);

  // Doublons : le libellé du bouton revient à chaque lien. Le fichier ne doit pas
  // porter deux fois la même clé, TypeScript s'en plaint.
  const uniques = new Map(paires);

  const corps = [...uniques]
    .map(([fr, en]) => `  ${JSON.stringify(fr)}:\n    ${JSON.stringify(en)},`)
    .join("\n");

  const fichier = `/**
 * Traductions anglaises des ARTICLES, indexées par le texte français d'origine.
 *
 * Séparé de \`i18n-en.ts\`, qui porte les phrases de l'interface : la prose d'un
 * article se compte en milliers de caractères et noierait le reste. Le mécanisme
 * est le même, une phrase absente reste en français.
 *
 * Fichier ENGENDRÉ, ne pas modifier à la main : les clés sont relues depuis les
 * blocs en base pour qu'elles correspondent au caractère près. L'anglais s'écrit
 * dans \`scripts/gen-i18n-article-overlay.mts\`, puis on relance ce script.
 */
export const EN_ARTICLES: Record<string, string> = {
${corps}
};
`;

  writeFileSync("src/lib/i18n-articles-en.ts", fichier, "utf8");
  console.log(`src/lib/i18n-articles-en.ts écrit : ${uniques.size} phrases.`);
}

main().finally(() => prisma.$disconnect());
