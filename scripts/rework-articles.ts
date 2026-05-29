/**
 * Rework all 13 published articles to improve writing quality.
 *
 * What it does:
 *  - Fetches all published articles from the local PostgreSQL DB
 *  - Rewrites text blocks: removes dash/bullet-point lists, replaces them
 *    with natural, engaging French paragraphs
 *  - For tournament articles: expands intros with event context
 *  - Rewrites generic deck comments ("Meilleur deck X du tournoi")
 *    with more engaging editorial text
 *  - Previews every change before applying (--apply flag to commit)
 *
 * Usage:
 *   npx tsx scripts/rework-articles.ts           # dry-run, shows diff
 *   npx tsx scripts/rework-articles.ts --apply   # actually updates DB
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DRY_RUN = !process.argv.includes("--apply");

// ────────────────────────────────────────────────────────────────────
// Rewritten intro texts per article slug.
// These replace the FIRST text block of each article.
// ────────────────────────────────────────────────────────────────────

const REWRITTEN_INTROS: Record<string, string> = {

  // ═══════════════════════════════════════════════════════════════
  //  TOP 8 ARTICLES
  // ═══════════════════════════════════════════════════════════════

  "top-8-houston-rq-2025": `Le **Top 8 du Regional Qualifier de Houston** clôture la saison Origins avec 1 347 joueurs réunis au Texas en décembre 2025.

**Annie, Dark Child** écrase la concurrence avec une performance historique : quatre places dans le Top 8, dont la victoire de **Dhawally**. Aucune autre légende n'avait jamais monopolisé la moitié d'un Top 8 de Regional. Son archétype Chaos/Fury s'est révélé redoutable face au field, avec un taux de conversion largement supérieur à sa représentation dans le tournoi (18% du field, 50% du Top 8).

**Master Yi** et **Kai'Sa** complètent le podium. Kai'Sa était pourtant la légende la plus jouée du tournoi avec près de 30% du field, mais elle peine à convertir au sommet. Master Yi Body/Calm, en revanche, confirme son statut de contrepoids défensif idéal face à l'agression d'Annie. Le duo Chaos/Fury représente la moitié du Top 8, signant la fin d'une saison Origins marquée par la domination de l'archétype agressif.`,

  "top-8-bologna-rq-2026": `Le **Top 8 du Regional Qualifier de Bologne** marque l'entrée dans l'ère Spiritforged avec 1 719 joueurs. À ce jour, c'est le plus gros tournoi Riftbound occidental jamais organisé.

La victoire revient à **Ezreal, Prodigal Explorer**, pilotée par **Alanzq**. Un résultat que personne n'avait vu venir : seulement 7 Ezreal dans tout le tournoi, et c'est lui qui s'empare du titre. Son contrôle Chaos/Mind s'est avéré parfaitement positionné pour punir un field trop centré sur l'agression. En finale, **Miss Fortune** de Sebiq confirme la viabilité de l'archétype Aurora en Body/Chaos.

Draven reste le roi du méta avec 14% du field et 3 places en Top 8, mais il ne parvient pas à décrocher le titre. Cinq légendes différentes se partagent le Top 8, signe que Spiritforged apporte une diversité bienvenue. Le fait que Chaos apparaisse dans 7 decks sur 8 reste toutefois révélateur : le domaine domine sans conteste le format naissant. Viktor en 4e place signe le meilleur résultat du contrôle Mind/Order en Regional.`,

  "top-8-las-vegas-rq-2026": `Le **Top 8 du Regional Qualifier de Las Vegas** restera dans les mémoires comme le tournoi le plus dominé de l'histoire de Riftbound. 1 670 joueurs, format Spiritforged, et un constat implacable : **Draven** verrouille les cinq premières places.

**Samdsherman** s'empare du titre, mais la vraie histoire est collective. Les cinq premiers sont tous Draven Chaos/Fury. Du jamais vu. L'Exécuteur Glorieux représentait 18% du field (24 decklists publiées sur 129 en Top 128), affichait un win rate global de 62,4%, et convertissait à un taux obscène au sommet du bracket.

Il faut descendre à la 6e place pour trouver une autre légende : **Irelia** en Calm/Chaos, suivie de **Jax** en Body/Calm et **Ezreal** d'Alanzq (de retour après sa victoire à Bologne). Ce résultat extrême provoque un séisme dans la communauté et mène directement aux 7 bans d'avril 2026, ciblant les builds Miracle/Detonate qui rendaient Draven inarrêtable.`,

  "top-8-lille-rq-2026": `Le **Top 8 du Regional Qualifier de Lille** est un tournoi à part. 1 949 joueurs, le plus gros RQ Spiritforged jamais organisé, et le premier Regional en France. Le tournoi se déroule juste après les 7 bans d'avril, qui visaient à briser la domination de Draven.

Mission accomplie. **Azir, Emperor of the Sands** s'empare du titre grâce à **Pedro B (Squirtle)**, invaincu avec un record de **14-0-2**. Une performance légendaire avec l'archétype Equipment Tokens en Calm/Order. Azir n'était joué que par 2 personnes dans tout le tournoi, ce qui rend cette victoire encore plus remarquable.

La diversité est de retour : cinq légendes différentes en Top 8. **Irelia** envahit le bracket avec 3 places (5e, 6e et 7e) sans jamais franchir le cap des demi-finales. **Master Yi** confirme sa montée en puissance post-ban avec une place de finaliste et une 8e place. **Draven** s'accroche en 3e place (CTCG DZiden) malgré les bans. Et **Annie** de Prismaticismism en 4e annonce déjà sa future victoire à Atlanta la semaine suivante.`,

  "top-8-atlanta-rq-2026": `Le **Top 8 du Regional Qualifier d'Atlanta** conclut la saison Spiritforged avec environ 1 500 joueurs.

**Annie, Dark Child** s'impose grâce à **Prismaticismism**, qui signe un record impressionnant de **14-1-1**. C'est sa deuxième victoire en Regional après Nanjing. Son archétype Fury/Chaos a dominé un bracket pourtant relevé. En finale, **Draven** de CTCG Koko Lopez (13-1-2) confirme une nouvelle fois sa place de légende la plus jouée à chaque phase du tournoi.

Le duo Fury/Chaos monopolise le sommet, fidèle à l'identité du format Spiritforged. Quatre des six légendes du Top 8 appartiennent à ces domaines. La surprise vient de **Sett** en Body/Order, qui se hisse en Top 8 malgré un win rate global de seulement 44% dans le tournoi. La preuve qu'un excellent pilote peut transcender les statistiques. Trois Draven figurent dans le Top 8 (2e, 8e, plus un éliminé en quarts), confirmant son omniprésence.`,

  "top-8-sydney-rq-2026": `Le **Top 8 du Regional Qualifier de Sydney** ouvre l'ère Unleashed avec 1 405 joueurs rassemblés en Australie.

**Irelia, Blade Dancer** remporte le titre grâce à **EDG Rico1997**, confirmant la domination du tempo réactif Calm/Chaos dans ce nouveau format. La méta de Sydney se distingue par une grande diversité : six légendes différentes en Top 8, un contraste saisissant avec la monotonie de l'ère Las Vegas.

**Chaos** reste le domaine roi avec une présence dans 7 decks sur 8. Irelia et Vex portent le flambeau du Calm/Chaos, tandis que Diana apparaît deux fois (3e et 8e), seul doublon du Top 8. **LeBlanc** en Mind/Order représente l'archétype Deathknell Engine, et **Master Yi** en Calm/Body défend les archetypes Hold/Midrange en solitaire. Ce Top 8 dessine les contours d'un format Unleashed où le tempo et la réactivité sont rois.`,

  // ═══════════════════════════════════════════════════════════════
  //  BEST-OF ARTICLES (from seed-bestof-articles.ts)
  // ═══════════════════════════════════════════════════════════════

  "best-of-houston-rq-2025": `Le Regional Qualifier de Houston (décembre 2025) réunissait 1 347 joueurs en format Origins. Annie a dominé le Top 8 avec quatre places, mais le tournoi regorgeait de decklists créatives et audacieuses bien au-delà du classement final.

Nous avons sélectionné les builds les plus remarquables du tournoi : des vainqueurs incontestés aux one-of héroïques, en passant par les archétypes de niche qui ont surpris le field. Chaque deck raconte une histoire, celle d'un joueur qui a osé sortir des sentiers battus ou qui a perfectionné un archétype jusqu'à l'excellence.`,

  "best-of-bologna-rq-2026": `Bologne (février 2026) marque le premier Regional Qualifier du set Spiritforged avec 1 719 joueurs. Draven Chaos/Fury dominait le méta avec 14% du field, mais c'est Ezreal qui a créé la surprise en remportant le titre.

Au-delà du classement, ce tournoi a révélé des builders audacieux et des choix de légendes inattendus. Des one-of comme Ornn et Azir côtoient des archétypes émergents comme Rek'Sai et Renata Glasc. Voici les decks qui méritent votre attention.`,

  "best-of-las-vegas-rq-2026": `Las Vegas (mars 2026) est LE tournoi de Draven. 18% du field, un Top 4 intégralement Draven, cinq places dans le Top 8. La domination est totale et incontestée.

Mais au-delà de cette hégémonie, des builders courageux ont refusé de plier. Jax, Ezreal et Irelia ont brisé le mur Draven pour se hisser en Top 8. D'autres légendes comme Azir et Ornn préparaient déjà leur ascension future. Voici les rebelles de Vegas, ceux qui ont trouvé des angles d'attaque alternatifs dans un méta apparemment verrouillé.`,

  "best-of-lille-rq-2026": `Lille (avril 2026) accueille le plus gros Regional Qualifier Spiritforged avec 1 949 joueurs, et c'est le tout premier RQ en France. Azir remporte le titre invaincu, Irelia domine le Top 8, et le méta retrouve enfin de la diversité après l'ère Draven.

Des légendes rares comme Yasuo et Sett sont venues en one-of, des archétypes comme Fiora et Lucian ont signé des résultats solides. Ce tournoi historique a produit des decklists pour tous les goûts. Voici celles qui ont marqué l'événement.`,

  "best-of-xian-regional-open-s3": `Le Xi'an Regional Open S3 (mai 2026) est le plus gros tournoi Unleashed avec 640 joueurs et 636 decklists publiées. Irelia domine la représentation (68 copies) devant Master Yi (54) et Diana (36).

La scène compétitive chinoise apporte une perspective unique sur le méta Unleashed, avec des choix de construction parfois très différents de la scène occidentale. Voici le meilleur deck de chaque légende présente au tournoi, du champion au plus courageux des one-of.`,

  // ═══════════════════════════════════════════════════════════════
  //  BEST-OF "ALL LEGENDS" ARTICLES (Sydney, Atlanta)
  // ═══════════════════════════════════════════════════════════════

  "best-of-sydney-rq-2026": `## Best of Sydney — Regional Qualifier 2026

Le **Regional Qualifier de Sydney** s'est tenu le **16 mai 2026** avec **1 405 joueurs** en format Unleashed. L'événement a offert une méta riche et diversifiée, avec 40 légendes différentes jouées sur l'ensemble du tournoi.

Pour chaque légende, nous avons sélectionné la liste qui a obtenu le meilleur classement. Les decks sont organisés par tier selon notre analyse méta post-Sydney, du Tier 1 (les gagnants de tournoi) au Tier 5 (les outsiders courageux qui ont osé défier le méta).`,

  "best-of-atlanta-rq-2026": `Le **Atlanta Regional Qualifier** a rassemblé environ **1 500 joueurs** le 29 avril 2026, concluant la saison Spiritforged. Annie s'est imposée (14-1-1) pour sa deuxième victoire en Regional après Nanjing. Draven finaliste (13-1-2) a confirmé son statut de légende la plus jouée en Day 1, Day 2 et Top 8.

Le duo **Chaos/Fury** a dominé toute l'ère Spiritforged : Draven (3 titres) et Annie (2 titres) se partagent cinq victoires sur neuf Regionals. Ce format restera dans les mémoires comme l'un des plus polarisés de l'histoire compétitive.

Voici les **28 meilleures decklists** du tournoi, une par légende, au meilleur classement.`,
};

// ────────────────────────────────────────────────────────────────────
// Rewritten deck header blocks for top-8 articles
// ────────────────────────────────────────────────────────────────────

interface DeckHeaderRewrite {
  blockIdPattern: RegExp;
  content: string;
}

const TOP8_DECK_HEADERS: Record<string, DeckHeaderRewrite[]> = {

  "top-8-houston-rq-2025": [
    {
      blockIdPattern: /^header-0$/,
      content: `### 1er — Annie, Dark Child\n**Dhawally** — Chaos/Fury\n\nAnnie Chaos/Fury sous sa forme la plus aboutie. Dhawally décroche le titre avec un gameplan agressif implacable qui a balayé tout le bracket. Quatre Annie en Top 8, et c'est lui qui porte la couronne.`,
    },
    {
      blockIdPattern: /^header-1$/,
      content: `### 2e — Master Yi, Wuju Bladesman\n**Challenger TCG** — Body/Calm\n\nFinaliste avec le Wuju Bladesman, Challenger TCG incarne le contrepoids défensif du format Origins. Master Yi Body/Calm parie sur la résilience et les retournements tardifs, un profil idéal pour survivre aux vagues d'agression d'Annie.`,
    },
    {
      blockIdPattern: /^header-2$/,
      content: `### 3e — Annie, Dark Child\n**Zent** — Chaos/Fury\n\nDeuxième Annie du Top 8. La Dark Child est partout à Houston, prouvant que l'archétype n'est pas un coup de chance mais bien le meilleur deck du format.`,
    },
    {
      blockIdPattern: /^header-3$/,
      content: `### 4e — Annie, Dark Child\n**Prymor** — Chaos/Fury\n\nTroisième Annie consécutive dans le classement. Quand 18% du field produit 50% du Top 8, l'archétype possède un avantage structurel majeur sur le reste du méta.`,
    },
    {
      blockIdPattern: /^header-4$/,
      content: `### 5e — Kai'Sa, Daughter of the Void\n**Mateusz Jasiński** — Fury/Mind\n\nKai'Sa était la légende la plus jouée du tournoi (30% du field) mais peine à convertir au sommet. Cette 5e place reste le meilleur résultat de la Fille du Void à Houston.`,
    },
    {
      blockIdPattern: /^header-5$/,
      content: `### 6e — Master Yi, Wuju Bladesman\n**Clyde** — Body/Calm\n\nDeuxième Master Yi du Top 8. Le Wuju Bladesman confirme son statut de pilier défensif du format Origins, capable de tenir tête aux légendes agressives les plus populaires.`,
    },
    {
      blockIdPattern: /^header-6$/,
      content: `### 7e — Kai'Sa, Daughter of the Void\n**GEORGEG** — Fury/Mind\n\nDeuxième Kai'Sa en Top 8. Malgré sa popularité massive dans le field, la Fille du Void reste sous-représentée au sommet par rapport à Annie, qui convertit bien mieux.`,
    },
    {
      blockIdPattern: /^header-7$/,
      content: `### 8e — Annie, Dark Child\n**Diego "NoVeggies"** — Chaos/Fury\n\nQuatrième et dernière Annie du Top 8 de Houston. Un record historique qui ne sera probablement jamais battu. La Dark Child a écrit l'histoire du format Origins en lettres de feu.`,
    },
  ],

  "top-8-bologna-rq-2026": [
    {
      blockIdPattern: /^header-0$/,
      content: `### 1er — Ezreal, Prodigal Explorer\n**Alanzq1** — Chaos/Mind\n\nAlanzq crée la surprise en remportant le plus gros tournoi occidental avec Ezreal Chaos/Mind, une légende que personne n'attendait au sommet. Seulement 7 Ezreal dans le field, et c'est lui qui rafle tout. Le skill fait la différence.`,
    },
    {
      blockIdPattern: /^header-1$/,
      content: `### 2e — Miss Fortune, Bounty Hunter\n**Sebiqqqqqqqqqqqq** — Body/Chaos\n\nL'unique Miss Fortune du tournoi... et elle se hisse en finale. Sebiq défie les pronostics avec un archétype Aurora en Body/Chaos que personne n'avait dans son radar. Un exploit retentissant.`,
    },
    {
      blockIdPattern: /^header-2$/,
      content: `### 3e — Irelia, Blade Dancer\n**Krowz** — Calm/Chaos\n\nKrowz emmène Irelia Calm/Chaos sur le podium. La Blade Dancer profite de la transition vers Spiritforged pour s'imposer comme une force majeure du format, exploitant sa mobilité pour contourner les plans de jeu linéaires.`,
    },
    {
      blockIdPattern: /^header-3$/,
      content: `### 4e — Viktor, Herald of the Arcane\n**Ghosterdriver** — Mind/Order\n\nViktor signe le meilleur résultat du contrôle Mind/Order en Regional. Ghosterdriver pilote un archétype patient qui grind les matchups de valeur, prouvant que le tempo n'est pas la seule voie vers le succès.`,
    },
    {
      blockIdPattern: /^header-4$/,
      content: `### 5e — Draven, Glorious Executioner\n**Prismaticism** — Chaos/Fury\n\nPremier des trois Draven du Top 8. L'archétype Fury/Chaos produit des résultats constants, même s'il ne parvient pas à décrocher le titre face aux stratégies plus créatives d'Alanzq et Sebiq.`,
    },
    {
      blockIdPattern: /^header-5$/,
      content: `### 6e — Draven, Glorious Executioner\n**Randyyy** — Chaos/Fury\n\nDeuxième Draven. L'Exécuteur domine le field avec 14% de représentation mais laisse la victoire à d'autres. La force brute ne suffit pas toujours.`,
    },
    {
      blockIdPattern: /^header-6$/,
      content: `### 7e — Draven, Glorious Executioner\n**M4rcus99** — Chaos/Fury\n\nTroisième et dernier Draven du Top 8. Sa présence massive confirme que Fury/Chaos reste l'archétype de référence du format, même quand il ne gagne pas.`,
    },
    {
      blockIdPattern: /^header-7$/,
      content: `### 8e — Ezreal, Prodigal Explorer\n**TheManLandRft** — Chaos/Mind\n\nDeuxième Ezreal du Top 8, confirmant que l'archétype Chaos/Mind n'est pas un coup d'éclat isolé. La légende a trouvé sa place dans le méta Spiritforged.`,
    },
  ],

  "top-8-las-vegas-rq-2026": [
    {
      blockIdPattern: /^header-0$/,
      content: `### 1er — Draven, Glorious Executioner\n**Samdsherman** — Chaos/Fury\n\nSamdsherman prend la couronne de Vegas. Mais l'histoire du jour, c'est le quinté Draven qui occupe les cinq premières places. Un niveau de domination sans précédent dans l'histoire compétitive de Riftbound.`,
    },
    {
      blockIdPattern: /^header-1$/,
      content: `### 2e — Draven, Glorious Executioner\n**TTA** — Chaos/Fury\n\nDeuxième Draven consécutif. L'archétype Miracle/Detonate en Chaos/Fury ne laisse aucune chance au reste du field. La mécanique est trop efficace, et tout le monde le sait.`,
    },
    {
      blockIdPattern: /^header-2$/,
      content: `### 3e — Draven, Glorious Executioner\n**Collin** — Chaos/Fury\n\nTroisième Draven. Le méta de Vegas n'est plus un jeu de construction mais un jeu de miroir : c'est celui qui pilote le mieux Draven qui gagne.`,
    },
    {
      blockIdPattern: /^header-3$/,
      content: `### 4e — Draven, Glorious Executioner\n**Shizzle** — Chaos/Fury\n\nQuatrième Draven. À ce stade, le constat est implacable : toute légende qui n'est pas Draven part avec un handicap structurel dans le format.`,
    },
    {
      blockIdPattern: /^header-4$/,
      content: `### 5e — Draven, Glorious Executioner\n**Prismaticismism** — Chaos/Fury\n\nCinquième et dernier Draven du Top 5 intégralement Draven. Ce résultat historique provoque un tollé dans la communauté et mènera directement aux 7 bans d'avril 2026.`,
    },
    {
      blockIdPattern: /^header-5$/,
      content: `### 6e — Irelia, Blade Dancer\n**DeluxePhilCheeze** — Calm/Chaos\n\nPremière non-Draven du classement. Irelia Calm/Chaos exploite sa mobilité et son tempo réactif pour survivre dans un méta hostile. Un résultat courageux qui montre que des alternatives existent.`,
    },
    {
      blockIdPattern: /^header-6$/,
      content: `### 7e — Jax, Grandmaster at Arms\n**Theverybestgamer** — Body/Calm\n\nJax brise le mur Draven avec l'un des 3 seuls Jax du tournoi. Le Grandmaster at Arms en Body/Calm prouve que la résilience peut tenir tête à l'explosion.`,
    },
    {
      blockIdPattern: /^header-7$/,
      content: `### 8e — Ezreal, Prodigal Explorer\n**Alanzq1** — Chaos/Mind\n\nAlanzq de retour en Top 8 après sa victoire à Bologne. L'Explorateur Prodige reste une option viable pour les joueurs de contrôle, même face à la machine Draven.`,
    },
  ],

  "top-8-lille-rq-2026": [
    {
      blockIdPattern: /^header-0$/,
      content: `### 1er — Azir, Emperor of the Sands\n**Pedro B** — Calm/Order\n\nSquirtle remporte Lille invaincu avec un record de 14-0-2. Seulement 2 Azir dans tout le tournoi, et il décroche le titre. L'archétype Equipment Tokens en Calm/Order est parfaitement positionné dans le méta post-ban. Une masterclass absolue.`,
    },
    {
      blockIdPattern: /^header-1$/,
      content: `### 2e — Master Yi, Wuju Bladesman\n**Sean B** — Body/Calm\n\nSean B emmène Master Yi en finale, confirmant la montée en puissance du Wuju Bladesman après les bans. Son gameplan résilient Body/Calm a traversé tout le bracket avant de céder face à Azir.`,
    },
    {
      blockIdPattern: /^header-2$/,
      content: `### 3e — Draven, Glorious Executioner\n**Daniel Z** — Chaos/Fury\n\nDraven s'accroche en 3e place malgré les 7 bans qui ciblaient directement ses builds. L'Exécuteur Glorieux refuse de mourir. DZiden prouve que la légende reste dangereuse même affaiblie.`,
    },
    {
      blockIdPattern: /^header-3$/,
      content: `### 4e — Annie, Dark Child\n**Kyle B** — Chaos/Fury\n\nAnnie en 4e à Lille, un avant-goût de ce qui vient. Ce joueur (Prismaticismism) remportera Atlanta la semaine suivante avec exactement cette approche Chaos/Fury. La Dark Child prépare son retour au sommet.`,
    },
    {
      blockIdPattern: /^header-4$/,
      content: `### 5e — Irelia, Blade Dancer\n**Jonathan T** — Calm/Chaos\n\nPremière des trois Irelia du Top 8. La Blade Dancer envahit le bracket post-ban mais ne parvient pas à atteindre les demi-finales. Dominante en volume, pas en résultat final.`,
    },
    {
      blockIdPattern: /^header-5$/,
      content: `### 6e — Irelia, Blade Dancer\n**Alex Shans** — Calm/Chaos\n\nDeuxième Irelia. Calm/Chaos s'impose comme le duo dominant de Lille, et Irelia en est le principal vecteur. Trois places en Top 8 confirment la légende comme incontournable post-ban.`,
    },
    {
      blockIdPattern: /^header-6$/,
      content: `### 7e — Irelia, Blade Dancer\n**Martin S** — Calm/Chaos\n\nTroisième Irelia en Top 8. La Blade Dancer est la légende la plus représentée au sommet de Lille, même si elle laisse les trophées à Azir et Master Yi.`,
    },
    {
      blockIdPattern: /^header-7$/,
      content: `### 8e — Master Yi, Wuju Bladesman\n**Bartosz W** — Body/Calm\n\nDeuxième Master Yi du Top 8. Le Wuju Bladesman est omniprésent à Lille, confirmant que les bans ont redistribué les cartes en sa faveur.`,
    },
  ],

  "top-8-atlanta-rq-2026": [
    {
      blockIdPattern: /^header-0$/,
      content: `### 1er — Annie, Dark Child\n**Prismaticismism** (14-1-1) — Fury/Chaos\n\nPrismaticismism décroche sa deuxième victoire en Regional. Son Annie Fury/Chaos est un bijou d'efficacité agressive, capable de mettre une pression constante dès les premiers tours. Le record de 14-1-1 parle de lui-même.`,
    },
    {
      blockIdPattern: /^header-1$/,
      content: `### 2e — Draven, Glorious Executioner\n**CTCG Koko Lopez** (13-1-2) — Fury/Chaos\n\nKoko Lopez emmène Draven en finale avec un record quasi parfait de 13-1-2. L'Exécuteur Glorieux reste la légende la plus jouée à chaque phase du tournoi, fidèle à sa réputation de choix le plus sûr du format.`,
    },
    {
      blockIdPattern: /^header-2$/,
      content: `### 3e-4e — Irelia, Blade Dancer\n**HaruKaze** (12-2-1) — Calm/Chaos\n\nHaruKaze pilote Irelia Calm/Chaos en demi-finale avec une construction ultra-technique. La Blade Dancer continue de briller comme le meilleur archétype réactif du format, capable de punir les lignes de jeu prévisibles.`,
    },
    {
      blockIdPattern: /^header-3$/,
      content: `### 3e-4e — Ezreal, Prodigal Explorer\n**CTG Alanzq** (12-2-1) — Chaos/Mind\n\nAlanzq, déjà champion à Bologne, s'offre un troisième Top 8 consécutif en Regional. Son Ezreal Chaos/Mind est devenu une signature, et personne ne semble capable de le contrer de manière fiable.`,
    },
    {
      blockIdPattern: /^header-4$/,
      content: `### 5e-8e — Kai'Sa, Daughter of the Void\n**Frosty** (11-2-1) — Fury/Mind\n\nKai'Sa Fury/Mind revient sur le devant de la scène à Atlanta. Frosty construit un archétype hybride qui mélange agression physique et contrôle mental, un profil adaptable qui brille dans les formats variés.`,
    },
    {
      blockIdPattern: /^header-5$/,
      content: `### 5e-8e — Sett, The Boss\n**CTCG Collin K** (11-2-1) — Body/Order\n\nLa surprise du Top 8. Sett affichait un win rate global de seulement 44% dans le tournoi, mais Collin K transcende les statistiques avec un pilotage impeccable. La preuve que le joueur compte autant que le deck.`,
    },
    {
      blockIdPattern: /^header-6$/,
      content: `### 5e-8e — Draven, Glorious Executioner\n**StarDust** (11-2-1) — Fury/Chaos\n\nTroisième Draven du Top 8 d'Atlanta (en comptant un éliminé en quarts). L'Exécuteur ne lâche rien et reste la valeur sûre du format Spiritforged, du premier tour jusqu'au dernier Regional.`,
    },
  ],

  "top-8-sydney-rq-2026": [
    {
      blockIdPattern: /^header-0$/,
      content: `### 1er — Irelia, Blade Dancer\n**EDG Rico1997** — Calm/Chaos\n\nEDG Rico1997 s'impose avec Irelia Calm/Chaos. La Blade Dancer excelle dans le tempo réactif, enchaînant les actions défensives et offensives avec une fluidité qui ne laisse aucun répit à l'adversaire. Un choix parfait pour ouvrir l'ère Unleashed.`,
    },
    {
      blockIdPattern: /^header-1$/,
      content: `### 2e — Sivir, Battle Mistress\n**TSS SouledOut** — Body/Chaos\n\nSivir en Body/Chaos s'offre une place de finaliste avec un archétype Aurora centré sur le ramp et les finisseurs massifs. SouledOut construit un deck patient qui monte en puissance jusqu'à devenir inarrêtable.`,
    },
    {
      blockIdPattern: /^header-2$/,
      content: `### 3e — Diana, Scorn of the Moon\n**nice boy** — Chaos/Mind\n\nDiana Chaos/Mind brille à Sydney avec un archétype de tempo nocturne qui exploite les synergies entre Moonfall et les unités évasives. Nice boy décroche la 3e place avec une construction minutieuse.`,
    },
    {
      blockIdPattern: /^header-3$/,
      content: `### 4e — Vex, Gloomist\n**EEP Bonk Repeat** — Calm/Chaos\n\nVex Calm/Chaos apporte une dimension contrôle inhabituelle au Top 4. Bonk Repeat exploite le côté défensif de la Gloomist pour neutraliser les menaces adverses avant de frapper avec des finisseurs furtifs.`,
    },
    {
      blockIdPattern: /^header-4$/,
      content: `### 5e — Master Yi, Wuju Bladesman\n**Exordium** — Calm/Body\n\nMaster Yi Calm/Body défend l'honneur des archetypes Hold/Midrange en solitaire à Sydney. Exordium mise sur la résilience et les retournements pour surmonter les matchups agressifs.`,
    },
    {
      blockIdPattern: /^header-5$/,
      content: `### 6e — Teemo, Swift Scout\n**AshenOCE** — Mind/Chaos\n\nTeemo Mind/Chaos apporte une touche d'originalité au Top 8 avec un archétype Sprite/Nocturne qui empoisonne le board adverse. AshenOCE prouve que le petit yordle a sa place au plus haut niveau.`,
    },
    {
      blockIdPattern: /^header-6$/,
      content: `### 7e — LeBlanc, Deceiver\n**DarkMagician** — Mind/Order\n\nLeBlanc Mind/Order représente l'archétype Deathknell Engine à Sydney. DarkMagician pilote un contrôle méthodique qui accumule de la valeur tour après tour jusqu'à étouffer l'adversaire.`,
    },
    {
      blockIdPattern: /^header-7$/,
      content: `### 8e — Diana, Scorn of the Moon\n**Lobo** — Chaos/Mind\n\nDeuxième Diana du Top 8, confirmant la force de l'archétype Chaos/Mind à Sydney. Lobo joue une liste quasi identique à celle de nice boy (3e), preuve que la construction était parfaitement calibrée.`,
    },
  ],
};

// ────────────────────────────────────────────────────────────────────
// Rewrite generic "Meilleur deck X du tournoi" comments
// These appear in best-of articles for legends that didn't get
// a hand-written comment from the seed scripts.
// ────────────────────────────────────────────────────────────────────

/**
 * Detect and rewrite generic auto-generated deck comments.
 * Handles two patterns:
 *   1. "Meilleur deck {legend} du tournoi ({domains}). {N} exemplaire(s) dans le field."
 *   2. "{Legend} {domains} — {N} copies à {city}, meilleur résultat : {place}. {generic sentence}"
 *      (Xi'an format from seed-bestof-articles.ts)
 */
