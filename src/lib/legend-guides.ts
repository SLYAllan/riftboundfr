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
    bref: `Mel est un deck **Esprit/Chaos** d'**amplification et de sorts pris à l'adversaire**. Sur Radiance, 18 joueurs classés sur 6 tournois, aucun dans les 10 % de tête, aucun titre. Le deck est Difficile à piloter.`,
    gagne: `Chaque fois que vous amplifiez une autre carte, Mel s'amplifie aussi. Vous pouvez ensuite la désamplifier et l'épuiser pour retirer 2 Puissance à une unité au combat. **[[Applied Researchers]]** s'amplifie pour 3 énergie et baisse le coût de vos sorts ; **[[Mel, Defiant Soul]]** s'amplifie en défaussant un sort et bannit une unité adverse de 3 Puissance ou moins.

Le deck gagne aussi les échanges de sorts. **[[Rebuttal]]**, dans toutes les listes, prend le contrôle d'un sort adverse de 4 énergie ou moins si vous payez une Puissance, et le contre sinon.`,
    plan: `**Début de partie.** **[[Rebuttal]]** et **[[Stupefy]]** répondent pour une énergie. **[[Traveling Merchant]]** trie votre main à chaque déplacement.

**Milieu de partie.** **[[Applied Researchers]]** amplifié baisse le coût de vos sorts. **[[Shock Blast]]** inflige 4 à une unité, pour 2 énergie de moins si vous contrôlez quelque chose d'amplifié.

**Fin de partie.** **[[Mel, Defiant Soul]]** bannit une unité adverse. **[[Time Warp]]** donne un tour de plus.

**Ce qui le bat.** Sur Radiance, 18 joueurs seulement et aucun dans les 10 % de tête : la liste ne s'est pas encore montrée, il faut d'autres tournois pour en juger.`,
  },
  "zed-master-of-shadows": {
    slug: "zed-master-of-shadows",
    bref: `Zed est un deck **Furie/Chaos** de **bannissement et de rotation de main** : chaque carte bannie l'amplifie, et il s'en sert pour trier sa main. Sur Radiance, 21 joueurs classés sur 6 tournois, aucun dans les 10 % de tête, aucun titre. Le deck est Difficile à piloter.`,
    gagne: `Chaque carte que vous bannissez amplifie Zed. Vous pouvez ensuite le désamplifier et l'épuiser pour défausser une carte, puis en piocher une. **[[Runeblade Anvil]]** bannit la carte du dessus de votre deck en arrivant et en partant, et vous laisse la jouer : deux bannissements pour une carte.

**[[Zed, Without a Sound]]**, dans 71 % des listes, pose un Clone d'Ombre à chaque conquête, puis échange sa place avec lui pour frapper ailleurs.`,
    plan: `**Début de partie.** **[[Traveling Merchant]]** échange une carte à chacun de ses déplacements. **[[Runeblade Anvil]]** commence à amplifier Zed.

**Milieu de partie.** **[[Ride The Wind]]**, dans 93 % des listes, déplace une de vos unités et la prépare. La Légende trie votre main à chaque tour.

**Fin de partie.** **[[Zed, Without a Sound]]** et ses Clones d'Ombre frappent là où l'adversaire ne les attend pas. **[[Baron Nashor]]** donne +2 Puissance à vos autres unités.

**Ce qui le bat.** Une seule carte est fixée : chaque liste est différente. Sur Radiance, 21 joueurs seulement, aucun dans les 10 % de tête.`,
  },
  "ambessa-matriarch-of-war": {
    slug: "ambessa-matriarch-of-war",
    bref: `Ambessa est un deck **Corps/Ordre** d'**amplification** : chaque unité amplifiée la charge, et elle prépare une unité pour un second combat. Sur Radiance, 14 joueurs classés sur 2 tournois, aucun dans les 10 % de tête, aucun titre. Le deck est de difficulté Moyenne.`,
    gagne: `Chaque fois que vous amplifiez une autre carte, Ambessa s'amplifie aussi. Vous pouvez ensuite la désamplifier, payer une Puissance et l'épuiser pour préparer une unité. Le deck amplifie beaucoup : **[[Legion Marauder]]** pour une énergie, **[[Ambessa, The Wolf]]** pour 3 énergie et une Puissance de Corps, **[[Kayle, Justified]]** jusqu'à trois fois.

**[[Guttural Roar]]** donne +4 Puissance à une unité amplifiée, +2 sinon.`,
    plan: `**Début de partie.** **[[Legion Marauder]]** se pose et s'amplifie tôt. **[[Irresistible Faefolk]]** attire une unité adverse là où il se déplace.

**Milieu de partie.** **[[Ambessa, The Wolf]]** amplifiée gagne +3 Puissance et ne subit de dégâts qu'en combat. **[[Rampage]]** et **[[Punch First]]** gagnent les combats serrés.

**Fin de partie.** **[[Kayle, Justified]]**, amplifiée trois fois, a Protection 3 et Gank. **[[Rengar, Trophy Hunter]]** se pose sur un champ de bataille occupé.

**Ce qui le bat.** Sur Radiance, 14 joueurs seulement, sur deux tournois : trop peu pour juger la liste.`,
  },
  "nasus-curator-of-the-sands": {
    slug: "nasus-curator-of-the-sands",
    bref: `Nasus est un deck **Calme/Esprit** de **gros coûts remboursés** : chaque carte à 7 énergie ou plus lui rend deux runes. Sur Radiance, 57 joueurs classés sur 15 tournois, 3 dans les 10 % de tête (5,3 %), aucun titre. Le deck est de difficulté Moyenne.`,
    gagne: `Quand vous jouez une unité, un équipement ou une capacité qui coûte 7 énergie ou plus, la Légende prépare jusqu'à deux runes. **[[Thousand-Tailed Watcher]]**, dans toutes les listes, coûte 7 et retire 3 Puissance à toutes les unités adverses. **[[Steel Paws]]** s'amplifie pour 7 énergie et gagne +7 Puissance.

Au bout, **[[Nasus, Ascended]]**, dans 96 % des listes, a Protection 2. Amplifié pour 8 énergie, il marque un point à chaque conquête.`,
    plan: `**Début de partie.** **[[Scuttle Crab]]** pioche en arrivant. **[[Defy]]**, **[[Stupefy]]** et **[[Discipline]]** répondent pendant le tour adverse.

**Milieu de partie.** **[[Find Your Center]]** pioche et canalise une rune. **[[Steel Paws]]**, amplifié, gagne 7 Puissance, et la Légende vous rend deux runes.

**Fin de partie.** **[[Thousand-Tailed Watcher]]** affaiblit tout le terrain adverse. **[[Nasus, Ascended]]** marque à chaque conquête. **[[Time Warp]]** donne un tour de plus.

**Ce qui le bat.** Les premiers tours : le deck attend ses cartes à 7 énergie. Sur Radiance, 5,3 % de conversion, sous la moyenne du format, et une septième place à Guangzhou.`,
  },
  "akali-rogue-assassin": {
    slug: "akali-rogue-assassin",
    bref: `Akali joue en Furie et en Calme. Son archétype : mouvement et retrait ciblé. Le deck est Difficile à piloter. Sur Radiance, 68 listes publiées : 74 joueurs classés sur 15 tournois, 7 dans les 10 % de tête (9,5 %), aucun titre.`,
    gagne: `La Légende s'épuise pendant votre tour pour ramener une de vos unités engagées à la base, et la remettre prête si elle est amplifiée. En clair : vous retirez votre unité d'un combat perdu avant qu'il ne se résolve. L'unité survit et peut attaquer ailleurs.

Les cartes qui font tourner ce plan : **[[Shuriken Flip]]** (100 % des listes) inflige 2 dégâts et déplace une unité pour une énergie. **[[Defy]]** (100 % des listes) annule le sort adverse. **[[Stellacorn Herder]]** (100 % des listes) pioche à chaque déplacement. **[[Akali, Deadly Weapon]]** (100 % des listes) inflige des dégâts à chaque déplacement. Le but : garder la main pleine et ne rien perdre dans un combat perdu.`,
    plan: `**Début de partie.** **[[Scuttle Crab]]** (46 % des listes) occupe le terrain en piochant. **[[Shuriken Flip]]** (100 % des listes) inflige 2 dégâts et déplace une unité pour une énergie. Vous posez des unités et vous gardez les retraits pour les combats qui comptent.

**Milieu de partie.** **[[Stellacorn Herder]]** (100 % des listes) pioche à chaque déplacement, ce qui garde votre main pleine. La Légende sort votre unité du combat perdu avant qu'il ne se résolve. **[[Zhonya's Hourglass]]** (100 % des listes) protège une unité.

**Fin de partie.** **[[Falling Star]]** inflige 3 dégâts deux fois, **[[Blitzcrank, Impassive]]** attire une unité adverse sur son champ de bataille, et **[[Astral Heron]]** baisse le coût de la carte suivante. C'est maintenant que le deck doit gagner.

**Ce qui le bat.** Retirer vos unités du combat ne marque aucun point. Sur Radiance, 74 joueurs classés, 7 dans les 10 % de tête (9,5 %, contre 9,9 % de moyenne), aucun titre : l'échantillon est petit, et la meilleure place est une troisième.`,
  },
  "jayce-defender-of-tomorrow": {
    slug: "jayce-defender-of-tomorrow",
    bref: `Jayce est un deck **Esprit/Corps** de **montée en ressources** : ses équipements produisent de l'énergie, et il les prépare pour qu'ils servent deux fois. Sur Radiance, 67 joueurs classés sur 16 tournois, 7 dans les 10 % de tête (10,4 %), aucun titre. Le deck est de difficulté Moyenne.`,
    gagne: `Pour une énergie, la Légende prépare un équipement ; amplifiée, elle en prépare deux. **[[Platewyrm Egg]]**, dans 96 % des listes, donne 2 énergie une fois amplifié : préparé, il en donne de nouveau. **[[Jayce, Brilliant Inventor]]** prépare lui aussi quelque chose à son arrivée et au premier équipement joué chaque tour.

Ce surplus paie le haut du deck. **[[Dazzling Aurora]]** joue gratuitement une unité du deck à chaque fin de tour, **[[Elder Dragon]]** rend mortel le moindre dégât que vous infligez.`,
    plan: `**Début de partie.** **[[Platewyrm Egg]]** et **[[Garbage Grabber]]** se posent tôt. **[[Dredge Up]]** pioche, puis se rejoue depuis la défausse grâce à Flux. **[[Bellows Breath]]** et **[[Flurry of Blades]]** nettoient les petites unités.

**Milieu de partie.** **[[Catalyst of Aeons]]** canalise deux runes. **[[Clairvoyance]]** regarde les cinq cartes du dessus, les range, puis en pioche deux, en réaction.

**Fin de partie.** **[[Dazzling Aurora]]** et **[[Elder Dragon]]** arrivent bien avant leur heure. **[[Gutter Palace]]** gagne la partie au début de votre tour si vous avez exactement 4 cartes en main et 4 unités sur les champs de bataille.

**Ce qui le bat.** Les decks qui frappent tôt : avant Elder Dragon, le deck a peu d'unités. Sur Radiance, 10,4 % de conversion, la moyenne du format, et deux cinquièmes places, à Shenyang et à Guangzhou.`,
  },
  "kennen-heart-of-the-tempest": {
    slug: "kennen-heart-of-the-tempest",
    bref: `Kennen est un deck **Ordre/Chaos** de **défausse** : il joue ses cartes depuis partout sauf sa main. Sur Radiance, 259 joueurs classés sur 16 tournois, 36 dans les 10 % de tête : 13,9 % de conversion contre 9,9 % de moyenne, et deux titres, dont le Regional Championship d'Europe. C'est aussi un deck **difficile** : tout dépend de ce que vous remplissez, et du moment où vous le dépensez.`,
    gagne: `Chaque carte jouée ailleurs que depuis votre main amplifie Kennen. Désamplifiez-le et épuisez-le, et une unité gagne **Assaut 2** pour le tour. Le bonus ne vous coûte rien d'autre que d'avoir rempli votre défausse avant.

**[[Rhasa the Sunderer]]** transforme ce remplissage en victoire : 10 d'énergie de base, une de moins par carte dans la défausse. Le deck passe ses premiers tours à remplir sa défausse, puis pose une menace que personne ne paie au prix fort.`,
    plan: `**Début de partie.** **[[Lightning Rush]]** est dans toutes les listes, en trois exemplaires : elle regarde trois cartes, en pioche une et envoie les deux autres dans la défausse. **[[Trifarian Captain]]**, aussi dans toutes les listes, cherche une petite unité ou un équipement dans les quatre cartes du dessus.

**Milieu de partie.** **[[Lightning Rush]]** se rejoue depuis la défausse grâce à Flux, et chaque carte jouée hors de la main amplifie la Légende. C'est là que **[[Rhasa the Sunderer]]** devient payable, et que **[[Minefield]]** et **[[Zaun Warrens]]**, dans 95 % et 94 % des listes, pèsent sur les combats : le premier envoie deux cartes dans la défausse à chaque conquête, le second défausse puis pioche.

**Fin de partie.** **[[Fizz, Trickster]]** rejoue un sort de la défausse en arrivant, **[[Kennen, Storm of Shuriken]]** rend un sort de la défausse rejouable après une conquête. L'Assaut 2 gratuit tranche le combat qui compte.

**Ce qui le bat.** Les départs rapides. Remplir prend des tours, et tant que rien n'est joué hors de votre main, la Légende reste désamplifiée et ne donne rien. Sur Radiance, ce défaut ne l'a pas empêché de gagner le Regional Championship d'Europe et la City Challenge de Chengdu du 7 novembre.`,
  },
  "master-yi-wuju-bladesman": {
    slug: "master-yi-wuju-bladesman",
    bref: `Master Yi est un deck **Corps/Calme** de **contrôle de terrain**, de difficulté facile à moyenne. Sur Radiance, 149 joueurs classés sur 16 tournois, 15 dans les 10 % de tête : 10,1 % de conversion contre 9,9 % de moyenne, et deux titres, tous deux à Shanghai. Il apprend les fondamentaux du jeu : les combats, la pioche et l'interaction.`,
    gagne: `Il y a deux façons de marquer à Riftbound : conquérir un champ de bataille, ou le **contrôler**, c'est-à-dire commencer votre tour en tenant un terrain déjà conquis. Master Yi est bâti pour la seconde. Vous conquérez une fois, votre unité seule défend avec +2 Puissance, et chaque tour tenu rapporte un point.

La carte centrale est **[[Ruin Runner]]** : une unité à 6 d'énergie et 5 de Puissance que **les sorts et capacités adverses ne peuvent pas cibler**. En défense avec le +2 de la Légende, elle encaisse 7, ne part pas sur un retrait ciblé, et verrouille un terrain à elle seule. Ajoutez **[[Zhonya's Hourglass]]**, un équipement caché qui sauve une unité de la mort, et vous obtenez une position difficile à franchir.`,
    plan: `**Début de partie.** Posez tôt un défenseur, comme **[[Scuttle Crab]]**, qui pioche et révèle la main adverse, ou **[[Lonely Poro]]**, et installez-vous sur un premier terrain. Les premiers tours servent à exister et à tenir, pas à tuer.

**Milieu de partie.** Déployez vos grosses unités, **[[Rengar, Trophy Hunter]]**, qui arrive en Embuscade là où l'adversaire a des unités, puis **[[Ruin Runner]]**, et marquez en contrôlant. **[[Discipline]]** donne +2 Puissance à un défenseur au bon moment et fait piocher, **[[En Garde]]** ajoute +1, et +1 de plus si l'unité est seule.

**Fin de partie.** Il reste à conserver le terrain : **[[Sabotage]]** retire de la main adverse une carte qui n'est pas une unité, **[[Charm]]** déplace une unité adverse, **[[Defy]]** contre le sort qui renverserait la partie.`,
  },
  "diana-scorn-of-the-moon": {
    slug: "diana-scorn-of-the-moon",
    bref: `Diana est un deck **Chaos/Esprit** de **combats gagnés à la réaction** : elle garde toujours un sort d'avance. Sur Radiance, 44 joueurs classés sur 14 tournois, 7 dans les 10 % de tête (15,9 %, contre 9,9 % pour le format), et un titre, le Showdown de Melbourne. Le deck est Difficile à piloter.`,
    gagne: `La Légende s'épuise en réaction et vous donne une énergie, à dépenser pendant un combat. À chaque combat, vous avez donc un sort de plus que prévu : **[[Gust]]** renvoie en main une petite unité, **[[Stupefy]]** affaiblit et pioche, **[[Eclipse]]** retire 4 Puissance.

**[[Diana, Lunari]]**, dans toutes les listes, remplit la main pendant ces combats : pour une énergie, elle regarde le dessus du deck et pioche la carte si c'est un sort.`,
    plan: `**Début de partie.** **[[Tideturner]]** se pose caché. **[[Ravenbloom Student]]** gagne +1 Puissance à chaque sort joué.

**Milieu de partie.** **[[Moonfall]]** attire une unité adverse sur votre champ de bataille et retire 2 Puissance aux unités adverses là-bas. **[[Ride The Wind]]** déplace une de vos unités et la prépare.

**Fin de partie.** **[[Hwei, Brooding Painter]]** pioche en se déplaçant. **[[Fizz, Trickster]]** rejoue un sort depuis la défausse. **[[Star-Crossed]]** renvoie en main une unité de chaque camp.

**Ce qui le bat.** Les adversaires qui évitent le combat : l'énergie de la Légende n'y sert pas. Sur Radiance, 44 joueurs seulement : l'écart avec le format ne tient plus le test.`,
  },
  "irelia-blade-dancer": {
    slug: "irelia-blade-dancer",
    bref: `Irelia est un deck **Calme/Ordre** de **tempo** : elle prépare ses unités pour qu'elles combattent deux fois. Sur Radiance, 69 joueurs classés sur 15 tournois, 4 dans les 10 % de tête (5,8 %), et un titre, la City Challenge de Shenyang. Le deck est de difficulté Moyenne à Difficile.`,
    gagne: `Quand vous choisissez une de vos unités, la Légende peut la préparer pour une Puissance. Une unité qui a déjà attaqué ou s'est déplacée repart. Le deck est plein de sorts qui choisissent vos unités : **[[Discipline]]**, **[[Defiant Dance]]**, **[[Ride The Wind]]**.

**[[Irelia, Fervent]]**, dans toutes les listes, en profite le plus : elle a Protection, et gagne +1 Puissance chaque fois qu'on la choisit ou qu'on la prépare.`,
    plan: `**Début de partie.** **[[Scuttle Crab]]** pioche en arrivant. **[[Tideturner]]**, caché, échange sa place avec une de vos unités au bon moment.

**Milieu de partie.** **[[Defiant Dance]]** donne +2 Puissance à une unité et en retire 2 à une autre, pour une énergie. **[[Discipline]]** donne +2 Puissance et pioche. Chacun permet à la Légende de préparer l'unité choisie.

**Fin de partie.** **[[Stellacorn Herder]]** pioche à chaque déplacement. **[[Zhonya's Hourglass]]** sauve une unité qui devait mourir.

**Ce qui le bat.** Chaque unité préparée coûte une Puissance : le deck manque vite de runes. Sur Radiance, 5,8 % de conversion, sous la moyenne du format, malgré le titre de Shenyang.`,
  },
  "leblanc-deceiver": {
    slug: "leblanc-deceiver",
    bref: `LeBlanc est un deck **Esprit/Ordre** de **morts rentables** : ses unités valent plus mortes que vivantes. Sur Radiance, 64 joueurs classés sur 16 tournois, 8 dans les 10 % de tête (12,5 %, contre 9,9 % pour le format), et un titre, la City Challenge de Wuhan du 8 novembre. Le deck est de difficulté Moyenne.`,
    gagne: `Presque chaque unité du deck laisse quelque chose en mourant : une rune avec **[[Soaring Scout]]**, une carte avec **[[Watchful Sentry]]**, 4 dégâts avec **[[Ruined Rex]]**. **[[Karthus, Eternal]]**, dans 92 % des listes, fait déclencher ces effets deux fois.

Pour les faire mourir quand vous le voulez, **[[Sacrifice]]** tue une de vos unités Puissantes en réaction, pioche deux cartes et canalise une rune. La Légende, elle, pose une copie temporaire d'une unité quand vous conquérez ou contrôlez un champ de bataille.`,
    plan: `**Début de partie.** **[[Soaring Scout]]** et **[[Watchful Sentry]]** se posent pour deux énergie et rendent une rune ou une carte en mourant.

**Milieu de partie.** **[[Karthus, Eternal]]** arrive, et chaque Agonie compte double. **[[Mirror Image]]** copie une unité, la vôtre ou celle de l'adversaire. **[[Sacrifice]]** change une unité condamnée en deux cartes.

**Fin de partie.** **[[Glasc Mixologist]]** rejoue en mourant une petite unité depuis la défausse. **[[Thousand-Tailed Watcher]]** retire 3 Puissance à toutes les unités adverses.

**Ce qui le bat.** Sans Karthus, chaque Agonie ne compte qu'une fois. Sur Radiance, un seul titre, la City Challenge de Wuhan du 8 novembre.`,
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
    bref: `Azir est un deck **Calme/Ordre** d'**équipements et de jetons** : il arme une armée de Soldats des Sables. Sur Radiance, 48 joueurs classés sur 15 tournois, 3 dans les 10 % de tête (6,3 %), aucun titre. Le deck est de difficulté Moyenne.`,
    gagne: `Chaque tour où vous jouez un équipement, la Légende pose un Soldat des Sables de 2 Puissance pour une énergie. Vos Soldats sont Experts en armes : ils s'équipent à moindre coût. Huit cartes sont dans toutes les listes : quatre équipements, **[[Guards!]]** et **[[Arise!]]** qui posent des Soldats, **[[Defy]]** et **[[Discipline]]**.

**[[Arise!]]** pose un Soldat par équipement que vous contrôlez et en prépare deux. **[[Azir, Sovereign]]** amène tous vos jetons sur son champ de bataille quand il attaque.`,
    plan: `**Début de partie.** **[[Doran's Shield]]** et **[[Eye of the Herald]]** coûtent une énergie : chacun ouvre la Légende. **[[Guards!]]** pose un Soldat caché.

**Milieu de partie.** **[[Brutalizer]]** et **[[B.F. Sword]]** équipent vos Soldats. **[[Back Off]]** étourdit une unité adverse et pioche.

**Fin de partie.** **[[Arise!]]** remplit le terrain de Soldats. **[[Azir, Sovereign]]** les amène tous au combat.

**Ce qui le bat.** Sans équipement joué dans le tour, la Légende ne fait rien. Sur Radiance, 6,3 % de conversion, loin de la moyenne du format, et une huitième place pour meilleur résultat.`,
  },
  "ezreal-prodigal-explorer": {
    slug: "ezreal-prodigal-explorer",
    bref: `Ezreal est un deck **Chaos/Esprit** de **sorts en chaîne** : chaque tour où il répond deux fois, il pioche. Sur Radiance, 14 joueurs classés sur 8 tournois, 1 dans les 10 % de tête (7,1 %), aucun titre. Le deck est Très Difficile à piloter.`,
    gagne: `La Légende pioche une carte si vous avez choisi deux fois des unités ou des équipements adverses dans le tour. Le deck est fait pour ça : **[[Bellows Breath]]**, **[[Stupefy]]** et **[[Gust]]**, dans toutes les listes, coûtent une énergie et visent l'adversaire.

**[[Ezreal, Prodigy]]** remplit la main en arrivant, **[[Wages of Pain]]** et **[[Deadly Flourish]]** retirent une unité et laissent de l'or.`,
    plan: `**Début de partie.** **[[Bellows Breath]]** et **[[Stupefy]]** gênent les premières unités adverses, et la Légende pioche.

**Milieu de partie.** **[[Ezreal, Prodigy]]** défausse une carte puis en pioche deux. **[[Wages of Pain]]** et **[[Star-Crossed]]** répondent aux menaces.

**Fin de partie.** **[[Thousand-Tailed Watcher]]** affaiblit tout le terrain adverse. **[[Fizz, Trickster]]** rejoue un sort depuis la défausse. **[[Singularity]]** inflige 6 dégâts à deux unités.

**Ce qui le bat.** Un adversaire qui pose peu d'unités : sans cibles, la Légende ne pioche pas. Sur Radiance, 14 joueurs seulement, trop peu pour juger.`,
  },
  "fiora-grand-duelist": {
    slug: "fiora-grand-duelist",
    bref: `Fiora est un deck **Ordre/Corps** de **duel** : une grosse unité, protégée, qui gagne ses combats un par un. Sur Radiance, 19 joueurs classés sur 13 tournois, aucun dans les 10 % de tête, aucun titre. Le deck est de difficulté Moyenne.`,
    gagne: `Quand une de vos unités atteint 5 Puissance, la Légende canalise une rune épuisée. **[[Punch First]]** et **[[Rampage]]** y suffisent en un sort. **[[Fiora, Victorious]]**, dans 94 % des listes, en tire le plus : tant qu'elle est Puissante, elle a Protection, Gank et Bouclier.

**[[Riposte]]**, dans toutes les listes, protège l'ensemble : elle contre un sort adverse et donne à votre unité autant de Puissance que le coût de ce sort.`,
    plan: `**Début de partie.** **[[Pit Rookie]]** et **[[Pillaged Armory]]** donnent les premiers bonus. **[[First Mate]]** prépare une autre unité.

**Milieu de partie.** **[[Punch First]]** rend **[[Fiora, Victorious]]** Puissante pour une énergie. **[[Riposte]]** répond au sort qui devait l'abattre.

**Fin de partie.** **[[Harnessed Dragon]]** tue une unité adverse en arrivant. **[[Rengar, Trophy Hunter]]** se pose sur un champ de bataille occupé.

**Ce qui le bat.** Tout repose sur peu d'unités : un retrait au bon moment coûte cher. Sur Radiance, 19 joueurs seulement, et une treizième place pour meilleur résultat.`,
  },
  "vex-gloomist": {
    slug: "vex-gloomist",
    bref: `Vex est un deck **Calme/Chaos** de **contrôle défensif** bâti sur les cartes cachées et l'attrition. Sur Radiance, 104 joueurs classés sur 15 tournois, 12 dans les 10 % de tête : 11,5 % de conversion contre 9,9 % de moyenne, et deux titres, à Fuzhou et à Guangzhou. C'est un deck **difficile** à piloter, pour qui aime frustrer l'adversaire.`,
    gagne: `Le principe, c'est l'incertitude. **[[Tideturner]]**, **[[Evelynn, Entrancing]]** et **[[Edge of Night]]** se posent face cachée et se révèlent en réaction, au moment où ça fait le plus mal. L'adversaire ne sait jamais ce que vous tenez, donc il attaque mal. Autour, **[[Defy]]** contre ses sorts de 4 énergie ou moins et **[[Discipline]]** donne +2 Puissance à une unité en plein combat, en vous faisant piocher. La Légende pioche en plus à chaque champ de bataille tenu.`,
    plan: `**Début de partie.** Posez **[[Scuttle Crab]]** et vos unités clés sur un champ de bataille, et gardez-les en vie à tout prix. Chaque tour tenu fait piocher la Légende.

**Milieu de partie.** Posez vos cartes face cachée et protégez vos positions avec vos réactions Calme. **[[Vex, Apathetic]]** étourdit les unités que l'adversaire pose tant qu'elle est sur un champ de bataille, et **[[Bedeviling Stranger]]** renvoie une unité adverse en main quand le champ de bataille compte 4 unités ou plus.

**Fin de partie.** **[[Zhonya's Hourglass]]** sauve une unité qui allait mourir, **[[Back Off]]** étourdit un attaquant et fait piocher. L'adversaire s'use sur vos défenses, et vous gardez l'initiative tant que votre position tient.`,
  },
  "viktor-herald-of-the-arcane": {
    slug: "viktor-herald-of-the-arcane",
    bref: `Viktor est un deck **Esprit/Ordre** de **contrôle** : il retire tout en face et tient le terrain avec des jetons Recrue. Sur Radiance, 32 joueurs classés sur 12 tournois, 1 dans les 10 % de tête (3,1 %), aucun titre, mais une deuxième place au Showdown de Sacramento. Le deck est d'un niveau Élevé.`,
    gagne: `Pour une énergie, la Légende pose un jeton Recrue de 1 Puissance, chaque tour. Ces jetons tiennent le terrain et nourrissent **[[Cull the Weak]]**, dans 93 % des listes, qui oblige chaque joueur à tuer une de ses unités : vous donnez une Recrue, l'adversaire perd une vraie unité.

Le reste retire. **[[Hidden Blade]]** tue une unité, **[[Bellows Breath]]** inflige 1 à trois unités, et **[[Imperial Decree]]** tue toute unité blessée ce tour-là.`,
    plan: `**Début de partie.** **[[Bellows Breath]]** et **[[Stupefy]]** gênent les premières unités adverses. La Légende pose sa première Recrue.

**Milieu de partie.** **[[Cull the Weak]]**, **[[Hidden Blade]]** et **[[Wages of Pain]]** retirent une unité à chaque tour. **[[Viktor, Leader]]** pose une Recrue chaque fois qu'une de vos autres unités meurt.

**Fin de partie.** **[[Imperial Decree]]**, suivi de **[[Bellows Breath]]**, vide un champ de bataille. **[[Sprite Burst]]** pose deux Esprits pour conclure.

**Ce qui le bat.** Les decks qui posent plus d'unités que vous n'en retirez. Sur Radiance, 32 joueurs seulement, 3,1 % de conversion, mais une deuxième place à Sacramento.`,
  },
  "rengar-pridestalker": {
    slug: "rengar-pridestalker",
    bref: `Rengar est un deck **Corps/Furie** d'**embuscades** : il pose ses unités en plein combat et gagne les échanges d'un point de Puissance. Sur Radiance, 85 joueurs classés sur 16 tournois, 9 dans les 10 % de tête (10,6 %, la moyenne du format), aucun titre.`,
    gagne: `Chaque unité que vous jouez donne +1 Puissance à une unité pour le tour. Le deck en joue beaucoup, et souvent là où l'adversaire ne les attend pas : **[[Inferna]]** et **[[Grim Apothecary]]** arrivent en Embuscade, **[[Rengar, Trophy Hunter]]** se pose sur un champ de bataille occupé par l'adversaire.

**[[Thrill of the Hunt]]**, dans toutes les listes, bannit une de vos unités et la rejoue gratuitement sur le champ de bataille de votre choix, en réaction. Elle compte comme une unité jouée : la Légende donne son bonus une fois de plus.`,
    plan: `**Début de partie.** **[[Pit Rookie]]** et **[[Inferna]]** se posent pour deux énergie. **[[Irresistible Faefolk]]** attire une unité adverse sur le champ de bataille où il se déplace. **[[Sabotage]]** vous montre la main adverse et lui fait recycler une carte qui n'est pas une unité.

**Milieu de partie.** **[[Grim Apothecary]]** arrive en Embuscade et peut renvoyer en main une de vos unités, pour la rejouer plus tard. **[[First Mate]]** prépare une autre unité. **[[Punch First]]** donne +5 Puissance pour une énergie.

**Fin de partie.** **[[Rengar, Trophy Hunter]]** frappe là où l'adversaire se croyait tranquille. **[[Kai'Sa, Survivor]]**, avec Accélération, pioche à chaque conquête.

**Ce qui le bat.** Une main sans unités : la Légende ne donne rien. Sur Radiance, le deck reste dans la moyenne du format, 10,6 % de conversion, et sa meilleure place est une troisième.`,
  },
  "khazix-voidreaver": {
    slug: "khazix-voidreaver",
    bref: `Kha'Zix est un deck **Furie/Corps** d'**XP et de combats gagnés** : il isole une unité adverse, la bat, et dépense l'XP pour la suite. Sur Radiance, 27 joueurs classés sur 11 tournois, 2 dans les 10 % de tête (7,4 %), et un titre, la City Challenge de Hangzhou. Le deck est de difficulté Moyenne à Difficile.`,
    gagne: `Chaque combat gagné donne 1 XP à la Légende, qui le dépense pour renforcer une unité ou ramener une unité épuisée à la base. **[[Kha'Zix, Mutating Horror]]**, dans toutes les listes, arrive en Embuscade, et gagne +2 Puissance et 2 XP quand il combat une unité adverse seule.

Le deck sert à créer ce face-à-face. **[[Irresistible Faefolk]]** attire une unité adverse là où il se déplace, **[[Void Assault]]** déplace une de vos unités puis une unité adverse.`,
    plan: `**Début de partie.** **[[Irresistible Faefolk]]** se pose pour deux énergie. **[[Sabotage]]** vous montre la main adverse.

**Milieu de partie.** **[[Void Assault]]** isole une unité adverse, **[[Kha'Zix, Mutating Horror]]** la combat. **[[Punch First]]** et **[[Rampage]]** gagnent les combats serrés.

**Fin de partie.** **[[Rengar, Trophy Hunter]]** se pose sur un champ de bataille occupé. **[[Fizz, Trickster]]** rejoue un sort depuis la défausse.

**Ce qui le bat.** Un adversaire qui ne laisse jamais une unité seule. Sur Radiance, 27 joueurs seulement : le titre de Hangzhou ne suffit pas à juger le deck.`,
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
    bref: `Sett est un deck **Corps/Ordre** de **bonus** : chaque unité qui en porte un se défend mieux, et la Légende la sauve si elle devait mourir. Sur Radiance, 20 joueurs classés sur 12 tournois, 4 dans les 10 % de tête (20,0 %, contre 9,9 % pour le format), aucun titre. Le deck est Difficile à piloter.`,
    gagne: `Si une de vos unités avec un bonus devait mourir, la Légende dépense ce bonus pour la soigner et la ramener à la base, pour une Puissance. Le deck en donne partout : **[[Pit Rookie]]**, **[[Pillaged Armory]]**, **[[Showstopper]]**.

**[[Sett, Kingpin]]**, dans 95 % des listes, a Tank et gagne +1 Puissance par unité alliée avec un bonus à ses côtés. **[[Call to Glory]]** donne +3 Puissance, sans rien coûter si vous dépensez un bonus.`,
    plan: `**Début de partie.** **[[Pit Rookie]]** et **[[Pillaged Armory]]** posent les premiers bonus. **[[Irresistible Faefolk]]** attire une unité adverse là où il se déplace.

**Milieu de partie.** **[[Showstopper]]** renforce une unité de votre base et l'envoie au combat. **[[Sett, Kingpin]]** grossit avec chaque unité renforcée à ses côtés.

**Fin de partie.** **[[Fiora, Victorious]]**, Puissante, a Protection, Gank et Bouclier. **[[Call to Glory]]** et **[[Punch First]]** gagnent les combats serrés.

**Ce qui le bat.** Sur Radiance, 20 joueurs seulement : la conversion de 20,0 % est belle, mais trop fragile pour conclure. Le deck n'a pas encore de titre, sa meilleure place est une deuxième, à Pékin.`,
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
    bref: `Lillia est un deck **Calme/Esprit** de **jetons temporaires** : elle remplit le terrain d'Esprits de 3 Puissance qui ne restent qu'un temps. Sur Radiance, 77 joueurs classés sur 16 tournois, 8 dans les 10 % de tête (10,4 %), aucun titre. Le deck est de difficulté Moyenne.`,
    gagne: `La Légende pose un Esprit de 3 Puissance, temporaire, pour quatre énergie. Chaque unité temporaire déjà en jeu lui retire une énergie : plus vous avez d'Esprits, moins le suivant coûte.

**[[Sprite Fountain]]** et **[[Sprite Burst]]**, dans 98 % et 95 % des listes, en posent d'autres, et **[[Lillia, Fae Fawn]]** en laisse un derrière elle chaque fois qu'elle quitte un endroit. Autour, **[[Defy]]**, **[[Discipline]]** et **[[Stupefy]]** répondent en plein combat.`,
    plan: `**Début de partie.** **[[Sprite Fountain]]** pose un Esprit préparé, puis un autre quand il meurt. **[[Ravenbloom Student]]** gagne +1 Puissance à chaque sort joué.

**Milieu de partie.** **[[Sprite Burst]]** pose deux Esprits d'un coup, et la Légende devient presque gratuite. **[[Smoke and Mirrors]]** échange deux de vos unités de place et pioche une carte. **[[Charm]]** déplace une unité adverse.

**Fin de partie.** **[[Unchecked Power]]** épuise vos unités, puis inflige 12 à toutes les unités sur les champs de bataille. Vous y perdez des jetons, l'adversaire de vraies unités.

**Ce qui le bat.** Les Esprits ne restent pas : un adversaire qui tient le temps qu'ils disparaissent reprend la main. Sur Radiance, 10,4 % de conversion, la moyenne du format, et une deuxième place à Chengdu le 7 novembre.`,
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
    bref: `Volibear est un deck **Corps/Furie** de **Dragons** : chaque grosse unité rapporte une rune, et les runes paient des Dragons de plus en plus gros. Sur Radiance, 18 joueurs classés sur 9 tournois, aucun dans les 10 % de tête, aucun titre. Le deck est de difficulté Moyenne.`,
    gagne: `Quand vous jouez une unité de 5 Puissance ou plus, la Légende canalise une rune épuisée. Le deck en joue beaucoup : **[[Blazing Scorcher]]**, **[[Gentle Gemdragon]]**, **[[Kadregrin the Infernal]]**. **[[Gentle Gemdragon]]** prépare deux runes à chaque Dragon joué, **[[Seraphic Wyvern]]** ajoute une rune chaque fois que vous en canalisez.

Au bout, **[[Elder Dragon]]**, dans toutes les listes, rend mortel le moindre dégât que vous infligez.`,
    plan: `**Début de partie.** **[[Mobilize]]** canalise une rune. **[[Dragonsoul Sage]]** donne une énergie en réaction. **[[Herald of Scales]]** baisse le coût de vos Dragons.

**Milieu de partie.** **[[Blazing Scorcher]]** arrive prêt et déclenche la Légende. **[[Gentle Gemdragon]]** et **[[Seraphic Wyvern]]** accélèrent les runes.

**Fin de partie.** **[[Kadregrin the Infernal]]** pioche une carte par unité de 5 Puissance ou plus. **[[Elder Dragon]]** et **[[Volibear, Furious]]** finissent la partie. **[[Sky Splitter]]** retire une unité adverse.

**Ce qui le bat.** Les decks rapides : le deck passe ses premiers tours à préparer ses runes. Sur Radiance, 18 joueurs seulement, et une treizième place pour meilleur résultat.`,
  },
  "master-yi-wuju-master": {
    slug: "master-yi-wuju-master",
    bref: `Master Yi, Wuju Master est un deck **Corps/Calme** de **montée en niveau** : chaque combat gagné rapporte de l'XP, et l'XP rend toute l'armée plus forte. Sur Radiance, 30 joueurs classés sur 6 tournois, 1 dans les 10 % de tête (3,3 %), aucun titre. Le deck est Difficile à piloter.`,
    gagne: `La Légende ne fait rien au début. À 6 XP, toutes vos unités gagnent +1 Puissance ; à 11 XP, elles arrivent prêtes. L'XP vient des combats : **[[Gemhand Hunter]]** et **[[Wuju Apprentice]]** ont Chasse, **[[Grim Resolve]]** donne 2 XP quand l'unité qu'il renforce gagne son combat.

Au bout, **[[Master Yi, Unstoppable]]** coûte 12 énergie, mais de moins en moins à chaque palier d'XP.`,
    plan: `**Début de partie.** **[[Gemhand Hunter]]** et **[[Wuju Apprentice]]** se posent pour deux énergie et cherchent le combat. **[[Defy]]** et **[[Discipline]]** les protègent.

**Milieu de partie.** **[[Master Yi, Tempered]]** a Chasse 2, puis Protection et Gank au niveau 6. **[[Punch First]]** et **[[Grim Resolve]]** font gagner les combats qui comptent.

**Fin de partie.** À 11 XP, vos unités arrivent prêtes. **[[Master Yi, Unstoppable]]** arrive à prix réduit.

**Ce qui le bat.** Un adversaire qui refuse les combats vous prive d'XP, et la Légende reste muette. Sur Radiance, 3,3 % de conversion, et une vingt-huitième place pour meilleur résultat.`,
  },
  // ── Legendes ajoutees le 22 juillet 2026 ──────────────────────────────────
  // Ecrits a partir de la capacite reelle de chaque Legende et des cartes coeur
  // mesurees sur les decklists de tournoi (data/fiches/*.json). Les taux de jeu
  // cites viennent du comptage, pas d'une impression.
  "kaisa-daughter-of-the-void": {
    slug: "kaisa-daughter-of-the-void",
    bref: `Kai'Sa est un deck **Furie/Esprit** de **tempo par les sorts**. Sur Radiance, 264 joueurs classés sur 16 tournois, 28 dans les 10 % de tête : 10,6 % de conversion contre 9,9 % de moyenne, et un titre, la City Challenge de Pékin du 8 novembre.`,
    gagne: `Sa capacité tient en une ligne : épuise-la et vous obtenez une rune, mais uniquement pour lancer un sort. Autrement dit, vous avez chaque tour un sort presque gratuit de plus que l'adversaire. Tout le deck est bâti là-dessus.

Le résultat, c'est un deck qui répond à tout. **[[Falling Star]]** inflige 3 dégâts deux fois, de quoi nettoyer deux petites unités ou en abattre une grosse. **[[Hextech Ray]]** frappe à distance sur un champ de bataille. **[[Stupefy]]** affaiblit et repioche pour une énergie. Et quand vous voulez reprendre la main d'un coup, **[[Thousand-Tailed Watcher]]** arrive avec 7 de Puissance et retire 3 à toutes les unités adverses.`,
    plan: `**Début de partie.** Ne vous précipitez pas. Posez **[[Watchful Sentry]]** ou **[[Lecturing Yordle]]**, qui piochent en mourant ou en arrivant, et laissez l'adversaire s'engager le premier.

**Milieu de partie.** C'est là que vous prenez le dessus. Chaque combat où vous lancez un sort de plus se gagne, et votre capacité vous en offre un. **[[Smoke Screen]]** et **[[Stupefy]]**, jouables en Réaction, affaiblissent l'unité adverse au bon moment, et **[[Brynhir Thundersong]]** empêche l'adversaire de jouer des cartes le tour où elle arrive.

**Fin de partie.** **[[Thousand-Tailed Watcher]]** remet le plateau à plat, **[[Time Warp]]** vous donne un tour de plus pour 10 énergie. Sur Radiance, ce plan a gagné une fois, à la City Challenge de Pékin du 8 novembre.`,
  },
  "annie-dark-child": {
    slug: "annie-dark-child",
    bref: `Annie est un deck **Furie/Chaos** de **mouvement**, et une Légende rare en Vendetta : 38 joueurs classés sur 21 tournois, 4 dans les 10 % de tête (10,5 %), aucun titre.`,
    gagne: `Sa capacité prépare jusqu'à deux runes à la fin de votre tour. Concrètement, vous jouez pendant le tour adverse avec des ressources que les autres n'ont plus. C'est une invitation à remplir votre deck de réactions et à ne jamais rester passif.

Le reste du deck sert à déplacer les unités, les tiennes comme celles d'en face. **[[Flash]]** renvoie des unités à la base, **[[Rebuke]]** en renvoie une carrément en main, **[[Ride the Wind]]** repositionne au bon moment. Un champ de bataille que l'adversaire croyait tenir se vide juste avant qu'il ne marque.`,
    plan: `**Début de partie.** Développez sans vous exposer. **[[Traveling Merchant]]** échange une carte morte contre une neuve à chaque déplacement.

**Milieu de partie.** Choisissez vos combats et refusez les autres. Vous n'avez pas besoin de gagner un affrontement : sortir votre unité au dernier moment suffit à annuler celui de l'adversaire.

**Fin de partie.** **[[Kai'Sa, Survivor]]** pioche quand elle conquiert, **[[Vi, Destructive]]** passe d'un terrain à l'autre pour aller chercher le point qui manque. Gardez toujours deux runes prêtes : c'est ce qui rend vos fins de partie imprévisibles.`,
  },
  "darius-hand-of-noxus": {
    slug: "darius-hand-of-noxus",
    bref: `Darius est un deck **Furie/Ordre** d'**agression en série**, construit autour du mot-clé Légion. 419 joueurs classés sur 73 tournois, 46 dans les 10 % de tête (11,0 %) : régulier en haut de tableau, mais toujours pas de titre à son palmarès.`,
    gagne: `Sa capacité vous rend une énergie dès que vous avez déjà joué une carte dans le tour. Le deck entier récompense la même chose : enchaîner. **[[Noxus Hopeful]]** coûte deux énergies de moins si ce n'est pas votre première carte du tour, **[[Vanguard Captain]]** amène deux recrues avec lui dans les mêmes conditions.

Vous ne cherchez pas à survivre longtemps, vous cherchez à poser plus de corps que l'adversaire ne peut en gérer, puis à convertir. **[[Cleave]]** ajoute 3 de Puissance à un attaquant, **[[Grand Strategem]]** en ajoute 5 à toute votre armée d'un coup : le combat que l'adversaire pensait tenir est perdu d'avance.`,
    plan: `**Début de partie.** Visez deux cartes par tour dès que possible. Une seule carte jouée, et la moitié de votre deck fonctionne au tarif plein.

**Milieu de partie.** Saturez un champ de bataille. **[[Hidden Blade]]**, posée face cachée, retire gratuitement le défenseur qui bloquait tout, même en plein combat.

**Fin de partie.** **[[Grand Strategem]]** est votre carte de finition : gardez-la pour le tour où l'adversaire s'est enfin stabilisé, et retirez le verrou d'un seul sort.`,
  },
  "reksai-void-burrower": {
    slug: "reksai-void-burrower",
    bref: `Rek'Sai est un deck **Furie/Ordre** d'**agression large** : beaucoup de petites unités, et des cartes tirées du deck à chaque conquête. Sur Radiance, 108 joueurs classés sur 16 tournois, 11 dans les 10 % de tête (10,2 %, contre 9,9 % pour le format), aucun titre.`,
    gagne: `Quand vous conquérez, la Légende révèle les deux cartes du dessus de votre deck : vous en jouez une, le reste repart sous le deck. **[[Rek'Sai, Breacher]]**, dans toutes les listes, donne Accélération à ces unités-là, qui arrivent prêtes à combattre. Et **[[Undertitan]]** rend 2 énergie quand il est révélé ainsi.

Le reste du deck sert à conquérir. **[[Cull the Weak]]** oblige chaque joueur à tuer une de ses unités : avec vos jetons, vous y perdez peu. **[[Falling Star]]** inflige 3 dégâts deux fois.`,
    plan: `**Début de partie.** **[[Inferna]]** arrive en Embuscade avec Assaut 2. **[[Carrion Dredger]]** laisse un Oiseau en mourant, **[[Faithful Manufactor]]** pose un jeton Recrue en arrivant : de quoi nourrir **[[Cull the Weak]]**.

**Milieu de partie.** Chaque conquête déclenche la Légende. **[[Falling Star]]** et **[[Bilgewater Tracker]]** dégagent le chemin.

**Fin de partie.** **[[Undertitan]]** donne +2 Puissance à toutes vos autres unités pour le tour. **[[Noxus Hopeful]]** coûte 2 énergie de moins grâce à Légion.

**Ce qui le bat.** Un adversaire qui vous empêche de conquérir : sans conquête, la Légende ne fait rien. Sur Radiance, aucun titre, et sa meilleure place est une deuxième, à Guangzhou le 8 novembre.`,
  },
  "pyke-bloodharbor-ripper": {
    slug: "pyke-bloodharbor-ripper",
    bref: `Pyke est un deck **Furie/Chaos** de **retours en main** : il rejoue ses unités pour en tirer deux fois l'effet, et récupère de l'or au passage. Sur Radiance, 27 joueurs classés sur 8 tournois, aucun dans les 10 % de tête, aucun titre.`,
    gagne: `Pour une énergie, la Légende renvoie une de vos unités en main et pose un jeton d'or épuisé. Une unité condamnée est sauvée, et une unité qui fait quelque chose en arrivant peut le refaire. **[[Pyke, Dockside Butcher]]**, dans 89 % des listes, s'y prête : rejoué en payant une Puissance de Furie de plus, il arrive préparé avec +2 Puissance.

Autour, **[[Falling Star]]** et **[[Star-Crossed]]**, dans 94 % des listes, nettoient le terrain adverse.`,
    plan: `**Début de partie.** **[[Traveling Merchant]]** trie la main à chaque déplacement. **[[Tideturner]]** et **[[Bedeviling Stranger]]** attendent cachés.

**Milieu de partie.** La Légende sauve vos unités et rapporte de l'or. **[[Falling Star]]** inflige 3 dégâts deux fois. **[[Switcheroo]]** échange la Puissance de deux unités.

**Fin de partie.** **[[Fizz, Trickster]]** rejoue un sort depuis la défausse. **[[Vex, Apathetic]]** étourdit les unités que l'adversaire joue.

**Ce qui le bat.** Le deck n'a que deux cartes fixées : chaque liste est différente, et aucune n'a encore fait ses preuves. Sur Radiance, 27 joueurs seulement, aucun dans les 10 % de tête.`,
  },
  "jax-grandmaster-at-arms": {
    slug: "jax-grandmaster-at-arms",
    bref: `Jax est un deck **Calme/Corps** d'**équipement mobile**. 153 joueurs classés sur 26 tournois, 2 dans les 10 % de tête (1,3 %), aucun titre : jouable, jamais dominant. Un deck de patience plus que de pression.`,
    gagne: `Sa capacité déplace votre équipement d'une unité à l'autre, même déjà attaché. Vous n'avez donc pas besoin de protéger l'unité équipée : si elle meurt, l'équipement repart ailleurs. La menace, c'est le matériel, pas le porteur.

À partir de là, le deck protège ses unités avec ses réactions. **[[Guardian Angel]]** et **[[Brutalizer]]** s'attachent pour une seule rune Calme, et la muraille de réactions fait le reste : **[[Counter Strike]]** empêche les prochains dégâts et repioche, **[[Not So Fast]]** contre tout ce qui vise vos unités ou votre équipement, **[[Defy]]** contre le reste.`,
    plan: `**Début de partie.** Équipez une unité bon marché et installez-vous sur un terrain. Vous n'avez pas besoin d'aller vite.

**Milieu de partie.** Faites payer chaque tentative de retrait. Entre **[[Counter Strike]]**, **[[Not So Fast]]** et **[[Discipline]]**, l'adversaire doit dépenser deux ou trois cartes pour en tuer une seule.

**Fin de partie.** **[[Challenge]]** force un duel entre votre unité équipée et la leur : à ce stade la tienne est plus grosse, et l'échange est gagné d'avance.`,
  },
  "lucian-purifier": {
    slug: "lucian-purifier",
    bref: `Lucian est un deck **Furie/Corps** d'**équipement agressif**. 159 joueurs classés sur 28 tournois, 12 dans les 10 % de tête (7,5 %), aucun titre : le plan de jeu est clair, mais il convertit mal face aux decks qui savent retirer les unités.`,
    gagne: `Sa capacité donne Assaut à tous vos équipements : chaque unité équipée frappe plus fort en attaque. Vous n'équipez donc pas pour survivre, vous équipez pour marquer.

**[[Relentless Pursuit]]**, présente dans la totalité des listes, déplace une unité, y attache un équipement et lui permet de rentrer à la base après avoir conquis. Vous attaquez sans vous exposer au retour de bâton. **[[Lucian, Merciless]]** s'équipe à coût réduit en arrivant et se prépare la première fois qu'il conquiert chaque tour.`,
    plan: `**Début de partie.** Posez une unité et un équipement bon marché, **[[Doran's Blade]]** pour une seule rune Corps, et commencez à pousser.

**Milieu de partie.** **[[First Mate]]** prépare une autre unité en arrivant, ce qui vous donne deux attaques dans le même tour. **[[Punch First]]** ajoute 5 de Puissance pour une énergie et vole les combats que l'adversaire croyait perdus.

**Fin de partie.** **[[Challenge]]** nettoie le dernier défenseur en le forçant à échanger avec votre unité équipée. Attention : tout votre plan repose sur des unités qui portent le matériel, et un retrait bien placé vous coûte deux cartes d'un coup.`,
  },
  "garen-might-of-demacia": {
    slug: "garen-might-of-demacia",
    bref: `Garen est un deck **Corps/Ordre** de **rampe et de nombre**. 213 joueurs classés sur 39 tournois, 2 dans les 10 % de tête (0,9 %), aucun titre : une Légende de fin de partie, lente à démarrer et vulnérable en attendant.`,
    gagne: `Sa capacité récompense la masse : conquérez un champ de bataille avec au moins quatre unités dessus et vous piochez deux cartes. Ce n'est pas un deck qui frappe fort, c'est un deck qui frappe nombreux.

Avant ça, vous augmentez vos ressources. **[[Mobilize]]** et **[[Catalyst of Aeons]]** canalisent des runes en avance, et vous font piocher quand vous ne pouvez plus. Au bout, **[[Dazzling Aurora]]** pose une unité gratuite à chaque fin de tour, indéfiniment.`,
    plan: `**Début de partie.** Résistez et canalisez. Vos premiers tours ne marquent rien, ils préparent la suite.

**Milieu de partie.** Déployez large plutôt que gros. **[[Confront]]** fait entrer prêtes toutes les unités que vous posez ce tour et repioche : c'est votre tour de bascule.

**Fin de partie.** Avec **[[Dazzling Aurora]]** en jeu, vous produisez plus vite que l'adversaire ne nettoie. **[[Harnessed Dragon]]** tue une unité en arrivant et referme la partie.`,
  },
  "lux-lady-of-luminosity": {
    slug: "lux-lady-of-luminosity",
    bref: `Lux est un deck **Esprit/Ordre** de **contrôle par les gros sorts**. Sur Vendetta, 52 joueurs classés sur 20 tournois, 5 dans les 10 % de tête (9,6 %), aucun titre : elle répond à tout, mais elle a du mal à conclure avant que le temps ne tombe.`,
    gagne: `Sa capacité vous fait piocher chaque fois que vous lancez un sort à cinq énergies ou plus. Là où un deck normal se ruine à jouer cher, Lux se rembourse. Son deck est donc rempli de sorts que personne d'autre ne peut se permettre.

**[[Singularity]]** inflige 6 dégâts à deux unités d'un coup. **[[Imperial Decree]]** tue tout ce qui subit le moindre dégât pendant le tour. **[[Falling Comet]]** et **[[Drag Under]]** règlent les menaces isolées. Et **[[Time Warp]]**, à dix énergies, vous donne carrément un tour de plus.`,
    plan: `**Début de partie.** Vous allez concéder des points, c'est normal. Gardez **[[Bellows Breath]]** et **[[Cull the Weak]]** pour contenir les premières vagues à moindre coût.

**Milieu de partie.** Nettoyez le plateau au bon moment. Un **[[Singularity]]** sur deux unités bien choisies annule trois tours de développement adverse.

**Fin de partie.** C'est votre phase. Chaque gros sort repioche, vous enchaînez les réponses, et **[[Time Warp]]** vous donne le tour supplémentaire qui transforme l'avantage en victoire. Le vrai risque n'est pas de perdre le plateau, c'est de manquer de temps.`,
  },
  "renata-glasc-chem-baroness": {
    slug: "renata-glasc-chem-baroness",
    bref: `Renata Glasc est un deck **Esprit/Ordre** de **contrôle par les ressources**. Soyons honnêtes : 126 joueurs classés sur 14 tournois, aucun dans les 10 % de tête, aucun titre. Le deck est plaisant à piloter, mais il n'a rien prouvé en compétition.`,
    gagne: `Sa capacité fabrique de l'or dès que vous ou un allié contrôlez un terrain, et cet or rapporte une énergie de plus quand vous approchez du score de victoire. Vous jouez donc de plus en plus vite à mesure que la partie avance.

Le deck accumule les jetons d'or par tous les bouts : **[[Plundering Poro]]** en crée en conquérant, **[[Honest Broker]]** en laisse un en mourant, **[[Wages of Pain]]** en donne un en retirant une unité. Puis vous convertissez, souvent brutalement, avec **[[Hostile Takeover]]** qui prend le contrôle d'une unité adverse et l'active aussitôt.`,
    plan: `**Début de partie.** Tenez un terrain, même modeste. Sans contrôle, votre capacité ne se déclenche jamais.

**Milieu de partie.** Accumulez l'or et retire les menaces avec **[[Hidden Blade]]** et **[[Cull the Weak]]**. Vous ne cherchez pas à dominer le plateau, seulement à ne pas mourir.

**Fin de partie.** Près du score de victoire, votre or vaut double. **[[Hostile Takeover]]** puis **[[Time Warp]]** enchaînés dans le même tour sont votre meilleure fin de partie.`,
  },
  "yasuo-unforgiven": {
    slug: "yasuo-unforgiven",
    bref: `Yasuo est un deck **Calme/Chaos** de **repositionnement**. Toutes ères confondues, 526 joueurs classés, 15 dans les 10 % de tête (2,9 %), 1 titre : très choisi, très rarement payant. À jouer parce qu'il vous plaît, pas parce qu'il gagne.`,
    gagne: `Sa capacité déplace une unité amie vers sa base ou depuis sa base, pour deux énergies. Vous pouvez donc retirer un défenseur d'un combat perdu, ou en faire surgir un là où l'adversaire ne l'attendait pas.

Le reste est un socle de réactions solide mais sans surprise : **[[Defy]]** contre les sorts, **[[Discipline]]** et **[[En Garde]]** gonflent une unité et repiochent, **[[Zhonya's Hourglass]]** sauve une unité de la mort en la renvoyant à la base.`,
    plan: `**Début de partie.** Posez peu, gardez vos énergies. La force du deck, c'est de réagir.

**Milieu de partie.** Servez-vous de votre capacité comme d'un sort gratuit : chaque combat que vous refusez au dernier moment est une carte gagnée.

**Fin de partie.** Le problème du deck reste le même : il sait ne pas perdre, il sait mal gagner.`,
  },
  "jinx-loose-cannon": {
    slug: "jinx-loose-cannon",
    bref: `Jinx est un deck **Furie/Chaos** d'**agression main vide**. 456 joueurs classés sur 66 tournois, 11 dans les 10 % de tête (2,4 %), 1 titre : le plan est direct et amusant, le rendement reste faible.`,
    gagne: `Sa capacité vous fait piocher au début de votre tour si vous avez une carte ou moins en main. Vider sa main n'est donc pas une faiblesse ici, c'est la condition pour continuer à jouer.

Tout le deck consomme des cartes volontiers. **[[Chemtech Enforcer]]** défausse en arrivant, **[[Traveling Merchant]]** défausse et repioche à chaque déplacement, et **[[Super Mega Death Rocket!]]** revient de la défausse quand vous conquérez, contre une défausse de plus.`,
    plan: `**Début de partie.** Jouez tout. Garder des cartes en main coupe votre pioche et ralentit le deck.

**Milieu de partie.** Attaquez un terrain et conquérez pour ramener le missile. **[[Noxus Hopeful]]** à coût réduit remplit le plateau au passage.

**Fin de partie.** Vous finissez souvent la main vide face à un adversaire qui a des réponses. C'est le défaut de structure du deck : votre pioche est régulière mais lente, et une carte par tour ne suffit pas face à un contrôle installé.`,
  },
  "lee-sin-blind-monk": {
    slug: "lee-sin-blind-monk",
    bref: `Lee Sin est un deck **Calme/Corps** de **renfort progressif**. 380 joueurs classés sur 62 tournois, 16 dans les 10 % de tête (4,2 %), aucun titre : honnête en partie libre, en retrait en compétition.`,
    gagne: `Sa capacité renforce une unité amie chaque tour pour une énergie. Ce n'est pas décisif, mais c'est gratuit et ça s'accumule : une unité renforcée deux ou trois fois devient un mur que peu de decks savent franchir.

Autour, vous protégez cette pièce. **[[Zhonya's Hourglass]]** la sauve d'une mort certaine, **[[Defy]]** contre le sort qui la viserait, **[[Discipline]]** ajoute 2 de Puissance et repioche au moment du combat.`,
    plan: `**Début de partie.** Posez une unité que vous comptez garder longtemps et commencez à la renforcer dès que vous avez une énergie de libre.

**Milieu de partie.** **[[First Mate]]** et **[[Pit Rookie]]** vous donnent une deuxième action dans le tour, l'un en préparant une unité, l'autre en renforçant.

**Fin de partie.** **[[Charm]]** déplace le défenseur adverse hors du terrain que vous convoitez, et votre unité renforcée conquiert seule. Le point faible reste la lenteur : contre un deck qui marque tôt, vous renforcez une unité pendant qu'il prend des points.`,
  },
  "rumble-mechanized-menace": {
    slug: "rumble-mechanized-menace",
    bref: `Rumble est un deck **Furie/Esprit** **tribal Mechs**, le plus thématique du format. 171 joueurs classés sur 21 tournois, 1 dans les 10 % de tête (0,6 %), aucun titre : un deck de passionné, pas un choix de tournoi.`,
    gagne: `Sa capacité donne Bouclier à tous vos Mechs : ils gagnent en Puissance quand ils défendent. Chaque autre carte du deck empile un bonus supplémentaire sur la même famille. **[[Rumble, Scrapper]]** ajoute 1 de Puissance à tous les Mechs, **[[Rumble, Hotheaded]]** leur donne Assaut, **[[Breakneck Mech]]** leur ajoute Protection et le déplacement libre entre terrains.

Empilés, ces effets transforment des unités quelconques en armée cohérente que l'adversaire ne peut ni cibler facilement ni bloquer proprement.`,
    plan: `**Début de partie.** **[[Forecaster]]** et **[[Gem Jammer]]** posent les bases : le premier donne Vision à vos Mechs, le second offre le déplacement libre à une unité.

**Milieu de partie.** Enchaîne les Mechs qui se renforcent entre eux. **[[Bubble Bot]]** prépare un autre Mech en arrivant, ce qui vous donne une action de plus.

**Fin de partie.** **[[Ferrous Forerunner]]** laisse deux Mechs derrière lui en mourant : votre armée ne disparaît jamais vraiment. Le défaut du deck est là : il lui faut plusieurs pièces en jeu pour fonctionner, et il perd sèchement s'il se fait démonter avant de les avoir posées.`,
  },
};
