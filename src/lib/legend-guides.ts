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
  "mel-souls-reflection": {
    slug: "mel-souls-reflection",
    bref: `Mel, Soul's Reflection joue en Esprit et Chaos, sur un plan d'amplification et de sorts pris à l'adversaire. C'est un deck difficile à piloter. Il compte 48 listes en tournoi, sur dix-huit tournois, et n'a signé aucun Top 8.`,
    gagne: `Mel suit le rythme de vos sorts. Chaque fois que vous amplifiez une autre carte, elle s'amplifie aussi. Vous pouvez ensuite la désamplifier et l'épuiser pour retirer 2 à une unité au combat. Elle se charge donc pendant que vous jouez, puis se vide au bon moment pour affaiblir une unité adverse.

Le deck gagne les échanges de sorts. **[[Rebuttal]]**, dans 100 % des listes en 3 exemplaires, vous donne le contrôle d'un sort adverse. **[[Stupefy]]**, aussi dans toutes les listes, et **[[Stacked Deck]]** (90 %) gardent votre main pleine. En fin de partie, **[[Mel, Newly Awakened]]** amplifiée (73 % des listes) rend vos sorts impossibles à contrer, et **[[Thousand-Tailed Watcher]]** (58 %) contrôle le terrain. Vous marquez pendant que l'adversaire n'a plus de réponse.`,
    plan: `**Début de partie.** **[[Stupefy]]** et **[[Stacked Deck]]** (90 %) tiennent votre main pleine à une énergie. Vous jouez vos cartes à bas coût et vous gardez le rythme.

**Milieu de partie.** **[[Rebuttal]]**, dans toutes les listes, vous donne le contrôle d'un sort adverse. **[[Applied Researchers]]** amplifié (42 %) baisse le coût de vos sorts. Vous prenez les réponses et vous perturbez le plan de l'adversaire.

**Fin de partie.** **[[Mel, Newly Awakened]]** amplifiée rend vos sorts impossibles à contrer. **[[Thousand-Tailed Watcher]]** (58 %) contrôle le terrain. Vous marquez pendant que l'adversaire n'a plus de réponse.

**Ce qui le bat.** Le deck ne prend l'avantage que si l'adversaire joue des sorts, sinon Mel reste inerte. Les terrains restent dispersés, aucun au-dessus de 44 %, personne n'a arrêté une liste stable. Et malgré ses 48 listes, aucun Top 8 en dix-huit tournois.`,
  },
  "zed-master-of-shadows": {
    slug: "zed-master-of-shadows",
    bref: `Zed, Master of Shadows joue en Furie et Chaos. Son plan : bannir ses cartes pour amplifier la Légende, puis défausser et piocher à chaque tour. Le deck est Difficile à piloter. En treize tournois, 22 listes ont été jouées, aucune n'a atteint le Top 8.`,
    gagne: `Chaque carte que vous bannissez amplifie Zed. Vous pouvez ensuite le désamplifier et l'épuiser pour défausser une carte, puis en piocher une. Votre main tourne sans cesse : vous écartez les cartes mortes et vous gardez les bonnes.

Ce moteur tourne grâce à **[[Stacked Deck]]**, dans 95 % des listes, qui vous laisse choisir une carte parmi trois. **[[Death Mark]]**, aussi dans 95 % des listes, ouvre le combat. **[[Traveling Merchant]]**, dans 82 % des listes, échange une carte à chacun de vos déplacements. Et **[[Zed, From the Shadows]]**, dans 68 % des listes, arrive avec un Clone d'Ombre quand vous le payez en défausse.`,
    plan: `**Début de partie.** Vous posez **[[Stacked Deck]]** pour choisir la bonne carte parmi trois. **[[Traveling Merchant]]**, dans 82 % des listes, échange une carte à chacun de vos déplacements. Votre main se met en ordre dès le départ.

**Milieu de partie.** **[[Death Mark]]**, dans 95 % des listes, ouvre le combat. Vous payez **[[Zed, From the Shadows]]** en défausse : il arrive avec un Clone d'Ombre. Deux menaces pèsent là où l'adversaire n'en attendait qu'une.

**Fin de partie.** **[[Perfect Execution]]**, dans 77 % des listes, prépare une unité et lui donne Assaut 3. C'est de quoi reprendre un champ de bataille perdu et marquer.

**Ce qui le bat.** Personne n'a fixé la liste : six Champions se partagent la place, aucun au-dessus de 68 %. Et bannir demande des cartes qui bannissent, or le deck n'en joue pas tant que ça. Résultat : 22 listes en treize tournois, aucun Top 8.`,
  },
  "ambessa-matriarch-of-war": {
    slug: "ambessa-matriarch-of-war",
    bref: `Ambessa, Matriarch of War joue les domaines Corps et Ordre, sur un archétype d'amplification et d'unités préparées. Difficulté moyenne. Sur 15 listes en 10 tournois, une seule place en Top 8, aucune victoire : conversion de 6,7 %.`,
    gagne: `Votre plan tient sur un mot : amplifier. Chaque fois que vous amplifiez une carte, votre Légende s'amplifie aussi. Ensuite, vous la désamplifiez, vous payez une Puissance et vous l'épuisez pour préparer une unité. Une unité préparée deux fois dans le tour attaque, puis défend : c'est elle qui marque vos points.

**[[Punch First]]** porte le moteur, dans 93 % des listes à deux exemplaires : elle donne +5 Puissance à une unité pour une seule énergie. **[[Legion Marauder]]** (87 %, trois exemplaires) et **[[Pit Rookie]]** (73 %, trois exemplaires) posent la pression et laissent un bonus derrière eux. En fin de partie, **[[Ambessa, The Wolf]]** amplifiée gagne +3 Puissance et ne peut plus être blessée hors combat.`,
    plan: `**Début de partie.** **[[Legion Marauder]]** et **[[Pit Rookie]]** posent la pression tôt et laissent un bonus derrière eux.

**Milieu de partie.** **[[Punch First]]** (93 %) donne +5 Puissance à une unité pour une énergie. Chaque amplification recharge votre Légende.

**Fin de partie.** **[[Ambessa, The Wolf]]** amplifiée gagne +3 Puissance et ne peut plus être blessée hors combat. Vous cherchez une unité préparée deux fois dans le tour, qui attaque puis défend.

**Ce qui le bat.** 15 listes en dix tournois, c'est trop peu pour parler d'un archétype installé. Sans autre carte à amplifier, votre Légende ne se recharge pas. Et le deck n'a qu'une menace à la fois, pas de plan de repli.`,
  },
  "nasus-curator-of-the-sands": {
    slug: "nasus-curator-of-the-sands",
    bref: `Nasus, Curator of the Sands joue en Calme et Esprit. Son archétype : poser des grosses unités payées deux fois. Difficulté moyenne. En vingt et un tournois, il aligne 125 listes et deux titres, dont Tianjin.`,
    gagne: `Quand vous jouez une unité, un équipement ou une capacité qui coûte 7 énergie ou plus, vous épuisez Nasus et vous préparez jusqu'à deux runes. Le gros coup se rembourse : vous payez cher, et la Légende vous rend de quoi continuer.

Ce plan tourne autour de **[[Thousand-Tailed Watcher]]**, dans 100 % des listes. À 7 énergie, elle baisse toutes les unités adverses de 3 Puissance et vous rend deux runes. **[[Defy]]**, aussi dans 100 % des listes, garde la réponse ouverte pendant que vous augmentez en énergie.`,
    plan: `**Début de partie.** **[[Scuttle Crab]]** (98 %) et **[[Ravenbloom Student]]** (82 %) tiennent le terrain pendant que **[[Defy]]** (100 %) et **[[Discipline]]** (98 %) gardent la réponse ouverte. Vous ne posez rien de gros avant 7 énergie : vous défendez et vous attendez.

**Milieu de partie.** À 7 énergie, **[[Thousand-Tailed Watcher]]** baisse toutes les unités adverses de 3 Puissance et vous rend deux runes grâce à la Légende. Vous posez votre première grosse carte, et le remboursement commence.

**Fin de partie.** **[[Astral Heron]]** (66 %) enchaîne au même coût. **[[Nasus, Ascended]]** (94 %) arrive à 8 énergie avec Protection 2. Votre but : poser une menace à 7 énergie ou plus par tour, sans jamais tomber à court de runes.

**Ce qui le bat.** Rien ne se déclenche sous 7 énergie, alors les premiers tours sont creux et un deck rapide en profite. La conversion est faible : 4,8 % contre 6,9 % pour le champ. Deux titres, mais très peu de Top 8 autour. Les terrains sont dispersés, aucun ne dépasse 54 % : le plan n'est pas stabilisé.`,
  },
  "akali-rogue-assassin": {
    slug: "akali-rogue-assassin",
    bref: `Akali joue en Furie et en Calme. Son archétype : mouvement et retrait ciblé. Le deck est Difficile à piloter. Sur Vendetta, 107 listes ont été jouées sur 21 tournois, pour une seule place en Top 8.`,
    gagne: `La Légende s'épuise pendant votre tour pour ramener une de vos unités engagées à la base, et la remettre prête si elle est amplifiée. En clair : vous retirez votre unité d'un combat perdu avant qu'il ne se résolve. L'unité survit et peut attaquer ailleurs.

Les cartes qui font tourner ce plan : **[[Shuriken Flip]]** (100 % des listes) inflige 2 dégâts et déplace une unité pour une énergie. **[[Defy]]** (100 % des listes) annule le sort adverse. **[[Stellacorn Herder]]** (92 % des listes) pioche à chaque déplacement. En fin de partie, **[[Akali, Silent]]** ne peut pas être choisie par les sorts adverses tant qu'elle n'est pas en combat, et gagne +2 Puissance en arrivant. Le but : marquer avec des unités que l'adversaire ne peut ni cibler ni coincer.`,
    plan: `**Début de partie.** **[[Scuttle Crab]]** (90 % des listes) et **[[Lonely Poro]]** (67 % des listes) occupent le terrain en piochant. **[[Shuriken Flip]]** (100 % des listes) inflige 2 dégâts et déplace une unité pour une énergie. Vous posez des unités et vous gardez les retraits pour les combats qui comptent.

**Milieu de partie.** **[[Stellacorn Herder]]** (92 % des listes) pioche à chaque déplacement, ce qui garde votre main pleine. La Légende sort votre unité du combat perdu avant qu'il ne se résolve. **[[Zhonya's Hourglass]]** (77 % des listes) protège une unité.

**Fin de partie.** **[[Akali, Silent]]** échappe aux sorts adverses tant qu'elle reste hors combat, et gagne +2 Puissance en arrivant. Vous marquez avec des unités que l'adversaire ne peut ni cibler ni coincer. C'est maintenant que le deck doit gagner.

**Ce qui le bat.** Retirer vos unités du combat ne marque aucun point : le deck se défend bien et gagne mal. 107 listes, vingt et un tournois, une seule place en Top 8 : 0,9 % de conversion, contre 6,9 % pour le champ. Sur ce volume, l'écart ne s'explique pas par la malchance.`,
  },
  "jayce-defender-of-tomorrow": {
    slug: "jayce-defender-of-tomorrow",
    bref: `Jayce est une Légende Esprit et Corps, un deck d'équipements préparés qui monte en ressources. La difficulté est moyenne. Sur 21 tournois, 101 listes ont été jouées pour 6 places en Top 8, soit 5,9 % de conversion.`,
    gagne: `Pour une énergie et un épuisement, Jayce prépare un équipement, c'est à dire le rend prêt à resservir. Amplifié, il en prépare deux d'un coup. Et un équipement qui produit des ressources sert deux fois par tour : chaque tour rapporte plus que le précédent.

**[[Bellows Breath]]** (94 % des listes) et **[[Elder Dragon]]** (93 %) sont le cœur du deck. **[[Mobilize]]** et **[[Catalyst of Aeons]]** canalisent des runes en avance, donc vous augmentez vite. En fin de partie, **[[Dazzling Aurora]]** (92 %) rejoue une unité gratuite en fin de tour, puis **[[Elder Dragon]]** arrive à 12 énergie et tue tout ce qu'il touche. Le but : atteindre les très gros coûts deux tours avant l'adversaire.`,
    plan: `**Début de partie.** **[[Platewyrm Egg]]** (89 %) et **[[Garbage Grabber]]** (92 %) posent la base. **[[Mobilize]]** et **[[Catalyst of Aeons]]** canalisent des runes en avance. **[[Sigil of the Storm]]** (86 %) vous fait tenir le temps de monter.

**Milieu de partie.** Jayce prépare les équipements déjà utilisés. Chaque tour rapporte plus de ressources que le précédent. Les équipements qui produisent des ressources servent deux fois par tour.

**Fin de partie.** **[[Dazzling Aurora]]** rejoue une unité gratuite en fin de tour. **[[Elder Dragon]]** arrive à 12 énergie et tue tout ce qu'il touche. Vous atteignez les très gros coûts deux tours avant l'adversaire.

**Ce qui le bat.** Un adversaire qui vous met sous pression tôt gagne avant que vos runes soient montées. Le deck est très joué mais rarement récompensé : 5,9 % de conversion, six Top 8 pour 101 listes. Et son seul Champion n'est dans que 48 % des listes, les pilotes ne s'accordent pas sur la liste.`,
  },
  "kennen-heart-of-the-tempest": {
    slug: "kennen-heart-of-the-tempest",
    bref: `Kennen est un deck **Ordre/Chaos** de **cimetière** : il joue ses cartes depuis partout sauf sa main. C'est le meilleur convertisseur du format, 12,1 % de Top 8 contre 6,9 % de moyenne, et le seul écart que le calcul confirme vraiment. C'est aussi un deck **difficile** : tout dépend de ce que vous remplissez, et du moment où vous le dépenses.`,
    gagne: `Chaque carte jouée ailleurs que depuis votre main amplifie Kennen. Désamplifie-le et épuise-le, et une unité gagne **Assaut 2** pour le tour. Le bonus ne vous coûte rien d'autre que d'avoir rempli votre cimetière avant.

**[[Rhasa the Sunderer]]** transforme ce remplissage en victoire : 10 d'énergie de base, une de moins par carte au cimetière. Le deck passe ses premiers tours à se défausser, puis pose une menace que personne ne paie au prix fort.`,
    plan: `**Début de partie.** **[[Lightning Rush]]** est dans toutes les listes, en trois exemplaires : elle pioche une carte sur trois et envoie les deux autres au cimetière. **[[Stacked Deck]]**, dans 98 % des listes, choisit ce qui tombe. Vous ne subissez pas votre cimetière, vous le construisez.

**Milieu de partie.** Les sorts rejoués depuis le cimetière amplifient la Légende sans rien coûter. C'est là que **[[Rhasa the Sunderer]]** devient payable, et que **[[Minefield]]** et **[[Zaun Warrens]]**, dans 90 % et 82 % des listes, pèsent sur les combats.

**Fin de partie.** **[[Fizz, Trickster]]** rejoue un sort du cimetière en arrivant, **[[Kennen, Storm of Shuriken]]** rend un sort rejouable après une conquête. L'Assaut 2 gratuit tranche le combat qui compte.

**Ce qui le bat.** Les départs rapides. Remplir prend des tours, et tant que rien n'est joué hors de votre main, la Légende reste désamplifiée et ne donne rien. Trois titres pour trente Top 8 : la meilleure conversion du format, mais le deck arrive plus souvent qu'il ne conclut.`,
  },
  "master-yi-wuju-bladesman": {
    slug: "master-yi-wuju-bladesman",
    bref: `Master Yi est un deck **Corps/Calme** de **contrôle de terrain**, classé parmi les meilleurs du format. C'est aussi l'un des meilleurs choix pour débuter en compétition : facile à prendre en main, difficile à mal jouer, et il vous apprend les fondamentaux du jeu, les combats, la pioche et l'interaction.`,
    gagne: `Il y a deux façons de marquer à Riftbound : conquérir un champ de bataille, ou le **contrôler**, c'est-à-dire commencer votre tour en tenant un terrain déjà conquis. Master Yi est bâti pour la seconde. Vous conquérez une fois, votre capacité rend la reconquête adverse presque impossible, et chaque tour vous rapporte un point.

La carte centrale est **[[Ruin Runner]]** : une unité à 6 d'énergie et 5 de Puissance que **les sorts et capacités adverses ne peuvent pas cibler**. En défense avec le +2 de la Légende, elle encaisse 7, ne part pas sur un retrait, et verrouille un terrain à elle seule. Ajoutez **[[Zhonya's Hourglass]]**, un équipement caché qui sauve une unité de la mort, et vous obtenez une position que l'adversaire ne sait pas comment franchir.`,
    plan: `**Début de partie.** Posez tôt un défenseur, comme **[[Scuttle Crab]]**, qui pioche et révèle la main adverse, ou **[[Lonely Poro]]**, et installez-vous sur un premier terrain. Les premiers tours servent à exister et à tenir, pas à tuer.

**Milieu de partie.** Déployez vos grosses unités, **[[Rengar, Trophy Hunter]]** puis **[[Ruin Runner]]**, et marquez en contrôlant. Vos réactions **[[Discipline]]** et **[[En Garde]]** gonflent un défenseur au bon moment et repiochent dans la foulée.

**Fin de partie.** Vous avez plus de cartes, des murs intuables et un terrain qui rapporte un point par tour. Il ne reste qu'à conserver le terrain : **[[Sabotage]]** retire la meilleure carte adverse, **[[Charm]]** déplace un attaquant gênant, **[[Defy]]** contre le sort qui renverserait tout.`,
  },
  "diana-scorn-of-the-moon": {
    slug: "diana-scorn-of-the-moon",
    bref: `Diana est un deck **Esprit/Chaos** d'**aggro-tempo**, parmi les tout meilleurs du format mais aussi l'un des plus exigeants. Énormément de décisions à chaque tour et une faible marge d'erreur : ce n'est pas un premier deck idéal, mais c'est l'un des plus intéressants à apprendre.`,
    gagne: `Une grande partie de Riftbound se joue en confrontation : quand deux armées se croisent sur un champ de bataille, chacun peut jouer des sorts pour prendre l'avantage au combat. Diana est faite pour gagner ces échanges. Vos unités grossissent dès que vous lancez un sort grâce à **[[Ravenbloom Student]]**, et vous disposez d'un arsenal de réactions à 1 d'énergie : **[[Gust]]** renvoie un attaquant, **[[Stupefy]]** affaiblit une unité, **[[Stacked Deck]]** vous trouve la bonne carte. À chaque combat, vous avez une réponse de plus que l'adversaire.`,
    plan: `**Début de partie.** Prenez le contrôle des premiers combats. Vos petites unités, gonflées par vos sorts, gagnent des échanges qu'elles ne devraient pas, et vous prenez la tête au score.

**Milieu de partie.** **[[Hwei, Brooding Painter]]** devient votre moteur : il pioche et défausse à chaque déplacement. **[[Moonfall]]** et **[[Star-Crossed]]** repositionnent vos unités pour transformer un combat perdu en combat gagné.

**Fin de partie.** Vous concluez avec ce que l'adversaire ne peut pas anticiper, un déplacement surprise ou un sort de tempo au bon moment. **[[Vex, Apathetic]]** limite les options adverses en fin de partie en punissant chaque unité déployée en face.`,
  },
  "irelia-blade-dancer": {
    slug: "irelia-blade-dancer",
    bref: `Irelia est un deck **Calme/Chaos** de **tempo**, l'un des plus solides et des mieux définis du format. Le pilotage demande un peu d'habitude, savoir quand protéger et quand pousser, mais le deck pardonne davantage que Diana tout en restant au plus haut niveau.`,
    gagne: `Irelia ne cherche pas à envahir le plateau : elle veut garder UNE menace et marquer avec. **[[Irelia, Fervent]]** grossit à chaque fois que vous la choisissez ou la préparez, et elle est difficile à viser puisque l'adversaire doit payer une rune de plus pour la cibler. Autour, vous jouez une muraille de réactions à 1 d'énergie : **[[Defy]]** contre un sort, **[[Discipline]]** et **[[Defiant Dance]]** gonflent votre défenseuse et repiochent, **[[Charm]]** déplace un attaquant. **[[Zhonya's Hourglass]]** sauve votre pièce maîtresse d'un combat perdu.`,
    plan: `**Début de partie.** Posez **[[Tideturner]]** et **[[Stellacorn Herder]]**, qui pioche à chaque déplacement, et gardez vos positions avec vos sorts bon marché.

**Milieu de partie.** Installez **[[Irelia, Fervent]]**, protégez-la avec vos contresorts et vos équipements cachés, et commencez à pousser des points en déplaçant vos unités au bon moment.

**Fin de partie.** Le timing fait tout : trop tôt, vous manquez de runes ; trop tard, l'adversaire s'installe. Quand la fenêtre s'ouvre, vous enchaînez mouvements et bonus, et vous concluez la partie d'un coup.`,
  },
  "leblanc-deceiver": {
    slug: "leblanc-deceiver",
    bref: `LeBlanc est un deck **Esprit/Ordre** à moteur d'**Agonie** : vos unités meurent, et chaque mort vous rapporte quelque chose. Accessible une fois le principe compris, c'est l'un des decks les plus clairs à faire tourner.`,
    gagne: `Avec LeBlanc, perdre une unité n'est jamais une mauvaise nouvelle. **[[Soaring Scout]]** vous rend une rune en mourant, **[[Watchful Sentry]]** vous fait piocher, **[[Ruined Rex]]** inflige 4 dégâts. Et **[[Karthus, Eternal]]** double tous ces déclenchements. Ajoutez **[[Sacrifice]]**, qui tue votre propre unité au bon moment pour réactiver les effets, et **[[Mirror Image]]**, qui crée des copies vouées à mourir, et vous obtenez un flot de valeur que l'adversaire ne peut pas tarir.`,
    plan: `**Début de partie.** Mettez en place vos petites unités d'Agonie et cherchez **[[Karthus, Eternal]]**, la pièce qui double tout.

**Milieu de partie.** Sacrifiez sans hésiter : chaque échange vous fait piocher et avancer. **[[Glasc Mixologist]]** rejoue une unité depuis la défausse, et le moteur s'emballe.

**Fin de partie.** Vous avez plus de cartes et plus de menaces que l'adversaire. **[[Harnessed Dragon]]** retire une unité en arrivant, **[[Vi, Peacekeeper]]** surgit en embuscade et étourdit, et vous concluez pendant qu'en face on manque de ressources.`,
  },
  "sivir-battle-mistress": {
    slug: "sivir-battle-mistress",
    bref: `Sivir est un deck **Corps/Chaos** de **rampe** construit autour de Dazzling Aurora. Le plan est clair, mais il faut bien gérer ses ressources et survivre à la phase de mise en place. Attention : depuis Xi'an, le méta s'est chargé en retrait d'équipement (Salvage, Turn to Dust, Adaptatron, Akshan) qui vise directement Aurora, donc les meilleures listes savent encore gagner sans dépendre uniquement de cette carte. Un deck adapté pour qui aime préparer ses ressources avant de prendre l'avantage en fin de partie.`,
    gagne: `Le plan tient en deux temps. D'abord, vous accélérez : **[[Mobilize]]**, **[[Catalyst of Aeons]]** et vos équipements bon marché vous donnent de l'avance sur l'énergie pendant que vous résistez. Ensuite, vous déployez **[[Dazzling Aurora]]**, qui invoque une grosse unité chaque tour et nettoie le plateau adverse, puis **[[Elder Dragon]]**, un finisher de 10 de Puissance dont les dégâts suffisent toujours à tuer. À ce stade, l'adversaire n'a plus les moyens de suivre.`,
    plan: `**Début de partie.** Résistez et accélérez. Vos sorts de rampe et vos équipements bon marché préparent le terrain pendant que vous gérez les premières unités adverses.

**Milieu de partie.** Piochez pour trouver **[[Dazzling Aurora]]** et installez-la. **[[Mindsplitter]]** retire la meilleure carte de la main adverse, **[[Sabotage]]** fait de même côté sorts.

**Fin de partie.** Aurora tourne, **[[Elder Dragon]]** verrouille les combats, et vous conquérez un plateau que personne ne peut vous disputer.`,
  },
  "azir-emperor-of-the-sands": {
    slug: "azir-emperor-of-the-sands",
    bref: `Azir est un deck **Calme/Ordre** de **jetons et équipements**, double vainqueur de Regional. Le plan est limpide et l'un des plus clairs à dérouler : c'est un bon deck pour qui aime voir un plateau se construire et déborder l'adversaire.`,
    gagne: `Le moteur d'Azir, ce sont ses équipements bon marché : **[[Soul Sword]]**, **[[B.F. Sword]]**, **[[Brutalizer]]**. Chacun déclenche la capacité de Légende et fait apparaître un Sand Soldier. Vous vous retrouvez vite avec plus d'unités que l'adversaire, et comme l'équipement passe d'une créature à l'autre, un seul arsenal sert toute votre armée. Pendant ce temps, **[[Defy]]** et **[[Discipline]]** protègent vos positions, et vous conquérez terrain après terrain.`,
    plan: `**Début de partie.** Posez vos premiers équipements pour lancer la machine à Sand Soldiers et occupez un champ de bataille.

**Milieu de partie.** Empilez l'équipement sur vos meilleures unités, transmettez-le au fil des combats, et commencez à conquérir sur deux fronts.

**Fin de partie.** Votre armée de soldats équipés est partout. **[[Deathgrip]]** vous permet de passer par-dessus un mur adverse pour aller chercher les derniers points, et l'empire se referme.`,
  },
  "ezreal-prodigal-explorer": {
    slug: "ezreal-prodigal-explorer",
    bref: `Ezreal est un deck **Esprit/Chaos** de **contrôle**, l'un des plus exigeants du format mais aussi l'un des plus puissants entre de bonnes mains. Ce n'est pas un deck pour débuter, c'est un deck pour progresser.`,
    gagne: `Tout tourne autour du ciblage. **[[Deadly Flourish]]** inflige des dégâts et laisse une récompense, **[[Stupefy]]** affaiblit, **[[Bellows Breath]]** répond. Chaque carte que vous visez côté adverse fait avancer votre capacité et vous fait piocher. **[[Fizz, Trickster]]** rejoue un sort depuis votre défausse, et vous finissez par enchaîner plus de réponses que l'adversaire n'a de menaces. Quand il n'a plus rien, vous conquérez le plateau vide.`,
    plan: `**Début de partie.** Installez votre économie et gérez les premières menaces sans vous précipiter : vos grosses cartes arrivent plus tard.

**Milieu de partie.** Prenez le contrôle avec **[[Deadly Flourish]]** et **[[Stacked Deck]]**, et commencez à piocher gratuitement en visant la main et le plateau adverses.

**Fin de partie.** Votre capacité tourne à plein, vous rejouez vos meilleurs sorts avec **[[Fizz, Trickster]]**, et l'adversaire n'a tout simplement plus les ressources pour suivre.`,
  },
  "fiora-grand-duelist": {
    slug: "fiora-grand-duelist",
    bref: `Fiora est un deck **Corps/Ordre** de **midrange**, régulièrement présent en Top 8. Le plan est direct et lisible : c'est un bon deck pour qui veut un style proactif sans la complexité des decks de contrôle.`,
    gagne: `L'idée est de rendre vos unités « puissantes », c'est-à-dire assez grosses pour franchir un seuil de Puissance. **[[Fiora, Victorious]]** devient alors quasi imprenable, avec protection, mobilité et bouclier d'un coup. **[[Akshan, Mischievous]]** attache des équipements à prix réduit, **[[Sett, Brawler]]** grossit à chaque conquête, et tout ce petit monde devient vite trop gros à gérer pour l'adversaire.`,
    plan: `**Début de partie.** Déployez vos premières unités et commencez à les renforcer pour viser le seuil de puissance.

**Milieu de partie.** **[[Fiora, Victorious]]** et **[[Sett, Brawler]]** prennent le contrôle des combats. Une fois « puissantes », vos unités encaissent et débordent.

**Fin de partie.** Vos menaces sont devenues impossibles à retirer proprement, et **[[Elder Dragon]]** vient sceller la partie en verrouillant les combats.`,
  },
  "vex-gloomist": {
    slug: "vex-gloomist",
    bref: `Vex est un deck **Calme/Chaos** de **contrôle défensif** bâti sur les cartes cachées et l'attrition. Exigeant à piloter, c'est l'un des meilleurs decks de tenue du format pour qui aime frustrer l'adversaire.`,
    gagne: `Le principe, c'est l'incertitude. **[[Tideturner]]**, **[[Evelynn, Entrancing]]** et **[[Edge of Night]]** se posent face cachée et se révèlent en réaction, au moment où ça fait le plus mal. L'adversaire ne sait jamais ce que vous tenez, donc il attaque mal. Autour, **[[Defy]]** contre ses sorts et **[[Discipline]]** renforce vos défenseurs. Vous ne perdez presque jamais un combat que vous avez décidé de gagner, et la partie s'étire à votre avantage.`,
    plan: `**Début de partie.** Installez **[[Tideturner]]** et vos unités clés sur un champ de bataille, et gardez-les en vie à tout prix.

**Milieu de partie.** Posez vos cartes face cachée et protégez vos positions avec vos réactions Calme. Chaque combat retourné vous donne l'avantage.

**Fin de partie.** L'adversaire s'est épuisé sur vos défenses. Vous prenez l'initiative au moment où il n'a plus de ressources et vous concluez.`,
  },
  "viktor-herald-of-the-arcane": {
    slug: "viktor-herald-of-the-arcane",
    bref: `Viktor est un deck **Esprit/Ordre** de **contrôle**, le plus dense en sorts du format. Exigeant et patient, il récompense les joueurs qui savent gérer leurs ressources et lire la partie sur la durée.`,
    gagne: `Viktor gagne par attrition. **[[Cull the Weak]]** et **[[Imperial Decree]]** nettoient le plateau, **[[Hidden Blade]]** élimine une menace en réaction. Et quand ses propres unités tombent, elles laissent quelque chose : **[[Carrion Dredger]]** invoque un oiseau, **[[Honest Broker]]** crée un équipement. Vous répondez, vous échangez et vous ressortez toujours avec une carte d'avance. À la fin, l'adversaire n'a plus de menaces et vous avez encore tout votre arsenal.`,
    plan: `**Début de partie.** Répondez aux premières menaces avec vos sorts bon marché et vos petites unités à valeur.

**Milieu de partie.** **[[Cull the Weak]]** et **[[Imperial Decree]]** prennent le contrôle du plateau pendant que **[[Card Sharp]]** alimente votre moteur.

**Fin de partie.** L'adversaire est à court de ressources. Vous posez une menace, **[[Vi, Peacekeeper]]** surgit pour étourdir, et vous conquérez tranquillement.`,
  },
  "rengar-pridestalker": {
    slug: "rengar-pridestalker",
    bref: `Rengar est un deck **Corps/Furie** d'**aggro** proactif basé sur l'embuscade. Facile à prendre en main, c'est un excellent deck pour qui aime dicter le rythme et mettre la pression sans relâche.`,
    gagne: `Le jeu de Rengar repose sur l'imprévu. **[[Nidalee, Cat Form]]**, **[[Grim Apothecary]]** et **[[Pyke, Dockside Butcher]]** se jouent en embuscade, en réaction, sur un champ de bataille où l'adversaire pensait être en sécurité. **[[Irresistible Faefolk]]** force ses unités à se déplacer pour créer des combats à votre avantage, et **[[Pit Rookie]]** renforce votre plateau. Vous prenez le lead tôt et vous ne le rendez plus.`,
    plan: `**Début de partie.** Prenez l'initiative avec vos petites unités agressives et installez-vous sur un champ de bataille.

**Milieu de partie.** Gardez des runes ouvertes et frappe en embuscade au pire moment pour l'adversaire. **[[Kai'Sa, Survivor]]** et **[[Pit Rookie]]** renforcent la poussée.

**Fin de partie.** L'adversaire ne peut pas anticiper vos attaques. Vous concluez la partie avec des unités qu'il n'a pas vues arriver.`,
  },
  "khazix-voidreaver": {
    slug: "khazix-voidreaver",
    bref: `Kha'Zix est un deck **Corps/Chaos** de **tempo** qui carbure à l'expérience. Un peu technique, mais intéressant : c'est une Légende sous-estimée qui récompense ceux qui la maîtrisent.`,
    gagne: `Le plan, c'est de gagner des combats pour gagner de l'XP, et de convertir cette XP en avantage. **[[Demacian Diplomat]]** active le plan, **[[Grim Resolve]]** offre +3 de Puissance pour remporter un échange, et **[[Void Assault]]** déplace vos unités et celles de l'adversaire pour créer la bonne confrontation. **[[Qiyana, Victorious]]** verrouille un terrain en résistant au retrait. Et quand vous conquérez, votre capacité ramène vos unités à l'abri, prêtes à recommencer.`,
    plan: `**Début de partie.** Gagne vos premiers combats pour accumuler de l'expérience et lancer vos capacités.

**Milieu de partie.** **[[Qiyana, Victorious]]** et vos unités renforcées prennent le contrôle. **[[Void Assault]]** met en place les échanges qui vous arrangent.

**Fin de partie.** Visez les deux champs de bataille : votre capacité protège vos unités après la conquête, ce qui rend la double poussée bien plus sûre qu'elle n'en a l'air.`,
  },
  "miss-fortune-bounty-hunter": {
    slug: "miss-fortune-bounty-hunter",
    bref: `Miss Fortune est un deck **Corps/Chaos** de **rampe** taillé autour de Dazzling Aurora et du Gank. Un peu technique, c'est un choix adapté pour qui aime les fins de partie décisives. Comme pour Sivir, le méta tech désormais le retrait d'équipement contre Aurora : elle reste forte en première partie, mais devient prévisible sur la durée d'un Bo3.`,
    gagne: `Comme Sivir, vous accélérez, vous résistez, et vous visez Dazzling Aurora pour invoquer des monstres chaque tour. La différence, c'est la finition : votre capacité donne le Gank, c'est-à-dire la possibilité de déplacer une unité d'un champ de bataille à l'autre. Une seule créature massive, comme **[[Baron Nashor]]** ou **[[Elder Dragon]]**, peut alors marquer sur deux terrains d'un coup. C'est souvent comme ça que tombe le huitième point.`,
    plan: `**Début de partie.** Résistez et accélérez avec **[[Mobilize]]** et vos équipements bon marché.

**Milieu de partie.** Trouvez **[[Dazzling Aurora]]**, installez-la, et commencez à déployer vos monstres pendant que **[[Flurry of Blades]]** nettoie les petites unités adverses.

**Fin de partie.** Lance le Gank sur une grosse unité pour conquérir deux champs de bataille dans le même tour, et referme la partie d'un coup.`,
  },
  "draven-glorious-executioner": {
    slug: "draven-glorious-executioner",
    bref: `Draven est un deck **Chaos/Furie** de **midrange** explosif, roi du set précédent et toujours dangereux. Accessible et agressif, c'est un bon deck pour qui aime mettre la pression tout en gardant la main pleine.`,
    gagne: `La capacité centrale est la capacité de Draven : gagne un combat, pioche une carte. Vos unités de milieu de partie comme **[[Darius, Trifarian]]** et **[[Noxus Hopeful]]** dominent les échanges, **[[Spinning Axe]]** s'attache gratuitement pour gonfler un attaquant, et chaque combat remporté vous donne une avance en cartes. L'adversaire ne peut pas se permettre de vous combattre, ni de vous laisser tranquille.`,
    plan: `**Début de partie.** Développez vos unités et imposez des combats que vous pouvez gagner pour lancer la pioche.

**Milieu de partie.** **[[Darius, Trifarian]]** et **[[Noxus Hopeful]]** prennent le contrôle du plateau. Chaque échange gagné vous rapporte une carte.

**Fin de partie.** Votre avance en cartes finit par étouffer l'adversaire. Vous attaquez les derniers points pendant qu'il manque de ressources.`,
  },
  "sett-the-boss": {
    slug: "sett-the-boss",
    bref: `Sett est un deck **Corps/Ordre** de **midrange** résistant. Exigeant à piloter mais au plafond très élevé, c'est une Légende pour les joueurs qui aiment bâtir un plateau impossible à démanteler.`,
    gagne: `Tout repose sur la résilience. Vos unités sont renforcées en permanence par **[[Pit Rookie]]**, **[[Arena Bar]]** et **[[Showstopper]]**, et quand l'une tombe, la capacité de Sett la rappelle. **[[Fiora, Victorious]]** et **[[Rengar, Trophy Hunter]]** deviennent des menaces que l'adversaire ne peut pas retirer durablement, et **[[Punch First]]** vole les combats serrés. Votre puissance totale grimpe tour après tour, jusqu'à déborder.`,
    plan: `**Début de partie.** Déployez vos unités et commencez à les renforcer dès que possible.

**Milieu de partie.** Tenez vos positions avec des créatures massives. Chaque unité rappelée par la capacité de Sett relance votre avantage.

**Fin de partie.** Votre plateau est devenu ingérable : les unités reviennent toujours, plus grosses. Vous conquérez et vous gardez.`,
  },
  "ahri-nine-tailed-fox": {
    slug: "ahri-nine-tailed-fox",
    bref: `Ahri est un deck **Calme/Esprit** de **contrôle** très dense en sorts. Exigeant, flexible et adaptable au méta local, c'est une Légende pour les joueurs qui aiment réfléchir à chaque échange.`,
    gagne: `Le plan, c'est de transformer chaque sort en avantage. **[[Ravenbloom Student]]** grossit dès que vous lancez un sort, **[[Sona, Harmonious]]** relance vos runes pour que vous n'ayez jamais à choisir entre vous défendre et vous développer. Vos défenseurs tanky, comme **[[Blue Sentinel]]**, tiennent les champs de bataille pendant que **[[Defy]]** et vos réactions repoussent les assauts. Vous accumulez la valeur, et vous conquérez une fois l'adversaire à sec.`,
    plan: `**Début de partie.** Posez vos petites unités et commencez à accumuler des sorts en main.

**Milieu de partie.** **[[Blue Sentinel]]** et vos défenseurs tiennent le plateau pendant que **[[Sona, Harmonious]]** garde vos runes disponibles.

**Fin de partie.** Vous épuisez l'adversaire sous les réponses et vous conquérez les positions qu'il ne peut plus défendre.`,
  },
  "lillia-bashful-bloom": {
    slug: "lillia-bashful-bloom",
    bref: `Lillia est un deck **Calme/Esprit** de **tempo** bâti sur ses jetons Sprites. Accessible et malin, c'est un deck qui récompense ceux qui aiment gagner la partie un petit avantage à la fois.`,
    gagne: `Le cœur du deck, ce sont les Sprites. **[[Sprite Fountain]]** et vos générateurs créent des jetons de 3 de Puissance qui entrent prêts, donc immédiatement menaçants. L'adversaire perd de vraies cartes pour les arrêter, ou encaisse des conquêtes. Pendant ce temps, **[[Ravenbloom Student]]** grossit à chaque sort, **[[Charm]]** déplace un attaquant gênant, et **[[Thousand-Tailed Watcher]]** vient conclure. Vous marquez en continu sur des échanges toujours favorables.`,
    plan: `**Début de partie.** Gardez votre première unité hors des combats et laissez l'adversaire choisir ses échanges : vos Sprites arrivent vite.

**Milieu de partie.** Générez des Sprites tour après tour. Chaque jeton échangé contre une vraie unité adverse est une victoire.

**Fin de partie.** Continue de produire des jetons et conclus avec **[[Thousand-Tailed Watcher]]** pendant que l'adversaire s'épuise.`,
  },
  "leona-radiant-dawn": {
    slug: "leona-radiant-dawn",
    bref: `Leona est un deck **Calme/Ordre** de **midrange** défensif. Facile à prendre en main, avec un noyau très consistant, c'est un bon deck pour apprendre à défendre et à retourner les combats.`,
    gagne: `Leona gagne en transformant chaque combat en piège. **[[Call to Glory]]** se joue en réaction pour rallier vos unités au pire moment pour l'adversaire, et **[[Zhonya's Hourglass]]** sauve votre pièce clé d'un échange perdu. Vos défenseurs, comme **[[Vi, Peacekeeper]]** qui surgit et étourdit, tiennent les champs de bataille pendant que **[[Stellacorn Herder]]** fait tourner votre main. Vous avancez prudemment et vous punissez chaque attaque mal calculée.`,
    plan: `**Début de partie.** Établissez votre plateau avec **[[Scuttle Crab]]** et vos petites unités, et gardez une réponse cachée en réserve.

**Milieu de partie.** **[[Vi, Peacekeeper]]** et vos défenseurs prennent le contrôle des combats. **[[Call to Glory]]** retourne un échange que l'adversaire pensait gagné.

**Fin de partie.** Vous défendez vos positions conquises avec vos réponses fourrés et vous marquez régulièrement jusqu'à conclure.`,
  },
  "ornn-fire-below-the-mountain": {
    slug: "ornn-fire-below-the-mountain",
    bref: `Ornn est un deck **Calme/Esprit** centré sur les **équipements**, le plus dense en gear du jeu. Exigeant mais consistant grâce à son large noyau, c'est une Légende pour qui aime bâtir une machine.`,
    gagne: `Le plan, c'est l'accumulation. Vos équipements bon marché, **[[Poro Snax]]**, **[[Seal of Focus]]**, **[[Brutalizer]]**, posent les bases tout en piochant et en générant des ressources. **[[Pit Crew]]** se prépare à chaque équipement joué et devient une présence constante. Au fil des tours, vous empilez tellement de gear sur vos unités, **[[Thousand-Tailed Watcher]]** en tête, qu'elles deviennent impossibles à arrêter, et **[[Consult the Past]]** vous permet de tout recycler.`,
    plan: `**Début de partie.** Posez vos équipements bon marché pour installer le plateau, piocher et accumuler des ressources.

**Milieu de partie.** **[[Pit Crew]]** s'active à chaque gear et vos unités commencent à grossir. Protégez votre mise en place.

**Fin de partie.** Vos unités croulent sous l'équipement et deviennent intuables. Vous gagnez les combats et vous conquérez.`,
  },
  "teemo-swift-scout": {
    slug: "teemo-swift-scout",
    bref: `Teemo est un deck **Esprit/Chaos** de **tempo** basé sur les cartes cachées. Exigeant à piloter, c'est une Légende qui récompense la ruse et la lecture de l'adversaire.`,
    gagne: `Comme Diana, Teemo enchaîne les sorts bon marché pour gagner les combats, mais il y ajoute une couche de bluff. **[[Tideturner]]** et ses cartes cachées créent une incertitude permanente : l'adversaire ne sait jamais ce que vous tenez en réserve. **[[Ravenbloom Student]]** grossit à chaque sort, **[[Gust]]** et **[[Stupefy]]** retournent les échanges, et **[[Hwei, Brooding Painter]]** fait tourner votre main. Vous prenez la tête tôt et vous gardez l'adversaire dans le flou.`,
    plan: `**Début de partie.** Prenez l'avantage avec vos petites unités gonflées par vos sorts, et posez vos premières cartes cachées.

**Milieu de partie.** **[[Hwei, Brooding Painter]]** alimente votre main pendant que vos menaces cachées dissuadent l'adversaire d'attaquer.

**Fin de partie.** Vous concluez avec ce qu'il n'a pas vu venir : une réaction cachée au bon moment, et les derniers points tombent.`,
  },
  "volibear-relentless-storm": {
    slug: "volibear-relentless-storm",
    bref: `Volibear est un deck **Corps/Furie** de **rampe** à grosses unités. Facile à prendre en main, c'est un bon deck pour qui aime accélérer et claquer des menaces démesurées.`,
    gagne: `Le plan tient en deux temps : accélérer, puis frapper fort. **[[Mobilize]]** et **[[Catalyst of Aeons]]** vous donnent de l'avance sur l'énergie, et **[[Gentle Gemdragon]]** relance vos runes dès que vous posez un dragon. Vous jouez ensuite **[[Kadregrin the Infernal]]** et **[[Elder Dragon]]**, des finishers que personne ne bat en combat. **[[Sabotage]]** retire la réponse adverse avant qu'elle ne pose problème, et vous contrôlez le plateau.`,
    plan: `**Début de partie.** Accélérez votre énergie avec vos sorts de rampe et tenez le coup face aux premières unités adverses.

**Milieu de partie.** **[[Gentle Gemdragon]]** lance la cascade de dragons et vous permet de jouer vos menaces bien plus tôt que prévu.

**Fin de partie.** **[[Kadregrin the Infernal]]** et **[[Elder Dragon]]** verrouillent les combats. L'adversaire n'a pas les moyens de répondre, vous conquérez.`,
  },
  "master-yi-wuju-master": {
    slug: "master-yi-wuju-master",
    bref: `Master Yi, Wuju Master est un deck **Corps/Calme** de **montée en niveau** (Hunt), une variante de niche à ne pas confondre avec le Bladesman. Difficile et un peu casse-gueule, c'est un deck pour qui aime les plans à fort potentiel.`,
    gagne: `Tout repose sur l'expérience. Vos unités à Chasse, comme **[[Mosstomper]]** et **[[Master Yi, Tempered]]**, gagnent de l'XP en conquérant et en tenant les champs de bataille, et **[[Herald of Spring]]** en offre d'entrée. À mesure que vous augmentez en niveau, vos unités deviennent plus grosses, puis entrent prêtes : aux paliers les plus élevés, c'est toute votre armée qui frappe sans s'épuiser, un plateau difficile à contenir. **[[Concentrate]]** repioche pour entretenir la pression.`,
    plan: `**Début de partie.** Déployez vos unités à Chasse et commencez à accumuler de l'expérience en tenant les champs de bataille. Attention, vous n'avez pas d'avantage immédiat : il faut survivre.

**Milieu de partie.** Atteins les premiers paliers : vos unités gagnent en puissance et deviennent plus dures à retirer.

**Fin de partie.** Au palier maximal, toute votre armée entre prête et renforcée. À ce stade, l'adversaire ne peut plus suivre le rythme.`,
  },
  // ── Legendes ajoutees le 22 juillet 2026 ──────────────────────────────────
  // Ecrits a partir de la capacite reelle de chaque Legende et des cartes coeur
  // mesurees sur les decklists de tournoi (data/fiches/*.json). Les taux de jeu
  // cites viennent du comptage, pas d'une impression.
  "kaisa-daughter-of-the-void": {
    slug: "kaisa-daughter-of-the-void",
    bref: `Kai'Sa est un deck **Furie/Esprit** de **tempo par les sorts**, et accessoirement la Légende la plus jouée de toute l'histoire du jeu : plus de 3 000 listes recensées et 147 top 8. Si vous ne sais pas quoi jouer, c'est le choix par défaut du format, et ce n'est pas un hasard.`,
    gagne: `Sa capacité tient en une ligne : épuise-la et vous obtenez une rune, mais uniquement pour lancer un sort. Autrement dit, vous avez chaque tour un sort presque gratuit de plus que l'adversaire. Tout le deck est bâti là-dessus.

Le résultat, c'est un deck qui répond à tout. **[[Falling Star]]** inflige 3 dégâts deux fois, de quoi nettoyer deux petites unités ou en abattre une grosse. **[[Hextech Ray]]** frappe à distance sur un champ de bataille. **[[Stupefy]]** affaiblit et repioche pour une énergie. Et quand vous voulez reprendre la main d'un coup, **[[Thousand-Tailed Watcher]]** arrive avec 7 de Puissance et retire 3 à toutes les unités adverses.`,
    plan: `**Début de partie.** Ne vous précipitez pas. Posez **[[Watchful Sentry]]** ou **[[Lecturing Yordle]]**, qui piochent en mourant ou en arrivant, et laissez l'adversaire s'engager le premier.

**Milieu de partie.** C'est là que vous prenez le dessus. Chaque combat où vous lancez un sort de plus se gagne, et votre capacité vous en offre un. **[[Retreat]]** sauve une unité condamnée et vous rend une rune au passage.

**Fin de partie.** **[[Thousand-Tailed Watcher]]** remet le plateau à plat, **[[Darius, Trifarian]]** se prépare tout seul dès que vous jouez votre deuxième carte du tour. Vous concluez avec une avance en cartes que l'adversaire n'a jamais comblée.`,
  },
  "annie-dark-child": {
    slug: "annie-dark-child",
    bref: `Annie est un deck **Furie/Chaos** de **mouvement**, et l'une des meilleures affaires du format : 540 listes recensées seulement, mais 29 top 8 et 6 victoires, un rendement que peu de Légendes plus jouées atteignent.`,
    gagne: `Sa capacité prépare jusqu'à deux runes à la fin de votre tour. Concrètement, vous jouez pendant le tour adverse avec des ressources que les autres n'ont plus. C'est une invitation à remplir votre deck de réactions et à ne jamais rester passif.

Le reste du deck sert à déplacer les unités, les tiennes comme celles d'en face. **[[Fight or Flight]]** et **[[Flash]]** renvoient des unités à la base, **[[Rebuke]]** en renvoie une carrément en main, **[[Ride the Wind]]** repositionne au bon moment. Un champ de bataille que l'adversaire croyait tenir se vide juste avant qu'il ne marque.`,
    plan: `**Début de partie.** Développez sans vous exposer. **[[Traveling Merchant]]** échange une carte morte contre une neuve à chaque déplacement, **[[Stacked Deck]]** va chercher la pièce manquante.

**Milieu de partie.** Choisissez vos combats et refusez les autres. Vous n'avez pas besoin de gagner un affrontement : sortir votre unité au dernier moment suffit à annuler celui de l'adversaire.

**Fin de partie.** **[[Kai'Sa, Survivor]]** pioche quand elle conquiert, **[[Vi, Destructive]]** passe d'un terrain à l'autre pour aller chercher le point qui manque. Gardez toujours deux runes prêtes : c'est ce qui rend vos fins de partie imprévisibles.`,
  },
  "darius-hand-of-noxus": {
    slug: "darius-hand-of-noxus",
    bref: `Darius est un deck **Furie/Ordre** d'**agression en série**, construit autour du mot-clé Légion. 304 listes, 13 top 8 : régulier en haut de tableau, mais toujours pas de titre à son palmarès.`,
    gagne: `Sa capacité vous rend une énergie dès que vous avez déjà joué une carte dans le tour. Le deck entier récompense la même chose : enchaîner. **[[Noxus Hopeful]]** coûte deux énergies de moins si ce n'est pas votre première carte du tour, **[[Vanguard Captain]]** amène deux recrues avec lui dans les mêmes conditions.

Vous ne cherchez pas à survivre longtemps, vous cherchez à poser plus de corps que l'adversaire ne peut en gérer, puis à convertir. **[[Cleave]]** ajoute 3 de Puissance à un attaquant, **[[Grand Strategem]]** en ajoute 5 à toute votre armée d'un coup : le combat que l'adversaire pensait tenir est perdu d'avance.`,
    plan: `**Début de partie.** Visez deux cartes par tour dès que possible. Une seule carte jouée, et la moitié de votre deck fonctionne au tarif plein.

**Milieu de partie.** Saturez un champ de bataille. **[[Hidden Blade]]**, posée face cachée, retire gratuitement le défenseur qui bloquait tout, même en plein combat.

**Fin de partie.** **[[Grand Strategem]]** est votre carte de finition : gardez-la pour le tour où l'adversaire s'est enfin stabilisé, et retirez le verrou d'un seul sort.`,
  },
  "reksai-void-burrower": {
    slug: "reksai-void-burrower",
    bref: `Rek'Sai est un deck **Furie/Ordre** d'**agression qui pioche dans son deck**. 110 listes sur le format, neuf Top 8 et deux deuxièmes places : 8,2 % de conversion contre 6,9 % pour le champ. C'est un choix de joueur qui connaît son deck, pas un choix par défaut.`,
    gagne: `Chaque fois que vous conquérez, vous pouvez l'épuiser pour révéler les deux cartes du dessus de votre deck, en bannir une et la jouer aussitôt. Conquérir ne vous rapporte donc pas qu'un point : ça vous rapporte une carte gratuite. Plus vous avancez, plus vous accédez aux cartes suivantes.

**[[Void Rush]]** fait la même chose pour deux énergies, en réduisant le coût de ce que vous jouez. Et **[[Undertitan]]**, révélé depuis votre deck, ajoute deux énergies au lieu de vous en coûter. Le deck s'auto-alimente tant que vous continuez d'attaquer.`,
    plan: `**Début de partie.** Prenez vite un terrain vite. Sans conquête, votre capacité ne sert à rien et le deck tourne à vide.

**Milieu de partie.** Enchaîne conquête et révélation. **[[Noxus Hopeful]]** à quatre énergies, souvent deux, remplit le plateau pendant que **[[Falling Star]]** et **[[Cleave]]** dégagent ce qui gêne.

**Fin de partie.** **[[Cull the Weak]]** oblige chacun à sacrifier une unité : jouez-la quand l'adversaire n'a qu'une seule grosse pièce et que vous en avez cinq petites.`,
  },
  "pyke-bloodharbor-ripper": {
    slug: "pyke-bloodharbor-ripper",
    bref: `Pyke est un deck **Furie/Chaos** de **rebond et de ressources**. 206 listes pour 7 top 8, l'un des meilleurs rendements des Légendes discrètes du format.`,
    gagne: `Sa capacité renvoie une de vos unités en main et vous donne un jeton d'or au passage. Ça a l'air défensif, c'est en réalité un moteur : vous sauvez une unité d'un combat perdu, vous récupérez son effet d'arrivée pour plus tard, et vous gagnez une ressource.

Autour, tout tourne autour du même geste. **[[Star-Crossed]]** renvoie une de vos unités et une unité adverse en main. **[[Treasure Hunter]]** crée de l'or à chaque déplacement. **[[Fizz, Trickster]]** rejoue un sort depuis votre défausse sans payer son énergie. Vous jouez deux fois ce que l'adversaire ne joue qu'une.`,
    plan: `**Début de partie.** Posez des unités bon marché à effet d'arrivée. Elles vaudront double quand vous les renverrez en main.

**Milieu de partie.** Refusez les échanges défavorables : au lieu de perdre une unité, reprenez-la. **[[Bewitching Spirit]]** vide la main adverse pendant que vous augmentez votre réserve d'or.

**Fin de partie.** **[[Mindsplitter]]** arrache la carte que l'adversaire gardait pour vous répondre. Une fois sa réponse partie, vous posez votre menace et vous marquez.`,
  },
  "jax-grandmaster-at-arms": {
    slug: "jax-grandmaster-at-arms",
    bref: `Jax est un deck **Calme/Corps** d'**équipement mobile**. 222 listes, 5 top 8 : jouable, jamais dominant. Un deck de patience plus que de pression.`,
    gagne: `Sa capacité déplace votre équipement d'une unité à l'autre, même déjà attaché. Vous n'avez donc pas besoin de protéger l'unité équipée : si elle meurt, l'équipement repart ailleurs. La menace, c'est le matériel, pas le porteur.

À partir de là, le deck protège ses unités avec ses réactions. **[[Guardian Angel]]** et **[[Brutalizer]]** s'attachent pour une seule rune Calme, et la muraille de réactions fait le reste : **[[Counter Strike]]** empêche les prochains dégâts et repioche, **[[Not So Fast]]** contre tout ce qui vise vos unités ou votre équipement, **[[Defy]]** contre le reste.`,
    plan: `**Début de partie.** Équipez une unité bon marché et installez-vous sur un terrain. Vous n'avez pas besoin d'aller vite.

**Milieu de partie.** Faites payer chaque tentative de retrait. Entre **[[Counter Strike]]**, **[[Not So Fast]]** et **[[Discipline]]**, l'adversaire doit dépenser deux ou trois cartes pour en tuer une seule.

**Fin de partie.** **[[Challenge]]** force un duel entre votre unité équipée et la leur : à ce stade la tienne est plus grosse, et l'échange est gagné d'avance.`,
  },
  "lucian-purifier": {
    slug: "lucian-purifier",
    bref: `Lucian est un deck **Furie/Corps** d'**équipement agressif**. 266 listes, 2 top 8 seulement : le plan de jeu est clair, mais il convertit mal face aux decks qui savent retirer les unités.`,
    gagne: `Sa capacité donne Assaut à tous vos équipements : chaque unité équipée frappe plus fort en attaque. Vous n'équipez donc pas pour survivre, vous équipez pour marquer.

**[[Relentless Pursuit]]**, présente dans la totalité des listes, déplace une unité, y attache un équipement et lui permet de rentrer à la base après avoir conquis. Vous attaquez sans vous exposer au retour de bâton. **[[Lucian, Merciless]]** s'équipe à coût réduit en arrivant et se prépare la première fois qu'il conquiert chaque tour.`,
    plan: `**Début de partie.** Posez une unité et un équipement bon marché, **[[Doran's Blade]]** pour une seule rune Corps, et commencez à pousser.

**Milieu de partie.** **[[First Mate]]** prépare une autre unité en arrivant, ce qui vous donne deux attaques dans le même tour. **[[Punch First]]** ajoute 5 de Puissance pour une énergie et vole les combats que l'adversaire croyait perdus.

**Fin de partie.** **[[Challenge]]** nettoie le dernier défenseur en le forçant à échanger avec votre unité équipée. Attention : tout votre plan repose sur des unités qui portent le matériel, et un retrait bien placé vous coûte deux cartes d'un coup.`,
  },
  "garen-might-of-demacia": {
    slug: "garen-might-of-demacia",
    bref: `Garen est un deck **Corps/Ordre** de **rampe et de nombre**. 125 listes, 1 top 8 : une Légende de fin de partie, lente à démarrer et vulnérable en attendant.`,
    gagne: `Sa capacité récompense la masse : conquérez un champ de bataille avec au moins quatre unités dessus et vous piochez deux cartes. Ce n'est pas un deck qui frappe fort, c'est un deck qui frappe nombreux.

Avant ça, vous augmentez vos ressources. **[[Mobilize]]** et **[[Catalyst of Aeons]]** canalisent des runes en avance, et vous font piocher quand vous ne pouvez plus. Au bout, **[[Dazzling Aurora]]** pose une unité gratuite à chaque fin de tour, indéfiniment.`,
    plan: `**Début de partie.** Résistez et canalisez. Vos premiers tours ne marquent rien, ils préparent la suite.

**Milieu de partie.** Déployez large plutôt que gros. **[[Confront]]** fait entrer prêtes toutes les unités que vous posez ce tour et repioche : c'est votre tour de bascule.

**Fin de partie.** Avec **[[Dazzling Aurora]]** en jeu, vous produisez plus vite que l'adversaire ne nettoie. **[[Harnessed Dragon]]** tue une unité en arrivant et referme la partie.`,
  },
  "lux-lady-of-luminosity": {
    slug: "lux-lady-of-luminosity",
    bref: `Lux est un deck **Esprit/Ordre** de **contrôle par les gros sorts**. 293 listes, 6 top 8 : elle répond à tout, mais elle a du mal à conclure avant que le temps ne tombe.`,
    gagne: `Sa capacité vous fait piocher chaque fois que vous lancez un sort à cinq énergies ou plus. Là où un deck normal se ruine à jouer cher, Lux se rembourse. Son deck est donc rempli de sorts que personne d'autre ne peut se permettre.

**[[Singularity]]** inflige 6 dégâts à deux unités d'un coup. **[[Imperial Decree]]** tue tout ce qui subit le moindre dégât pendant le tour. **[[Falling Comet]]** et **[[Drag Under]]** règlent les menaces isolées. Et **[[Time Warp]]**, à dix énergies, vous donne carrément un tour de plus.`,
    plan: `**Début de partie.** Vous allez concéder des points, c'est normal. Gardez **[[Bellows Breath]]** et **[[Cull the Weak]]** pour contenir les premières vagues à moindre coût.

**Milieu de partie.** Nettoyez le plateau au bon moment. Un **[[Singularity]]** sur deux unités bien choisies annule trois tours de développement adverse.

**Fin de partie.** C'est votre phase. Chaque gros sort repioche, vous enchaînez les réponses, et **[[Time Warp]]** vous donne le tour supplémentaire qui transforme l'avantage en victoire. Le vrai risque n'est pas de perdre le plateau, c'est de manquer de temps.`,
  },
  "renata-glasc-chem-baroness": {
    slug: "renata-glasc-chem-baroness",
    bref: `Renata Glasc est un deck **Esprit/Ordre** de **contrôle par les ressources**. Soyons honnêtes : 134 listes recensées et **aucun top 8**. Le deck est plaisant à piloter, mais il n'a rien prouvé en compétition.`,
    gagne: `Sa capacité fabrique de l'or dès que vous ou un allié contrôlez un terrain, et cet or rapporte une énergie de plus quand vous approchez du score de victoire. Vous jouez donc de plus en plus vite à mesure que la partie avance.

Le deck accumule les jetons d'or par tous les bouts : **[[Plundering Poro]]** en crée en conquérant, **[[Honest Broker]]** en laisse un en mourant, **[[Wages of Pain]]** en donne un en retirant une unité. Puis vous convertissez, souvent brutalement, avec **[[Hostile Takeover]]** qui prend le contrôle d'une unité adverse et l'active aussitôt.`,
    plan: `**Début de partie.** Tenez un terrain, même modeste. Sans contrôle, votre capacité ne se déclenche jamais.

**Milieu de partie.** Accumulez l'or et retire les menaces avec **[[Hidden Blade]]** et **[[Cull the Weak]]**. Vous ne cherchez pas à dominer le plateau, seulement à ne pas mourir.

**Fin de partie.** Près du score de victoire, votre or vaut double. **[[Hostile Takeover]]** puis **[[Time Warp]]** enchaînés dans le même tour sont votre meilleure fin de partie.`,
  },
  "yasuo-unforgiven": {
    slug: "yasuo-unforgiven",
    bref: `Yasuo est un deck **Calme/Chaos** de **repositionnement**. 366 listes pour 2 top 8 : très choisi, très rarement payant. À jouer parce qu'il vous plaît, pas parce qu'il gagne.`,
    gagne: `Sa capacité déplace une unité amie vers sa base ou depuis sa base, pour deux énergies. Vous pouvez donc retirer un défenseur d'un combat perdu, ou en faire surgir un là où l'adversaire ne l'attendait pas.

Le reste est un socle de réactions solide mais sans surprise : **[[Defy]]** contre les sorts, **[[Discipline]]** et **[[En Garde]]** gonflent une unité et repiochent, **[[Zhonya's Hourglass]]** sauve une unité de la mort en la renvoyant à la base.`,
    plan: `**Début de partie.** Posez peu, gardez vos énergies. La force du deck, c'est de réagir.

**Milieu de partie.** Servez-vous de votre capacité comme d'un sort gratuit : chaque combat que vous refusez au dernier moment est une carte gagnée.

**Fin de partie.** **[[Fight or Flight]]**, posée face cachée en avance, se joue pour rien et vide un terrain au moment décisif. Le problème du deck reste le même : il sait ne pas perdre, il sait mal gagner.`,
  },
  "jinx-loose-cannon": {
    slug: "jinx-loose-cannon",
    bref: `Jinx est un deck **Furie/Chaos** d'**agression main vide**. 325 listes, 3 top 8 : le plan est direct et amusant, le rendement reste faible.`,
    gagne: `Sa capacité vous fait piocher au début de votre tour si vous avez une carte ou moins en main. Vider sa main n'est donc pas une faiblesse ici, c'est la condition pour continuer à jouer.

Tout le deck consomme des cartes volontiers. **[[Chemtech Enforcer]]** défausse en arrivant, **[[Traveling Merchant]]** défausse et repioche à chaque déplacement, et **[[Super Mega Death Rocket!]]** revient de la défausse quand vous conquérez, contre une défausse de plus.`,
    plan: `**Début de partie.** Jouez tout. Garder des cartes en main coupe votre pioche et ralentit le deck.

**Milieu de partie.** Attaquez un terrain et conquérez pour ramener le missile. **[[Noxus Hopeful]]** à coût réduit remplit le plateau au passage.

**Fin de partie.** Vous finissez souvent la main vide face à un adversaire qui a des réponses. C'est le défaut de structure du deck : votre pioche est régulière mais lente, et une carte par tour ne suffit pas face à un contrôle installé.`,
  },
  "lee-sin-blind-monk": {
    slug: "lee-sin-blind-monk",
    bref: `Lee Sin est un deck **Calme/Corps** de **renfort progressif**. 265 listes pour 3 top 8 : honnête en partie libre, en retrait en compétition.`,
    gagne: `Sa capacité renforce une unité amie chaque tour pour une énergie. Ce n'est pas décisif, mais c'est gratuit et ça s'accumule : une unité renforcée deux ou trois fois devient un mur que peu de decks savent franchir.

Autour, vous protégez cette pièce. **[[Zhonya's Hourglass]]** la sauve d'une mort certaine, **[[Defy]]** contre le sort qui la viserait, **[[Discipline]]** ajoute 2 de Puissance et repioche au moment du combat.`,
    plan: `**Début de partie.** Posez une unité que vous comptez garder longtemps et commencez à la renforcer dès que vous avez une énergie de libre.

**Milieu de partie.** **[[First Mate]]** et **[[Pit Rookie]]** vous donnent une deuxième action dans le tour, l'un en préparant une unité, l'autre en renforçant.

**Fin de partie.** **[[Charm]]** déplace le défenseur adverse hors du terrain que vous convoitez, et votre unité renforcée conquiert seule. Le point faible reste la lenteur : contre un deck qui marque tôt, vous renforcez une unité pendant qu'il prend des points.`,
  },
  "rumble-mechanized-menace": {
    slug: "rumble-mechanized-menace",
    bref: `Rumble est un deck **Furie/Esprit** **tribal Mechs**, le plus thématique du format. 210 listes, 1 top 8 : un deck de passionné, pas un choix de tournoi.`,
    gagne: `Sa capacité donne Bouclier à tous vos Mechs : ils gagnent en Puissance quand ils défendent. Chaque autre carte du deck empile un bonus supplémentaire sur la même famille. **[[Rumble, Scrapper]]** ajoute 1 de Puissance à tous les Mechs, **[[Rumble, Hotheaded]]** leur donne Assaut, **[[Breakneck Mech]]** leur ajoute Protection et le déplacement libre entre terrains.

Empilés, ces effets transforment des unités quelconques en armée cohérente que l'adversaire ne peut ni cibler facilement ni bloquer proprement.`,
    plan: `**Début de partie.** **[[Forecaster]]** et **[[Gem Jammer]]** posent les bases : le premier donne Vision à vos Mechs, le second offre le déplacement libre à une unité.

**Milieu de partie.** Enchaîne les Mechs qui se renforcent entre eux. **[[Bubble Bot]]** prépare un autre Mech en arrivant, ce qui vous donne une action de plus.

**Fin de partie.** **[[Ferrous Forerunner]]** laisse deux Mechs derrière lui en mourant : votre armée ne disparaît jamais vraiment. Le défaut du deck est là : il lui faut plusieurs pièces en jeu pour fonctionner, et il perd sèchement s'il se fait démonter avant de les avoir posées.`,
  },
};