function rewriteGenericComment(content: string, articleSlug: string): string | null {
  // Determine tournament name from slug
  let tournamentShort = "";
  if (articleSlug.includes("houston")) tournamentShort = "Houston";
  else if (articleSlug.includes("bologna")) tournamentShort = "Bologne";
  else if (articleSlug.includes("las-vegas")) tournamentShort = "Las Vegas";
  else if (articleSlug.includes("lille")) tournamentShort = "Lille";
  else if (articleSlug.includes("atlanta")) tournamentShort = "Atlanta";
  else if (articleSlug.includes("sydney")) tournamentShort = "Sydney";
  else if (articleSlug.includes("xian")) tournamentShort = "Xi'an";
  else tournamentShort = "ce tournoi";

  // Pattern 1: "Meilleur deck X du tournoi (domains). N exemplaire(s) dans le field."
  const match1 = content.match(
    /^Meilleur deck (.+?) du tournoi \((.+?)\)\. (\d+) exemplaires? dans le field\.$/
  );
  if (match1) {
    const [, legendShort, domains, countStr] = match1;
    const count = parseInt(countStr, 10);
    return buildEngagingComment(legendShort, domains, count, tournamentShort);
  }

  // Pattern 2: Xi'an format "Legend domains — N copies à City, meilleur résultat : Xe place. Generic."
  const match2 = content.match(
    /^(.+?) ([A-Z][a-z]+\/[A-Z][a-z]+) — (?:seulement )?(\d+) (?:copies|exemplaires?) à .+?, meilleur résultat : .+?\. (.+)$/
  );
  if (match2) {
    const [, legendShort, domains, countStr, genericSentence] = match2;
    const count = parseInt(countStr, 10);
    // Only rewrite if the ending is one of the generic auto-generated sentences
    if (
      genericSentence.includes("Un choix solide dans le méta") ||
      genericSentence.includes("Un pilier du méta") ||
      genericSentence.includes("Un choix audacieux dans un field") ||
      genericSentence.includes("Un pick audacieux")
    ) {
      return buildEngagingComment(legendShort, domains, count, tournamentShort);
    }
  }

  return null;
}

