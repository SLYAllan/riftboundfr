// Guides "Comment jouer" par Légende, en prose HUMAINE.
//
// Source : les champs `bref` / `gagne` / `plan` de scripts/seed-fiche-articles.mts
// (textes écrits à la main, avec références de cartes [[Nom]] et gras **). On les
// recopie ici VERBATIM pour que la page /legendes/[slug] puisse les afficher sans
// importer le script de seed.
//
// Clé = slug de la fiche (le nom de fichier dans data/fiches/, ex. "irelia-blade-dancer"),
// PAS le slug d'article. On dérive : slug d'article "meilleur-deck-irelia-blade-dancer"
// -> "irelia-blade-dancer".

export interface LegendGuide {
  slug: string;
  bref?: string;
  gagne?: string;
  plan?: string;
}

export const LEGEND_GUIDES: Record<string, LegendGuide> = {
  "master-yi-wuju-bladesman": {
    slug: "master-yi-wuju-bladesman",
    bref: `Master Yi est un deck **Corps/Calme** de **contrôle de terrain**, classé parmi les meilleurs du format. C'est aussi l'un des meilleurs choix pour débuter en compétition : facile à prendre en main, difficile à mal jouer, et il t'apprend les fondamentaux du jeu, les combats, la pioche et l'interaction.`,
    gagne: `Il y a deux façons de marquer à Riftbound : conquérir un champ de bataille, ou le **contrôler**, c'est-à-dire commencer ton tour en tenant un terrain déjà conquis. Master Yi est bâti pour la seconde. Tu conquiers une fois, ta capacité rend la reconquête adverse presque impossible, et chaque tour te rapporte un point.

Le cœur du moteur, c'est **[[Ruin Runner]]** : une unité à 6 d'énergie et 5 de Puissance que **les sorts et capacités adverses ne peuvent pas cibler**. En défense avec le +2 de la Légende, elle encaisse 7, ne part pas sur un retrait, et verrouille un terrain à elle seule. Ajoute **[[Zhonya's Hourglass]]**, un équipement caché qui sauve une unité de la mort, et tu obtiens une position que l'adversaire ne sait pas comment franchir.`,
    plan: `**Début de partie.** Pose un défenseur tôt, comme **[[Scuttle Crab]]**, qui pioche et révèle la main adverse, ou **[[Lonely Poro]]**, et installe-toi sur un premier terrain. Les premiers tours servent à exister et à tenir, pas à tuer.

**Milieu de partie.** Déploie tes grosses unités, **[[Rengar, Trophy Hunter]]** puis **[[Ruin Runner]]**, et score en contrôlant. Tes réactions **[[Discipline]]** et **[[En Garde]]** gonflent un défenseur au bon moment et repiochent dans la foulée.

**Fin de partie.** Tu as plus de cartes, des murs intuables et un terrain qui rapporte un point par tour. Il ne reste qu'à fermer la porte : **[[Sabotage]]** retire la meilleure carte adverse, **[[Charm]]** déplace un attaquant gênant, **[[Defy]]** contre le sort qui renverserait tout.`,
  },
  "diana-scorn-of-the-moon": {
    slug: "diana-scorn-of-the-moon",
    bref: `Diana est un deck **Esprit/Chaos** d'**aggro-tempo**, parmi les tout meilleurs du format mais aussi l'un des plus exigeants. Énormément de décisions à chaque tour et une faible marge d'erreur : ce n'est pas un premier deck idéal, mais c'est l'un des plus gratifiants à apprendre.`,
    gagne: `Une grande partie de Riftbound se joue en confrontation : quand deux armées se croisent sur un champ de bataille, chacun peut jouer des sorts pour faire pencher le combat. Diana est faite pour gagner ces échanges. Tes unités grossissent dès que tu lances un sort grâce à **[[Ravenbloom Student]]**, et tu disposes d'un arsenal de réactions à 1 d'énergie : **[[Gust]]** renvoie un attaquant, **[[Stupefy]]** affaiblit une unité, **[[Stacked Deck]]** te trouve la bonne carte. À chaque combat, tu as une réponse de plus que l'adversaire.`,
    plan: `**Début de partie.** Prends le contrôle des premiers combats. Tes petites unités, gonflées par tes sorts, gagnent des échanges qu'elles ne devraient pas, et tu prends la tête au score.

**Milieu de partie.** **[[Hwei, Brooding Painter]]** devient ton moteur : il pioche et défausse à chaque déplacement. **[[Moonfall]]** et **[[Star-Crossed]]** repositionnent tes unités pour transformer un combat perdu en combat gagné.

**Fin de partie.** Tu fermes avec ce que l'adversaire ne peut pas anticiper, un déplacement surprise ou un sort de tempo au bon moment. **[[Vex, Apathetic]]** verrouille la fin de partie en punissant chaque unité déployée en face.`,
  },
  "irelia-blade-dancer": {
    slug: "irelia-blade-dancer",
    bref: `Irelia est un deck **Calme/Chaos** de **tempo**, l'un des plus solides et des mieux définis du format. Le pilotage demande un peu d'habitude, savoir quand protéger et quand pousser, mais le deck pardonne davantage que Diana tout en restant au plus haut niveau.`,
    gagne: `Irelia ne cherche pas à envahir le plateau : elle veut garder UNE menace et marquer avec. **[[Irelia, Fervent]]** grossit à chaque fois que tu la choisis ou la prépares, et elle est difficile à viser puisque l'adversaire doit payer une rune de plus pour la cibler. Autour, tu joues une muraille de réactions à 1 d'énergie : **[[Defy]]** contre un sort, **[[Discipline]]** et **[[Defiant Dance]]** gonflent ta défenseuse et repiochent, **[[Charm]]** déplace un attaquant. **[[Zhonya's Hourglass]]** sauve ta pièce maîtresse d'un combat perdu.`,
    plan: `**Début de partie.** Pose **[[Tideturner]]** et **[[Stellacorn Herder]]**, qui pioche à chaque déplacement, et garde tes positions avec tes sorts bon marché.

**Milieu de partie.** Installe **[[Irelia, Fervent]]**, protège-la avec tes contresorts et tes équipements cachés, et commence à pousser des points en déplaçant tes unités au bon moment.

**Fin de partie.** Le timing fait tout : trop tôt, tu manques de runes ; trop tard, l'adversaire s'installe. Quand la fenêtre s'ouvre, tu enchaînes mouvements et bonus, et tu fermes la partie d'un coup.`,
  },
  "leblanc-deceiver": {
    slug: "leblanc-deceiver",
    bref: `LeBlanc est un deck **Esprit/Ordre** à moteur d'**Agonie** : tes unités meurent, et chaque mort te rapporte quelque chose. Accessible une fois le principe compris, c'est l'un des decks les plus satisfaisants à faire tourner.`,
    gagne: `Le truc de LeBlanc, c'est que perdre une unité n'est jamais une mauvaise nouvelle. **[[Soaring Scout]]** te rend une rune en mourant, **[[Watchful Sentry]]** te fait piocher, **[[Ruined Rex]]** inflige 4 dégâts. Et **[[Karthus, Eternal]]** double tous ces déclenchements. Ajoute **[[Sacrifice]]**, qui tue ta propre unité au bon moment pour relancer la machine, et **[[Mirror Image]]**, qui crée des copies vouées à mourir, et tu obtiens un flot de valeur que l'adversaire ne peut pas tarir.`,
    plan: `**Début de partie.** Mets en place tes petites unités d'Agonie et cherche **[[Karthus, Eternal]]**, la pièce qui double tout.

**Milieu de partie.** Sacrifie sans hésiter : chaque échange te fait piocher et avancer. **[[Glasc Mixologist]]** rejoue une unité depuis la défausse, et le moteur s'emballe.

**Fin de partie.** Tu as plus de cartes et plus de menaces que l'adversaire. **[[Harnessed Dragon]]** retire une unité en arrivant, **[[Vi, Peacekeeper]]** surgit en embuscade et étourdit, et tu fermes pendant qu'en face on manque de ressources.`,
  },
  "sivir-battle-mistress": {
    slug: "sivir-battle-mistress",
    bref: `Sivir est un deck **Corps/Chaos** de **rampe** construit autour de Dazzling Aurora. Le plan est clair, mais il faut bien gérer ses ressources et survivre à la phase de mise en place. Attention : depuis Xi'an, le méta s'est chargé en retrait d'équipement (Salvage, Turn to Dust, Adaptatron, Akshan) qui vise directement Aurora, donc les meilleures listes savent encore gagner sans dépendre uniquement de cette carte. Un excellent deck pour qui aime construire une machine et écraser la fin de partie.`,
    gagne: `Le plan tient en deux temps. D'abord, tu accélères : **[[Mobilize]]**, **[[Catalyst of Aeons]]** et tes équipements bon marché te donnent de l'avance sur l'énergie pendant que tu encaisses. Ensuite, tu déploies **[[Dazzling Aurora]]**, qui invoque une grosse unité chaque tour et nettoie le plateau adverse, puis **[[Elder Dragon]]**, un finisher de 10 de Puissance dont les dégâts suffisent toujours à tuer. À ce stade, l'adversaire n'a plus les moyens de suivre.`,
    plan: `**Début de partie.** Survis et accélère. Tes sorts de rampe et tes équipements bon marché préparent le terrain pendant que tu gères les premières unités adverses.

**Milieu de partie.** Pioche pour trouver **[[Dazzling Aurora]]** et installe-la. **[[Mindsplitter]]** retire la meilleure carte de la main adverse, **[[Sabotage]]** fait de même côté sorts.

**Fin de partie.** Aurora tourne, **[[Elder Dragon]]** verrouille les combats, et tu conquiers un plateau que personne ne peut te disputer.`,
  },
  "azir-emperor-of-the-sands": {
    slug: "azir-emperor-of-the-sands",
    bref: `Azir est un deck **Calme/Ordre** de **jetons et équipements**, double vainqueur de Regional. Le plan est limpide et l'un des plus satisfaisants à dérouler : c'est un bon deck pour qui aime voir un plateau se construire et déborder l'adversaire.`,
    gagne: `Le moteur d'Azir, ce sont ses équipements bon marché : **[[Soul Sword]]**, **[[B.F. Sword]]**, **[[Brutalizer]]**. Chacun déclenche la capacité de Légende et fait apparaître un Sand Soldier. Tu te retrouves vite avec plus d'unités que l'adversaire, et comme l'équipement passe d'une créature à l'autre, un seul arsenal sert toute ton armée. Pendant ce temps, **[[Defy]]** et **[[Discipline]]** protègent tes positions, et tu conquiers terrain après terrain.`,
    plan: `**Début de partie.** Pose tes premiers équipements pour lancer la machine à Sand Soldiers et occupe un champ de bataille.

**Milieu de partie.** Empile l'équipement sur tes meilleures unités, transmets-le au fil des combats, et commence à conquérir sur deux fronts.

**Fin de partie.** Ton armée de soldats équipés est partout. **[[Deathgrip]]** te permet de passer par-dessus un mur adverse pour aller chercher les derniers points, et l'empire se referme.`,
  },
  "ezreal-prodigal-explorer": {
    slug: "ezreal-prodigal-explorer",
    bref: `Ezreal est un deck **Esprit/Chaos** de **contrôle**, l'un des plus exigeants du format mais aussi l'un des plus puissants entre de bonnes mains. Ce n'est pas un deck pour débuter, c'est un deck pour progresser.`,
    gagne: `Tout tourne autour du ciblage. **[[Deadly Flourish]]** inflige des dégâts et laisse une récompense, **[[Stupefy]]** affaiblit, **[[Bellows Breath]]** répond. Chaque carte que tu vises côté adverse fait avancer ta capacité et te fait piocher. **[[Fizz, Trickster]]** rejoue un sort depuis ta défausse, et tu finis par enchaîner plus de réponses que l'adversaire n'a de menaces. Quand il n'a plus rien, tu conquiers le plateau vide.`,
    plan: `**Début de partie.** Installe ton économie et gère les premières menaces sans te précipiter : tes grosses cartes arrivent plus tard.

**Milieu de partie.** Prends le contrôle avec **[[Deadly Flourish]]** et **[[Stacked Deck]]**, et commence à piocher gratuitement en visant la main et le plateau adverses.

**Fin de partie.** Ta capacité tourne à plein, tu rejoues tes meilleurs sorts avec **[[Fizz, Trickster]]**, et l'adversaire n'a tout simplement plus les ressources pour suivre.`,
  },
  "fiora-grand-duelist": {
    slug: "fiora-grand-duelist",
    bref: `Fiora est un deck **Corps/Ordre** de **midrange**, régulièrement présent en Top 8. Le plan est direct et lisible : c'est un bon deck pour qui veut un style proactif sans la complexité des decks de contrôle.`,
    gagne: `L'idée est de rendre tes unités « puissantes », c'est-à-dire assez grosses pour franchir un seuil de Puissance. **[[Fiora, Victorious]]** devient alors quasi imprenable, avec protection, mobilité et bouclier d'un coup. **[[Akshan, Mischievous]]** attache des équipements à prix réduit, **[[Sett, Brawler]]** grossit à chaque conquête, et tout ce petit monde devient vite trop gros à gérer pour l'adversaire.`,
    plan: `**Début de partie.** Déploie tes premières unités et commence à les renforcer pour viser le seuil de puissance.

**Milieu de partie.** **[[Fiora, Victorious]]** et **[[Sett, Brawler]]** prennent le contrôle des combats. Une fois « puissantes », tes unités encaissent et débordent.

**Fin de partie.** Tes menaces sont devenues impossibles à retirer proprement, et **[[Elder Dragon]]** vient sceller la partie en verrouillant les combats.`,
  },
  "vex-gloomist": {
    slug: "vex-gloomist",
    bref: `Vex est un deck **Calme/Chaos** de **contrôle défensif** bâti sur les cartes cachées et l'attrition. Exigeant à piloter, c'est l'un des meilleurs decks de tenue du format pour qui aime frustrer l'adversaire.`,
    gagne: `Le principe, c'est l'incertitude. **[[Tideturner]]**, **[[Evelynn, Entrancing]]** et **[[Edge of Night]]** se posent face cachée et se révèlent en réaction, au moment où ça fait le plus mal. L'adversaire ne sait jamais ce que tu tiens, donc il attaque mal. Autour, **[[Defy]]** contre ses sorts et **[[Discipline]]** renforce tes défenseurs. Tu ne perds presque jamais un combat que tu as décidé de gagner, et la partie s'étire à ton avantage.`,
    plan: `**Début de partie.** Installe **[[Tideturner]]** et tes unités clés sur un champ de bataille, et garde-les en vie à tout prix.

**Milieu de partie.** Pose tes cartes face cachée et protège tes positions avec tes réactions Calme. Chaque combat retourné fait pencher la partie.

**Fin de partie.** L'adversaire s'est épuisé sur tes murs. Tu prends l'initiative au moment où il n'a plus de ressources et tu conclus.`,
  },
  "viktor-herald-of-the-arcane": {
    slug: "viktor-herald-of-the-arcane",
    bref: `Viktor est un deck **Esprit/Ordre** de **contrôle**, le plus dense en sorts du format. Exigeant et patient, il récompense les joueurs qui savent gérer leurs ressources et lire la partie sur la durée.`,
    gagne: `Viktor gagne par attrition. **[[Cull the Weak]]** et **[[Imperial Decree]]** nettoient le plateau, **[[Hidden Blade]]** élimine une menace en réaction. Et quand ses propres unités tombent, elles laissent quelque chose : **[[Carrion Dredger]]** invoque un oiseau, **[[Honest Broker]]** crée un équipement. Tu réponds, tu échanges, et tu ressors toujours avec une carte d'avance. À la fin, l'adversaire n'a plus de menaces et toi, tu as encore tout ton arsenal.`,
    plan: `**Début de partie.** Réponds aux premières menaces avec tes sorts bon marché et tes petites unités à valeur.

**Milieu de partie.** **[[Cull the Weak]]** et **[[Imperial Decree]]** prennent le contrôle du plateau pendant que **[[Card Sharp]]** alimente ta machine.

**Fin de partie.** L'adversaire est à court de ressources. Tu poses une menace, **[[Vi, Peacekeeper]]** surgit pour étourdir, et tu conquiers tranquillement.`,
  },
  "rengar-pridestalker": {
    slug: "rengar-pridestalker",
    bref: `Rengar est un deck **Corps/Furie** d'**aggro** proactif basé sur l'embuscade. Accessible et explosif, c'est un excellent deck pour qui aime dicter le rythme et mettre la pression sans relâche.`,
    gagne: `Le jeu de Rengar repose sur l'imprévu. **[[Nidalee, Cat Form]]**, **[[Grim Apothecary]]** et **[[Pyke, Dockside Butcher]]** se jouent en embuscade, en réaction, sur un champ de bataille où l'adversaire pensait être en sécurité. **[[Irresistible Faefolk]]** force ses unités à se déplacer pour créer des combats à ton avantage, et **[[Pit Rookie]]** renforce ton plateau. Tu prends le lead tôt et tu ne le rends plus.`,
    plan: `**Début de partie.** Prends l'initiative avec tes petites unités agressives et installe-toi sur un champ de bataille.

**Milieu de partie.** Garde des runes ouvertes et frappe en embuscade au pire moment pour l'adversaire. **[[Kai'Sa, Survivor]]** et **[[Pit Rookie]]** renforcent la poussée.

**Fin de partie.** L'adversaire ne peut pas anticiper tes attaques. Tu fermes la partie avec des unités qu'il n'a pas vues arriver.`,
  },
  "khazix-voidreaver": {
    slug: "khazix-voidreaver",
    bref: `Kha'Zix est un deck **Corps/Chaos** de **tempo** qui carbure à l'expérience. Un peu technique, mais gratifiant : c'est une Légende sous-estimée qui récompense ceux qui la maîtrisent.`,
    gagne: `Le plan, c'est de gagner des combats pour gagner de l'XP, et de convertir cette XP en avantage. **[[Demacian Diplomat]]** lance la machine, **[[Grim Resolve]]** offre +3 de Puissance pour remporter un échange, et **[[Void Assault]]** déplace tes unités et celles de l'adversaire pour créer la bonne confrontation. **[[Qiyana, Victorious]]** verrouille un terrain en résistant au retrait. Et quand tu conquiers, ta capacité ramène tes unités à l'abri, prêtes à recommencer.`,
    plan: `**Début de partie.** Gagne tes premiers combats pour accumuler de l'expérience et lancer tes capacités.

**Milieu de partie.** **[[Qiyana, Victorious]]** et tes unités renforcées prennent le contrôle. **[[Void Assault]]** met en place les échanges qui t'arrangent.

**Fin de partie.** Vise les deux champs de bataille : ta capacité protège tes unités après la conquête, ce qui rend la double poussée bien plus sûre qu'elle n'en a l'air.`,
  },
  "miss-fortune-bounty-hunter": {
    slug: "miss-fortune-bounty-hunter",
    bref: `Miss Fortune est un deck **Corps/Chaos** de **rampe** taillé autour de Dazzling Aurora et du Gank. Un peu technique, c'est un excellent choix pour qui aime les fins de partie spectaculaires. Comme pour Sivir, le méta tech désormais le retrait d'équipement contre Aurora : elle reste forte en première partie, mais devient prévisible sur la durée d'un Bo3.`,
    gagne: `Comme Sivir, tu accélères, tu survis, et tu vises Dazzling Aurora pour invoquer des monstres chaque tour. La différence, c'est la finition : ta capacité donne le Gank, c'est-à-dire la possibilité de déplacer une unité d'un champ de bataille à l'autre. Une seule créature massive, comme **[[Baron Nashor]]** ou **[[Elder Dragon]]**, peut alors marquer sur deux terrains d'un coup. C'est souvent comme ça que tombe le huitième point.`,
    plan: `**Début de partie.** Survis et accélère avec **[[Mobilize]]** et tes équipements bon marché.

**Milieu de partie.** Trouve **[[Dazzling Aurora]]**, installe-la, et commence à déployer tes monstres pendant que **[[Flurry of Blades]]** nettoie les petites unités adverses.

**Fin de partie.** Lance le Gank sur une grosse unité pour conquérir deux champs de bataille dans le même tour, et referme la partie d'un coup.`,
  },
  "draven-glorious-executioner": {
    slug: "draven-glorious-executioner",
    bref: `Draven est un deck **Chaos/Furie** de **midrange** explosif, roi du set précédent et toujours dangereux. Accessible et agressif, c'est un bon deck pour qui aime mettre la pression tout en gardant la main pleine.`,
    gagne: `Le moteur, c'est la capacité de Draven : gagne un combat, pioche une carte. Tes unités de milieu de partie comme **[[Darius, Trifarian]]** et **[[Noxus Hopeful]]** dominent les échanges, **[[Spinning Axe]]** s'attache gratuitement pour gonfler un attaquant, et chaque combat remporté te creuse une avance en cartes. L'adversaire ne peut pas se permettre de te combattre, ni de te laisser tranquille.`,
    plan: `**Début de partie.** Développe tes unités et impose des combats que tu peux gagner pour lancer la pioche.

**Milieu de partie.** **[[Darius, Trifarian]]** et **[[Noxus Hopeful]]** prennent le contrôle du plateau. Chaque échange gagné te rapporte une carte.

**Fin de partie.** Ton avance en cartes finit par étouffer l'adversaire. Tu pousses les derniers points pendant qu'il manque de ressources.`,
  },
  "sett-the-boss": {
    slug: "sett-the-boss",
    bref: `Sett est un deck **Corps/Ordre** de **midrange** résistant. Exigeant à piloter mais au plafond très élevé, c'est une Légende pour les joueurs qui aiment bâtir un plateau impossible à démanteler.`,
    gagne: `Tout repose sur la résilience. Tes unités sont renforcées en permanence par **[[Pit Rookie]]**, **[[Arena Bar]]** et **[[Showstopper]]**, et quand l'une tombe, la capacité de Sett la rappelle. **[[Fiora, Victorious]]** et **[[Rengar, Trophy Hunter]]** deviennent des menaces que l'adversaire ne peut pas retirer durablement, et **[[Punch First]]** vole les combats serrés. Ta puissance totale grimpe tour après tour, jusqu'à déborder.`,
    plan: `**Début de partie.** Déploie tes unités et commence à les renforcer dès que possible.

**Milieu de partie.** Tiens tes positions avec des créatures massives. Chaque unité rappelée par la capacité de Sett relance ton avantage.

**Fin de partie.** Ton plateau est devenu ingérable : les unités reviennent toujours, plus grosses. Tu conquiers et tu gardes.`,
  },
  "ahri-nine-tailed-fox": {
    slug: "ahri-nine-tailed-fox",
    bref: `Ahri est un deck **Calme/Esprit** de **contrôle** très dense en sorts. Exigeant, flexible et adaptable au méta local, c'est une Légende pour les joueurs qui aiment réfléchir à chaque échange.`,
    gagne: `Le plan, c'est de transformer chaque sort en avantage. **[[Ravenbloom Student]]** grossit dès que tu lances un sort, **[[Sona, Harmonious]]** relance tes runes pour que tu n'aies jamais à choisir entre te défendre et te développer. Tes défenseurs tanky, comme **[[Blue Sentinel]]**, tiennent les champs de bataille pendant que **[[Defy]]** et tes réactions repoussent les assauts. Tu accumules la valeur, et tu conquiers une fois l'adversaire à sec.`,
    plan: `**Début de partie.** Pose tes petites unités et commence à accumuler des sorts en main.

**Milieu de partie.** **[[Blue Sentinel]]** et tes défenseurs tiennent le plateau pendant que **[[Sona, Harmonious]]** garde tes runes disponibles.

**Fin de partie.** Tu noies l'adversaire sous les réponses et tu conquiers les positions qu'il ne peut plus défendre.`,
  },
  "lillia-bashful-bloom": {
    slug: "lillia-bashful-bloom",
    bref: `Lillia est un deck **Calme/Esprit** de **tempo** bâti sur ses jetons Sprites. Accessible et malin, c'est un deck qui récompense ceux qui aiment gagner la partie un petit avantage à la fois.`,
    gagne: `Le cœur du deck, ce sont les Sprites. **[[Sprite Fountain]]** et tes générateurs créent des jetons de 3 de Puissance qui entrent prêts, donc immédiatement menaçants. L'adversaire perd de vraies cartes pour les arrêter, ou encaisse des conquêtes. Pendant ce temps, **[[Ravenbloom Student]]** grossit à chaque sort, **[[Charm]]** déplace un attaquant gênant, et **[[Thousand-Tailed Watcher]]** vient conclure. Tu marques en continu sur des échanges toujours favorables.`,
    plan: `**Début de partie.** Garde ta première unité hors des combats et laisse l'adversaire choisir ses échanges : tes Sprites arrivent vite.

**Milieu de partie.** Génère des Sprites tour après tour. Chaque jeton échangé contre une vraie unité adverse est une victoire.

**Fin de partie.** Continue de produire des jetons et conclus avec **[[Thousand-Tailed Watcher]]** pendant que l'adversaire s'épuise.`,
  },
  "leona-radiant-dawn": {
    slug: "leona-radiant-dawn",
    bref: `Leona est un deck **Calme/Ordre** de **midrange** défensif. Accessible et solide, avec un noyau très consistant, c'est un bon deck pour apprendre à défendre et à retourner les combats.`,
    gagne: `Leona gagne en transformant chaque combat en piège. **[[Call to Glory]]** se joue en réaction pour rallier tes unités au pire moment pour l'adversaire, et **[[Zhonya's Hourglass]]** sauve ta pièce clé d'un échange perdu. Tes défenseurs, comme **[[Vi, Peacekeeper]]** qui surgit et étourdit, tiennent les champs de bataille pendant que **[[Stellacorn Herder]]** fait tourner ta main. Tu avances prudemment et tu punis chaque attaque mal calculée.`,
    plan: `**Début de partie.** Établis ton plateau avec **[[Scuttle Crab]]** et tes petites unités, et garde une réponse cachée en réserve.

**Milieu de partie.** **[[Vi, Peacekeeper]]** et tes défenseurs prennent le contrôle des combats. **[[Call to Glory]]** retourne un échange que l'adversaire pensait gagné.

**Fin de partie.** Tu défends tes positions conquises avec tes coups fourrés et tu marques régulièrement jusqu'à conclure.`,
  },
  "ornn-fire-below-the-mountain": {
    slug: "ornn-fire-below-the-mountain",
    bref: `Ornn est un deck **Calme/Esprit** centré sur les **équipements**, le plus dense en gear du jeu. Exigeant mais consistant grâce à son large noyau, c'est une Légende pour qui aime bâtir une machine.`,
    gagne: `Le plan, c'est l'accumulation. Tes équipements bon marché, **[[Poro Snax]]**, **[[Seal of Focus]]**, **[[Brutalizer]]**, posent les bases tout en piochant et en générant des ressources. **[[Pit Crew]]** se prépare à chaque équipement joué et devient une présence constante. Au fil des tours, tu empiles tellement de gear sur tes unités, **[[Thousand-Tailed Watcher]]** en tête, qu'elles deviennent impossibles à arrêter, et **[[Consult the Past]]** te permet de tout recycler.`,
    plan: `**Début de partie.** Pose tes équipements bon marché pour installer le plateau, piocher et accumuler des ressources.

**Milieu de partie.** **[[Pit Crew]]** s'active à chaque gear et tes unités commencent à grossir. Protège ta mise en place.

**Fin de partie.** Tes unités croulent sous l'équipement et deviennent intuables. Tu écrases les combats et tu conquiers.`,
  },
  "teemo-swift-scout": {
    slug: "teemo-swift-scout",
    bref: `Teemo est un deck **Esprit/Chaos** de **tempo** basé sur les cartes cachées. Exigeant à piloter, c'est une Légende qui récompense la ruse et la lecture de l'adversaire.`,
    gagne: `Comme Diana, Teemo enchaîne les sorts bon marché pour gagner les combats, mais il y ajoute une couche de bluff. **[[Tideturner]]** et ses cartes cachées créent une incertitude permanente : l'adversaire ne sait jamais ce que tu tiens en réserve. **[[Ravenbloom Student]]** grossit à chaque sort, **[[Gust]]** et **[[Stupefy]]** retournent les échanges, et **[[Hwei, Brooding Painter]]** fait tourner ta main. Tu prends la tête tôt et tu gardes l'adversaire dans le flou.`,
    plan: `**Début de partie.** Prends l'avantage avec tes petites unités gonflées par tes sorts, et pose tes premières cartes cachées.

**Milieu de partie.** **[[Hwei, Brooding Painter]]** alimente ta main pendant que tes menaces cachées dissuadent l'adversaire d'attaquer.

**Fin de partie.** Tu conclus avec ce qu'il n'a pas vu venir : une réaction cachée au bon moment, et les derniers points tombent.`,
  },
  "volibear-relentless-storm": {
    slug: "volibear-relentless-storm",
    bref: `Volibear est un deck **Corps/Furie** de **rampe** à grosses unités. Accessible et spectaculaire, c'est un bon deck pour qui aime accélérer et claquer des menaces démesurées.`,
    gagne: `Le plan tient en deux temps : accélérer, puis frapper fort. **[[Mobilize]]** et **[[Catalyst of Aeons]]** te donnent de l'avance sur l'énergie, et **[[Gentle Gemdragon]]** relance tes runes dès que tu poses un dragon. Tu déroules ensuite **[[Kadregrin the Infernal]]** et **[[Elder Dragon]]**, des finishers que personne ne bat en combat. **[[Sabotage]]** retire la réponse adverse avant qu'elle ne pose problème, et le plateau t'appartient.`,
    plan: `**Début de partie.** Accélère ton énergie avec tes sorts de rampe et tiens le coup face aux premières unités adverses.

**Milieu de partie.** **[[Gentle Gemdragon]]** lance la cascade de dragons et te permet de jouer tes menaces bien plus tôt que prévu.

**Fin de partie.** **[[Kadregrin the Infernal]]** et **[[Elder Dragon]]** verrouillent les combats. L'adversaire n'a pas les moyens de répondre, tu conquiers.`,
  },
  "master-yi-wuju-master": {
    slug: "master-yi-wuju-master",
    bref: `Master Yi, Wuju Master est un deck **Corps/Calme** de **montée en niveau** (Hunt), une variante de niche à ne pas confondre avec le Bladesman. Difficile et un peu casse-gueule, c'est un deck pour qui aime les plans à fort potentiel.`,
    gagne: `Tout repose sur l'expérience. Tes unités à Chasse, comme **[[Mosstomper]]** et **[[Master Yi, Tempered]]**, gagnent de l'XP en conquérant et en tenant les champs de bataille, et **[[Herald of Spring]]** en offre d'entrée. À mesure que tu montes en niveau, tes unités deviennent plus grosses, puis entrent prêtes : aux paliers les plus élevés, c'est toute ton armée qui frappe sans s'épuiser, un plateau tout simplement impossible à contenir. **[[Concentrate]]** repioche pour entretenir la pression.`,
    plan: `**Début de partie.** Déploie tes unités à Chasse et commence à accumuler de l'expérience en tenant les champs de bataille. Attention, tu n'as pas d'avantage immédiat : il faut survivre.

**Milieu de partie.** Atteins les premiers paliers : tes unités gagnent en puissance et deviennent plus dures à retirer.

**Fin de partie.** Au palier maximal, toute ton armée entre prête et renforcée. À ce stade, l'adversaire ne peut plus suivre le rythme.`,
  },
  // ── Legendes ajoutees le 22 juillet 2026 ──────────────────────────────────
  // Ecrits a partir de la capacite reelle de chaque Legende et des cartes coeur
  // mesurees sur les decklists de tournoi (data/fiches/*.json). Les taux de jeu
  // cites viennent du comptage, pas d'une impression.
  "kaisa-daughter-of-the-void": {
    slug: "kaisa-daughter-of-the-void",
    bref: `Kai'Sa est un deck **Furie/Esprit** de **tempo par les sorts**, et accessoirement la Légende la plus jouée de toute l'histoire du jeu : plus de 3 000 listes recensées et 135 top 8. Si tu ne sais pas quoi jouer, c'est le choix par défaut du format, et ce n'est pas un hasard.`,
    gagne: `Sa capacité tient en une ligne : épuise-la et tu obtiens une rune, mais uniquement pour lancer un sort. Autrement dit, tu as chaque tour un sort presque gratuit de plus que l'adversaire. Tout le deck est bâti là-dessus.

Le résultat, c'est un deck qui répond à tout. **[[Falling Star]]** inflige 3 dégâts deux fois, de quoi nettoyer deux petites unités ou en abattre une grosse. **[[Hextech Ray]]** frappe à distance sur un champ de bataille. **[[Stupefy]]** affaiblit et repioche pour une énergie. Et quand tu veux reprendre la main d'un coup, **[[Thousand-Tailed Watcher]]** arrive avec 7 de Puissance et retire 3 à toutes les unités adverses.`,
    plan: `**Début de partie.** Ne te précipite pas. Pose **[[Watchful Sentry]]** ou **[[Lecturing Yordle]]**, qui piochent en mourant ou en arrivant, et laisse l'adversaire s'engager le premier.

**Milieu de partie.** C'est là que tu prends le dessus. Chaque combat où tu lances un sort de plus se gagne, et ta capacité t'en offre un. **[[Retreat]]** sauve une unité condamnée et te rend une rune au passage.

**Fin de partie.** **[[Thousand-Tailed Watcher]]** remet le plateau à plat, **[[Darius, Trifarian]]** se prépare tout seul dès que tu joues ta deuxième carte du tour. Tu conclus avec une avance en cartes que l'adversaire n'a jamais comblée.`,
  },
  "annie-dark-child": {
    slug: "annie-dark-child",
    bref: `Annie est un deck **Furie/Chaos** de **mouvement**, et l'une des meilleures affaires du format : 500 listes recensées seulement, mais 25 top 8 et 6 victoires, un rendement que peu de Légendes plus jouées atteignent.`,
    gagne: `Sa capacité prépare jusqu'à deux runes à la fin de ton tour. Concrètement, tu joues pendant le tour adverse avec des ressources que les autres n'ont plus. C'est une invitation à remplir ton deck de réactions et à ne jamais rester passif.

Le reste du deck sert à déplacer les unités, les tiennes comme celles d'en face. **[[Fight or Flight]]** et **[[Flash]]** renvoient des unités à la base, **[[Rebuke]]** en renvoie une carrément en main, **[[Ride the Wind]]** repositionne au bon moment. Un champ de bataille que l'adversaire croyait tenir se vide juste avant qu'il ne marque.`,
    plan: `**Début de partie.** Développe sans t'exposer. **[[Traveling Merchant]]** échange une carte morte contre une neuve à chaque déplacement, **[[Stacked Deck]]** va chercher la pièce manquante.

**Milieu de partie.** Choisis tes combats et refuse les autres. Tu n'as pas besoin de gagner un affrontement : sortir ton unité au dernier moment suffit à annuler celui de l'adversaire.

**Fin de partie.** **[[Kai'Sa, Survivor]]** pioche quand elle conquiert, **[[Vi, Destructive]]** passe d'un terrain à l'autre pour aller chercher le point qui manque. Garde toujours deux runes prêtes : c'est ce qui rend tes fins de partie imprévisibles.`,
  },
  "darius-hand-of-noxus": {
    slug: "darius-hand-of-noxus",
    bref: `Darius est un deck **Furie/Ordre** d'**agression en série**, construit autour du mot-clé Légion. 284 listes, 12 top 8 : régulier en haut de tableau, mais toujours pas de titre à son palmarès.`,
    gagne: `Sa capacité te rend une énergie dès que tu as déjà joué une carte dans le tour. Le deck entier récompense la même chose : enchaîner. **[[Noxus Hopeful]]** coûte deux énergies de moins si ce n'est pas ta première carte du tour, **[[Vanguard Captain]]** amène deux recrues avec lui dans les mêmes conditions.

Tu ne cherches pas à survivre longtemps, tu cherches à poser plus de corps que l'adversaire ne peut en gérer, puis à convertir. **[[Cleave]]** ajoute 3 de Puissance à un attaquant, **[[Grand Strategem]]** en ajoute 5 à toute ton armée d'un coup : le combat que l'adversaire pensait tenir est perdu d'avance.`,
    plan: `**Début de partie.** Vise deux cartes par tour dès que possible. Une seule carte jouée, et la moitié de ton deck fonctionne au tarif plein.

**Milieu de partie.** Sature un champ de bataille. **[[Hidden Blade]]**, posée face cachée, retire gratuitement le défenseur qui bloquait tout, même en plein combat.

**Fin de partie.** **[[Grand Strategem]]** est ta carte de finition : garde-la pour le tour où l'adversaire s'est enfin stabilisé, et fais sauter le verrou d'un seul sort.`,
  },
  "reksai-void-burrower": {
    slug: "reksai-void-burrower",
    bref: `Rek'Sai est un deck **Furie/Ordre** d'**agression qui pioche dans son deck**. Peu jouée, 92 listes seulement, mais elle a signé une 5e place au National Open : c'est un choix de joueur qui connaît son deck, pas un choix par défaut.`,
    gagne: `Chaque fois que tu conquiers, tu peux l'épuiser pour révéler les deux cartes du dessus de ton deck, en bannir une et la jouer aussitôt. Conquérir ne te rapporte donc pas qu'un point : ça te rapporte une carte gratuite. Plus tu avances, plus tu creuses.

**[[Void Rush]]** fait la même chose pour deux énergies, en réduisant le coût de ce que tu joues. Et **[[Undertitan]]**, révélé depuis ton deck, ajoute deux énergies au lieu de t'en coûter. Le deck s'auto-alimente tant que tu continues d'attaquer.`,
    plan: `**Début de partie.** Prends un terrain vite. Sans conquête, ta capacité ne sert à rien et le deck tourne à vide.

**Milieu de partie.** Enchaîne conquête et révélation. **[[Noxus Hopeful]]** à quatre énergies, souvent deux, remplit le plateau pendant que **[[Hidden Blade]]** et **[[Falling Star]]** dégagent ce qui gêne.

**Fin de partie.** **[[Cull the Weak]]** oblige chacun à sacrifier une unité : joue-la quand l'adversaire n'a qu'une seule grosse pièce et que tu en as cinq petites.`,
  },
  "pyke-bloodharbor-ripper": {
    slug: "pyke-bloodharbor-ripper",
    bref: `Pyke est un deck **Furie/Chaos** de **rebond et de ressources**. 127 listes pour 5 top 8, l'un des meilleurs rendements des Légendes discrètes du format.`,
    gagne: `Sa capacité renvoie une de tes unités en main et te donne un jeton d'or au passage. Ça a l'air défensif, c'est en réalité un moteur : tu sauves une unité d'un combat perdu, tu récupères son effet d'arrivée pour plus tard, et tu gagnes une ressource.

Autour, tout tourne autour du même geste. **[[Star-Crossed]]** renvoie une de tes unités et une unité adverse en main. **[[Treasure Hunter]]** crée de l'or à chaque déplacement. **[[Fizz, Trickster]]** rejoue un sort depuis ta défausse sans payer son énergie. Tu joues deux fois ce que l'adversaire ne joue qu'une.`,
    plan: `**Début de partie.** Pose des unités bon marché à effet d'arrivée. Elles vaudront double quand tu les renverras en main.

**Milieu de partie.** Refuse les échanges défavorables : au lieu de perdre une unité, reprends-la. **[[Bewitching Spirit]]** vide la main adverse pendant que tu montes ta réserve d'or.

**Fin de partie.** **[[Mindsplitter]]** arrache la carte que l'adversaire gardait pour te répondre. Une fois sa réponse partie, tu poses ta menace et tu marques.`,
  },
  "jax-grandmaster-at-arms": {
    slug: "jax-grandmaster-at-arms",
    bref: `Jax est un deck **Calme/Corps** d'**équipement mobile**. 184 listes, 4 top 8 : jouable, jamais dominant. Un deck de patience plus que de pression.`,
    gagne: `Sa capacité déplace ton équipement d'une unité à l'autre, même déjà attaché. Tu n'as donc pas besoin de protéger l'unité équipée : si elle meurt, l'équipement repart ailleurs. La menace, c'est le matériel, pas le porteur.

À partir de là, le deck devient une forteresse. **[[Guardian Angel]]** et **[[Brutalizer]]** s'attachent pour une seule rune Calme, et la muraille de réactions fait le reste : **[[Counter Strike]]** empêche les prochains dégâts et repioche, **[[Not So Fast]]** contre tout ce qui vise tes unités ou ton équipement, **[[Defy]]** contre le reste.`,
    plan: `**Début de partie.** Équipe une unité bon marché et installe-toi sur un terrain. Tu n'as pas besoin d'aller vite.

**Milieu de partie.** Fais payer chaque tentative de retrait. Entre **[[Counter Strike]]**, **[[Not So Fast]]** et **[[Discipline]]**, l'adversaire doit dépenser deux ou trois cartes pour en tuer une seule.

**Fin de partie.** **[[Challenge]]** force un duel entre ton unité équipée et la leur : à ce stade la tienne est plus grosse, et l'échange est gagné d'avance.`,
  },
  "lucian-purifier": {
    slug: "lucian-purifier",
    bref: `Lucian est un deck **Furie/Corps** d'**équipement agressif**. 233 listes, 2 top 8 seulement : le plan de jeu est clair, mais il convertit mal face aux decks qui savent retirer les unités.`,
    gagne: `Sa capacité donne Assaut à tous tes équipements : chaque unité équipée frappe plus fort en attaque. Tu n'équipes donc pas pour survivre, tu équipes pour marquer.

**[[Relentless Pursuit]]**, présente dans la totalité des listes, déplace une unité, y attache un équipement et lui permet de rentrer à la base après avoir conquis. Tu attaques sans t'exposer au retour de bâton. **[[Lucian, Merciless]]** s'équipe à coût réduit en arrivant et se prépare la première fois qu'il conquiert chaque tour.`,
    plan: `**Début de partie.** Pose une unité et un équipement bon marché, **[[Doran's Blade]]** pour une seule rune Corps, et commence à pousser.

**Milieu de partie.** **[[First Mate]]** prépare une autre unité en arrivant, ce qui te donne deux attaques dans le même tour. **[[Punch First]]** ajoute 5 de Puissance pour une énergie et vole les combats qu'on te croyait perdus.

**Fin de partie.** **[[Challenge]]** nettoie le dernier défenseur en le forçant à échanger avec ton unité équipée. Attention : tout ton plan repose sur des unités qui portent le matériel, et un retrait bien placé te coûte deux cartes d'un coup.`,
  },
  "garen-might-of-demacia": {
    slug: "garen-might-of-demacia",
    bref: `Garen est un deck **Corps/Ordre** de **rampe et de nombre**. 106 listes, 1 top 8 : une Légende de fin de partie, lente à démarrer et vulnérable en attendant.`,
    gagne: `Sa capacité récompense la masse : conquiers un champ de bataille avec au moins quatre unités dessus et tu piochies deux cartes. Ce n'est pas un deck qui frappe fort, c'est un deck qui frappe nombreux.

Avant ça, tu montes tes ressources. **[[Mobilize]]** et **[[Catalyst of Aeons]]** canalisent des runes en avance, et te font piocher quand tu ne peux plus. Au bout, **[[Dazzling Aurora]]** pose une unité gratuite à chaque fin de tour, indéfiniment.`,
    plan: `**Début de partie.** Survis et canalise. Tes premiers tours ne marquent rien, ils préparent la suite.

**Milieu de partie.** Déploie large plutôt que gros. **[[Confront]]** fait entrer prêtes toutes les unités que tu poses ce tour et repioche : c'est ton tour de bascule.

**Fin de partie.** Avec **[[Dazzling Aurora]]** en jeu, tu produis plus vite que l'adversaire ne nettoie. **[[Harnessed Dragon]]** tue une unité en arrivant et referme la partie.`,
  },
  "lux-lady-of-luminosity": {
    slug: "lux-lady-of-luminosity",
    bref: `Lux est un deck **Esprit/Ordre** de **contrôle par les gros sorts**. 247 listes, 4 top 8 : elle répond à tout, mais elle a du mal à conclure avant que le temps ne tombe.`,
    gagne: `Sa capacité te fait piocher chaque fois que tu lances un sort à cinq énergies ou plus. Là où un deck normal se ruine à jouer cher, Lux se rembourse. Son deck est donc rempli de sorts que personne d'autre ne peut se permettre.

**[[Singularity]]** inflige 6 dégâts à deux unités d'un coup. **[[Imperial Decree]]** tue tout ce qui subit le moindre dégât pendant le tour. **[[Falling Comet]]** et **[[Drag Under]]** règlent les menaces isolées. Et **[[Time Warp]]**, à dix énergies, te donne carrément un tour de plus.`,
    plan: `**Début de partie.** Tu vas encaisser des points, c'est normal. Garde **[[Bellows Breath]]** et **[[Cull the Weak]]** pour contenir les premières vagues à moindre coût.

**Milieu de partie.** Nettoie le plateau au bon moment. Un **[[Singularity]]** sur deux unités bien choisies annule trois tours de développement adverse.

**Fin de partie.** C'est ta phase. Chaque gros sort repioche, tu enchaînes les réponses, et **[[Time Warp]]** te donne le tour supplémentaire qui transforme l'avantage en victoire. Le vrai risque n'est pas de perdre le plateau, c'est de manquer de temps.`,
  },
  "renata-glasc-chem-baroness": {
    slug: "renata-glasc-chem-baroness",
    bref: `Renata Glasc est un deck **Esprit/Ordre** de **contrôle par les ressources**. Soyons honnêtes : 106 listes recensées et **aucun top 8**. Le deck est plaisant à piloter, mais il n'a rien prouvé en compétition.`,
    gagne: `Sa capacité fabrique de l'or dès que toi ou un allié contrôlez un terrain, et cet or rapporte une énergie de plus quand tu approches du score de victoire. Tu joues donc de plus en plus vite à mesure que la partie avance.

Le deck accumule les jetons d'or par tous les bouts : **[[Plundering Poro]]** en crée en conquérant, **[[Honest Broker]]** en laisse un en mourant, **[[Wages of Pain]]** en donne un en retirant une unité. Puis tu convertis, souvent brutalement, avec **[[Hostile Takeover]]** qui prend le contrôle d'une unité adverse et l'active aussitôt.`,
    plan: `**Début de partie.** Tiens un terrain, même modeste. Sans contrôle, ta capacité ne se déclenche jamais.

**Milieu de partie.** Empile l'or et retire les menaces avec **[[Hidden Blade]]** et **[[Cull the Weak]]**. Tu ne cherches pas à dominer le plateau, seulement à ne pas mourir.

**Fin de partie.** Près du score de victoire, ton or vaut double. **[[Hostile Takeover]]** puis **[[Time Warp]]** enchaînés dans le même tour sont ta meilleure fin de partie.`,
  },
  "yasuo-unforgiven": {
    slug: "yasuo-unforgiven",
    bref: `Yasuo est un deck **Calme/Chaos** de **repositionnement**. 336 listes pour 2 top 8 : très choisi, très rarement payant. À jouer parce qu'il te plaît, pas parce qu'il gagne.`,
    gagne: `Sa capacité déplace une unité amie vers sa base ou depuis sa base, pour deux énergies. Tu peux donc retirer un défenseur d'un combat perdu, ou en faire surgir un là où l'adversaire ne l'attendait pas.

Le reste est un socle de réactions solide mais sans surprise : **[[Defy]]** contre les sorts, **[[Discipline]]** et **[[En Garde]]** gonflent une unité et repiochent, **[[Zhonya's Hourglass]]** sauve une unité de la mort en la renvoyant à la base.`,
    plan: `**Début de partie.** Pose peu, garde tes énergies. La force du deck, c'est de réagir.

**Milieu de partie.** Sers-toi de ta capacité comme d'un sort gratuit : chaque combat que tu refuses au dernier moment est une carte gagnée.

**Fin de partie.** **[[Fight or Flight]]**, posée face cachée en avance, se joue pour rien et vide un terrain au moment décisif. Le problème du deck reste le même : il sait ne pas perdre, il sait mal gagner.`,
  },
  "jinx-loose-cannon": {
    slug: "jinx-loose-cannon",
    bref: `Jinx est un deck **Furie/Chaos** d'**agression main vide**. 278 listes, 3 top 8 : le plan est direct et amusant, le rendement reste faible.`,
    gagne: `Sa capacité te fait piocher au début de ton tour si tu as une carte ou moins en main. Vider sa main n'est donc pas une faiblesse ici, c'est la condition pour continuer à jouer.

Tout le deck consomme des cartes volontiers. **[[Chemtech Enforcer]]** défausse en arrivant, **[[Traveling Merchant]]** défausse et repioche à chaque déplacement, et **[[Super Mega Death Rocket!]]** revient de la défausse quand tu conquiers, contre une défausse de plus.`,
    plan: `**Début de partie.** Joue tout. Retenir des cartes en main coupe ta pioche et ralentit le deck.

**Milieu de partie.** Pousse sur un terrain et conquiers pour ramener le missile. **[[Noxus Hopeful]]** à coût réduit remplit le plateau au passage.

**Fin de partie.** Tu finis souvent la main vide face à un adversaire qui a des réponses. C'est le défaut de structure du deck : ta pioche est régulière mais lente, et une carte par tour ne suffit pas face à un contrôle installé.`,
  },
  "lee-sin-blind-monk": {
    slug: "lee-sin-blind-monk",
    bref: `Lee Sin est un deck **Calme/Corps** de **renfort progressif**. 242 listes pour 3 top 8 : honnête en partie libre, en retrait en compétition.`,
    gagne: `Sa capacité renforce une unité amie chaque tour pour une énergie. Ce n'est pas spectaculaire, mais c'est gratuit et ça s'accumule : une unité renforcée deux ou trois fois devient un mur que peu de decks savent franchir.

Autour, tu protèges cette pièce. **[[Zhonya's Hourglass]]** la sauve d'une mort certaine, **[[Defy]]** contre le sort qui la viserait, **[[Discipline]]** ajoute 2 de Puissance et repioche au moment du combat.`,
    plan: `**Début de partie.** Pose une unité que tu comptes garder longtemps et commence à la renforcer dès que tu as une énergie de libre.

**Milieu de partie.** **[[First Mate]]** et **[[Pit Rookie]]** te donnent une deuxième action dans le tour, l'un en préparant une unité, l'autre en renforçant.

**Fin de partie.** **[[Charm]]** déplace le défenseur adverse hors du terrain que tu convoites, et ton unité renforcée conquiert seule. Le point faible reste la lenteur : contre un deck qui marque tôt, tu renforces une unité pendant qu'il prend des points.`,
  },
  "rumble-mechanized-menace": {
    slug: "rumble-mechanized-menace",
    bref: `Rumble est un deck **Furie/Esprit** **tribal Mechs**, le plus thématique du format. 166 listes, 1 top 8 : un deck de passionné, pas un choix de tournoi.`,
    gagne: `Sa capacité donne Bouclier à tous tes Mechs : ils gagnent en Puissance quand ils défendent. Chaque autre carte du deck empile un bonus supplémentaire sur la même famille. **[[Rumble, Scrapper]]** ajoute 1 de Puissance à tous les Mechs, **[[Rumble, Hotheaded]]** leur donne Assaut, **[[Breakneck Mech]]** leur ajoute Protection et le déplacement libre entre terrains.

Empilés, ces effets transforment des unités quelconques en armée cohérente que l'adversaire ne peut ni cibler facilement ni bloquer proprement.`,
    plan: `**Début de partie.** **[[Forecaster]]** et **[[Gem Jammer]]** posent les bases : le premier donne Vision à tes Mechs, le second offre le déplacement libre à une unité.

**Milieu de partie.** Enchaîne les Mechs qui se renforcent entre eux. **[[Bubble Bot]]** prépare un autre Mech en arrivant, ce qui te donne une action de plus.

**Fin de partie.** **[[Ferrous Forerunner]]** laisse deux Mechs derrière lui en mourant : ton armée ne disparaît jamais vraiment. Le défaut du deck est là : il lui faut plusieurs pièces en jeu pour fonctionner, et il perd sèchement s'il se fait démonter avant de les avoir posées.`,
  },
};