function buildEngagingComment(legendShort: string, domains: string, count: number, tournamentShort: string): string {
  if (count === 1) {
    return `L'unique ${legendShort} de ${tournamentShort}, en ${domains}. Un choix solitaire et courageux dans un field où cette légende n'avait aucun allié. Ce joueur a fait confiance à sa maîtrise plutôt qu'au méta.`;
  }
  if (count === 2) {
    return `${legendShort} en ${domains}, l'une des deux seules copies du tournoi à ${tournamentShort}. Un choix de niche qui demande une connaissance approfondie des matchups pour compenser le manque de données collectives.`;
  }
  if (count <= 5) {
    return `${legendShort} en ${domains}, avec seulement ${count} copies à ${tournamentShort}. Un pick underground porté par des joueurs convaincus, qui ont trouvé dans cette légende un angle d'attaque que le méta dominant n'avait pas anticipé.`;
  }
  if (count <= 10) {
    return `${legendShort} en ${domains}, représentée par ${count} joueurs à ${tournamentShort}. Un choix solide qui n'a pas encore percé en masse mais qui offre un profil compétitif intéressant pour les pilotes qui la maîtrisent.`;
  }
  if (count <= 20) {
    return `${legendShort} en ${domains}, jouée par ${count} joueurs à ${tournamentShort}. Une présence significative dans le field qui témoigne de la confiance de la communauté dans cette légende et son archétype.`;
  }
  if (count <= 40) {
    return `${legendShort} en ${domains}, avec ${count} copies à ${tournamentShort}. Un pilier établi du méta qui attire un nombre conséquent de joueurs grâce à sa fiabilité et ses matchups favorables.`;
  }
  // count > 40
  return `${legendShort} en ${domains}, avec ${count} copies à ${tournamentShort}. L'une des légendes les plus populaires du tournoi, portée par un archétype dont l'efficacité n'est plus à prouver dans le format.`;
}

// ────────────────────────────────────────────────────────────────────
// Generic cleanup: convert bullet-point lines to flowing prose
// ────────────────────────────────────────────────────────────────────

function cleanTextBlock(content: string): string {
  let cleaned = content;

  const lines = cleaned.split("\n");
  const result: string[] = [];
  let bulletGroup: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      bulletGroup.push(trimmed.slice(2).trim());
    } else {
      if (bulletGroup.length > 0) {
        result.push(bulletGroup.join(". ") + ".");
        bulletGroup = [];
      }
      result.push(line);
    }
  }
  if (bulletGroup.length > 0) {
    result.push(bulletGroup.join(". ") + ".");
  }

  cleaned = result.join("\n");

  // Remove "Points clés :" headers that preceded bullet lists
  cleaned = cleaned.replace(/\n\nPoints clés :\n/g, "\n\n");
  // Remove trailing separators
  cleaned = cleaned.replace(/\n\n---\n?$/g, "");

  return cleaned;
}

// ────────────────────────────────────────────────────────────────────
// Main processing
// ────────────────────────────────────────────────────────────────────

interface ArticleBlock {
  type: string;
  id: string;
  content?: string;
  [key: string]: unknown;
}

async function main() {
  console.log(DRY_RUN ? "=== DRY RUN — no changes will be saved ===" : "=== APPLYING CHANGES ===");
  console.log("");

  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "asc" },
  });

  console.log(`Found ${articles.length} published articles.\n`);

  let totalChanges = 0;

  for (const article of articles) {
    const blocks = (article.blocks as ArticleBlock[]) ?? [];
    let changed = false;
    const changes: string[] = [];

    // Find the first text block (= the intro), regardless of its ID
    const firstTextBlockIndex = blocks.findIndex(b => b.type === "text");

    const newBlocks = blocks.map((block, idx) => {
      if (block.type !== "text" || !block.content) return block;

      const originalContent = block.content as string;
      let newContent = originalContent;

      // 1. Check if this is the intro block (first text block) and we have a rewrite
      if (idx === firstTextBlockIndex && REWRITTEN_INTROS[article.slug]) {
        newContent = REWRITTEN_INTROS[article.slug];
        if (newContent !== originalContent) {
          changes.push(`  [INTRO] Rewritten intro (${originalContent.length} -> ${newContent.length} chars)`);
        }
      }
      // 2. Check if this is a deck header block in a top-8 article
      else if (TOP8_DECK_HEADERS[article.slug]) {
        const headerMatch = TOP8_DECK_HEADERS[article.slug].find(h => h.blockIdPattern.test(block.id));
        if (headerMatch) {
          newContent = headerMatch.content;
          if (newContent !== originalContent) {
            changes.push(`  [HEADER ${block.id}] Rewritten deck header`);
          }
        }
      }

      // 3. Rewrite generic "Meilleur deck X" comments
      if (newContent === originalContent) {
        const rewritten = rewriteGenericComment(originalContent, article.slug);
        if (rewritten) {
          newContent = rewritten;
          changes.push(`  [COMMENT ${block.id}] Rewritten generic comment`);
        }
      }

      // 4. Generic cleanup: remove bullet points from any remaining text block
      if (newContent === originalContent) {
        const cleaned = cleanTextBlock(originalContent);
        if (cleaned !== originalContent) {
          newContent = cleaned;
          changes.push(`  [CLEAN ${block.id}] Removed bullet points`);
        }
      }

      if (newContent !== originalContent) {
        changed = true;
        return { ...block, content: newContent };
      }

      return block;
    });

    if (changed) {
      totalChanges++;
      console.log(`\n${"=".repeat(60)}`);
      console.log(`ARTICLE: ${article.title}`);
      console.log(`SLUG:    ${article.slug}`);
      console.log(`CHANGES (${changes.length}):`);
      for (const c of changes) console.log(c);

      if (!DRY_RUN) {
        await prisma.article.update({
          where: { id: article.id },
          data: {
            blocks: newBlocks as any,
            updatedAt: new Date(),
          },
        });
        console.log(`  >>> UPDATED in database`);
      }
    } else {
      console.log(`  SKIP: ${article.slug} — no changes needed`);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`\nTotal articles modified: ${totalChanges}/${articles.length}`);
  if (DRY_RUN) {
    console.log(`\nThis was a DRY RUN. To apply changes, run:`);
    console.log(`  npx tsx scripts/rework-articles.ts --apply`);
  } else {
    console.log(`\nAll changes applied successfully.`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
