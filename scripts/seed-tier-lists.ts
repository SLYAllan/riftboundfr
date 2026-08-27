import { PrismaClient } from "@prisma/client";
import { resoudreLegende } from "./tier-list-integrity";

const prisma = new PrismaClient();

interface TierEntry {
  legendName: string;
  tier: string;
  comment?: string;
}

// Recalculé sur 6799 decks classés Origins (Shanghai NO + Beijing/Guangzhou/Chongqing/Hangzhou RO + City Challenges)
const originsTier: TierEntry[] = [
  // Relevé du 27 août 2026, sur 6 673 joueurs classés répartis sur 26 tournois.
  // Chiffres par `npx tsx scripts/tier-stats.mts Origins`. Conversion moyenne du
  // format : 10,2 %, sur une coupe proportionnelle à 10 % du champ.
  //
  // **Aucun classement complet n'est relevé pour Origines.** Les chiffres portent
  // donc sur les tournois qui publient plus de 90 % de leurs listes, tous chinois.
  // Trois tournois sont écartés faute de couverture : Houston (80 listes sur
  // 1 347 joueurs), Beijing Regional Open jour 1 (7 sur 512) et la City Challenge
  // de Chengdu du 9 novembre (64 sur 128). Riftdecks ne publie pas leur
  // classement : vérifié, ce n'est pas un scrape manquant.
  { legendName: "Kai'Sa, Daughter of the Void", tier: "S", comment: "27,7 % du champ (1 846 joueurs) ET 13,4 % de conversion contre 10,2 % pour le format (p < 0,001), avec 12 titres. La reine d'Origines, sans discussion." },
  { legendName: "Master Yi, Wuju Bladesman", tier: "S", comment: "23,0 % du champ (1 536 joueurs), 12,5 % de conversion (p = 0,004), 6 titres. Le seul autre écart qui tient un test." },
  { legendName: "Darius, Hand of Noxus", tier: "A", comment: "11,6 % de conversion sur 173 joueurs. Au-dessus de la moyenne, sur un échantillon court. Aggro Corps/Fureur." },
  { legendName: "Annie, Dark Child", tier: "A", comment: "10,0 % sur 219 joueurs, 1 titre. Exactement la moyenne du format, pour une Légende quatre fois moins jouée que les deux du dessus." },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "A", comment: "9,2 % sur 368 joueurs, 1 titre. Rampe Aurora Corps/Chaos." },
  { legendName: "Viktor, Herald of the Arcane", tier: "B", comment: "Troisième du champ avec 776 joueurs (11,6 %) mais 8,6 % de conversion, 2 titres. Beaucoup joué, à peine sous la moyenne." },
  { legendName: "Teemo, Swift Scout", tier: "B", comment: "8,0 % sur 364 joueurs, 1 titre. Tempo et gêne." },
  { legendName: "Sett, The Boss", tier: "B", comment: "7,8 % sur 357 joueurs, mais 4 titres : il gagne plus qu'il ne place. Midrange Corps/Ordre." },
  { legendName: "Lee Sin, Blind Monk", tier: "B", comment: "5,8 % sur 139 joueurs. Sous la moyenne, sans que l'écart tienne." },
  { legendName: "Volibear, Relentless Storm", tier: "B", comment: "4,7 % sur 85 joueurs. Échantillon trop court pour trancher." },
  { legendName: "Ahri, Nine-Tailed Fox", tier: "C", comment: "299 joueurs pour 6,4 % : écart en dessous établi (p = 0,028). Un titre, mais pas de régularité." },
  { legendName: "Jinx, Loose Cannon", tier: "C", comment: "3,4 % sur 146 joueurs, écart établi (p = 0,004). Aggro Chaos/Fureur." },
  { legendName: "Yasuo, Unforgiven", tier: "C", comment: "3,2 % sur 157 joueurs, écart établi (p = 0,001)." },
  { legendName: "Leona, Radiant Dawn", tier: "D", comment: "2,7 % sur 110 joueurs, écart établi (p = 0,007). Midrange défensif." },
  { legendName: "Lux, Lady of Luminosity", tier: "D", comment: "65 joueurs, zéro place en coupe (p = 0,002)." },
  { legendName: "Garen, Might of Demacia", tier: "D", comment: "33 joueurs, zéro place en coupe. Le moins joué du pool Origines." },
];

const spiritforgedTier: TierEntry[] = [
  // Relevé du 27 août 2026, sur 9 685 joueurs classés répartis sur 28 tournois,
  // dont DEUX au classement complet scrapé : Atlanta (1 514 classés) et Lille
  // (1 804). Chiffres par `npx tsx scripts/tier-stats.mts Spiritforged`.
  // Conversion moyenne du format : 10,1 %, coupe proportionnelle à 10 %.
  //
  // Trois tournois restent écartés faute de couverture : Bologna (120 listes sur
  // 1 719 joueurs), Las Vegas (153 sur 1 670) et Fuzhou (511 sur 800). Vérifié :
  // riftdecks ne publie pas leur classement complet, seulement leurs decks. Ce
  // n'est donc pas un scrape à relancer, c'est une donnée qui n'existe pas.
  { legendName: "Draven, Glorious Executioner", tier: "S", comment: "17,9 % du champ (1 732 joueurs) ET 18,0 % de conversion contre 10,1 % pour le format (p < 0,001), avec 15 titres. Le roi du set, sur les deux tableaux à la fois." },
  { legendName: "Irelia, Blade Dancer", tier: "S", comment: "1 204 joueurs, 15,4 % de conversion (p < 0,001), 3 titres. Tempo équipement." },
  { legendName: "Darius, Hand of Noxus", tier: "A", comment: "12,0 % sur 117 joueurs. Au-dessus de la moyenne, sur un échantillon court." },
  { legendName: "Annie, Dark Child", tier: "A", comment: "11,3 % sur 240 joueurs et 2 titres. Toujours sous-jouée pour ce qu'elle rend." },
  { legendName: "Kai'Sa, Daughter of the Void", tier: "A", comment: "1 095 joueurs (11,3 % du champ), 11,2 % de conversion, 4 titres. La reine d'Origines tient son rang dans le set suivant." },
  { legendName: "Master Yi, Wuju Bladesman", tier: "B", comment: "9,5 % sur 401 joueurs, aucun titre en Spiritforged. Il chute nettement par rapport à Origines." },
  { legendName: "Viktor, Herald of the Arcane", tier: "B", comment: "594 joueurs, 8,8 %, 2 titres. Contrôle Esprit/Ordre." },
  { legendName: "Lucian, Purifier", tier: "B", comment: "8,5 % sur 270 joueurs. Sous la moyenne, écart non établi." },
  { legendName: "Ezreal, Prodigal Explorer", tier: "B", comment: "429 joueurs, 7,9 %. Contrôle exigeant." },
  { legendName: "Sett, The Boss", tier: "B", comment: "7,6 % sur 198 joueurs, 1 titre." },
  { legendName: "Sivir, Battle Mistress", tier: "B", comment: "7,6 % sur 198 joueurs. Rampe Aurora." },
  { legendName: "Azir, Emperor of the Sands", tier: "B", comment: "7,2 % sur 334 joueurs, 1 titre. Frôle le seuil statistique (p = 0,084)." },
  { legendName: "Lee Sin, Blind Monk", tier: "B", comment: "6,7 % sur 105 joueurs, échantillon court." },
  { legendName: "Jax, Grandmaster At Arms", tier: "C", comment: "6,0 % sur 168 joueurs (p = 0,093)." },
  { legendName: "Fiora, Grand Duelist", tier: "C", comment: "473 joueurs pour 7,0 % : écart en dessous établi (p = 0,026), malgré 1 titre." },
  { legendName: "Rek'Sai, Void Burrower", tier: "C", comment: "5,7 % sur 283 joueurs, écart établi (p = 0,013), 1 titre." },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "C", comment: "5,3 % sur 151 joueurs, tout près du seuil (p = 0,057)." },
  { legendName: "Ahri, Nine-Tailed Fox", tier: "C", comment: "4,1 % sur 218 joueurs, écart établi (p = 0,002)." },
  { legendName: "Lux, Lady of Luminosity", tier: "C", comment: "4,0 % sur 175 joueurs, écart établi (p = 0,005)." },
  { legendName: "Yasuo, Unforgiven", tier: "D", comment: "2,7 % sur 185 joueurs, écart établi (p < 0,001)." },
  { legendName: "Ornn, Fire Below the Mountain", tier: "D", comment: "2,2 % sur 225 joueurs, écart établi (p < 0,001)." },
  { legendName: "Teemo, Swift Scout", tier: "D", comment: "2,2 % sur 139 joueurs, écart établi (p = 0,001)." },
  { legendName: "Rumble, Mechanized Menace", tier: "D", comment: "2,2 % sur 186 joueurs, écart établi (p < 0,001)." },
  { legendName: "Volibear, Relentless Storm", tier: "D", comment: "1,6 % sur 128 joueurs, deux places en coupe." },
  { legendName: "Jinx, Loose Cannon", tier: "D", comment: "1,5 % sur 136 joueurs, deux places en coupe." },
  { legendName: "Leona, Radiant Dawn", tier: "D", comment: "0,8 % sur 125 joueurs, une seule place en coupe." },
  { legendName: "Renata Glasc, Chem-Baroness", tier: "D", comment: "105 joueurs, zéro place en coupe." },
  { legendName: "Garen, Might of Demacia", tier: "D", comment: "71 joueurs, zéro place en coupe." },
];

// Recalculé le 21 juillet 2026 sur 9 555 decks classés Unleashed via scripts/tier-unleashed.py
// (S3 City Challenges + Xi'an/Tianjin/Changsha RO + Suzhou RQ + Sydney + Vancouver + Utrecht
//  + Hartford, classement complet 1 659 + S3 National Open, classement complet 2 030).
// Taux de Top 8 moyen des decks = 2,76 % : c'est la barre qui sépare les légendes qui convertissent de celles qui sont surjouées.
// NB dev : deux légendes Master Yi distinctes, Wuju Bladesman et Wuju Master.
// Le champion NE permet PAS de les distinguer : mesuré sur les 307 Bladesman du National Open
// (scrape complet), 82 % jouent Tempered et 18 % Honed, et les Wuju Master jouent Tempered aussi.
// Toujours lire la légende réelle du deck, jamais la déduire du champion ni du set.
const unleashedTier: TierEntry[] = [
  // Relevé du 27 août 2026, refait sur 13 979 joueurs classés répartis sur
  // 34 tournois : 5 dont le classement COMPLET a été scrapé (Utrecht, Hartford,
  // Vancouver, Sydney, Suzhou) et 29 dont plus de 90 % des listes sont publiées.
  // Corpus par `scripts/classements-tournois.mts`, chiffres par
  // `scripts/tier-stats.mts Unleashed`.
  //
  // Le relevé du 21 juillet était faux, et pas d'un peu. Il comptait les listes
  // publiées, or les Regional Qualifier occidentaux n'en publient presque aucune :
  // Utrecht 3 %, Hartford 5 %, Vancouver 7 %, Sydney 3 %. Le « méta Unleashed »
  // n'était donc qu'un méta chinois, et les Légendes surtout jouées en Occident
  // n'apparaissaient qu'à travers leur top.
  //
  // Deux verdicts sont retournés par le nouveau corpus :
  //   - **Miss Fortune** était en D, « 0,4 %, la pire conversion du set ». Elle
  //     est à 10,7 % sur 394 joueurs, soit la moyenne exacte du format.
  //   - **Vex** était en C pour « piège volume, ça ne se traduit jamais ». Elle
  //     est à 8,6 % sur 537 joueurs, indistinguable de la moyenne.
  // Les deux étaient des artefacts de la publication, pas des faits de jeu.
  //
  // Conversion moyenne du format : 10,3 %. La coupe est proportionnelle, 10 % du
  // champ de chaque tournoi, jamais un Top 8 fixe : un Top 8 sur 128 joueurs vaut
  // 6,3 % du champ, sur 1 807 il en vaut 0,4 %.
  //
  // Règle du S : seul y entre l'écart qui tient un test binomial (p < 0,05), avec
  // un échantillon de plus de mille joueurs. Cinq Légendes passent le test ;
  // Annie et Sivir le passent aussi mais sur trois à cinq fois moins de monde,
  // elles sont donc en A.

  { legendName: "Master Yi, Wuju Bladesman", tier: "S", comment: "1 471 joueurs, 16,7 % de conversion contre 10,3 % pour le format (p < 0,001), et 7 titres. Le plus joué du set ET le mieux converti : c'est rare, et ça se voit." },
  { legendName: "Irelia, Blade Dancer", tier: "S", comment: "1 149 joueurs, 14,9 % (p < 0,001), 9 titres, le record du set. A gagné le S3 National Open, dont la finale opposait deux Irelia." },
  { legendName: "Diana, Scorn of the Moon", tier: "S", comment: "1 009 joueurs, 14,8 % (p < 0,001), 3 titres dont Vancouver. La plus régulière des trois." },

  { legendName: "Annie, Dark Child", tier: "A", comment: "15,3 % sur 274 joueurs (p = 0,010) et 3 titres : l'écart tient, mais sur quatre fois moins de monde que le trio de tête. Aggro Chaos/Fureur qui reste sous-jouée." },
  { legendName: "Sivir, Battle Mistress", tier: "A", comment: "13,4 % sur 432 joueurs (p = 0,040), 2 titres. Rampe Aurora, la meilleure économie de runes du format." },
  { legendName: "Viktor, Herald of the Arcane", tier: "A", comment: "12,3 % sur 456 joueurs. Au-dessus de la moyenne sans que l'écart tienne un test. Contrôle Esprit/Ordre." },
  { legendName: "Rek'Sai, Void Burrower", tier: "A", comment: "12,2 % sur 188 joueurs. 3e à Tianjin, 5e au National, Top 8 à Utrecht. Peu jouée, elle rend." },
  { legendName: "Ezreal, Prodigal Explorer", tier: "A", comment: "11,9 % sur 302 joueurs, 3e à Hartford. Contrôle Chaos/Esprit exigeant." },
  { legendName: "Draven, Glorious Executioner", tier: "A", comment: "11,6 % sur 292 joueurs. Aggro Chaos/Fureur, sans titre en Unleashed mais régulier en coupe." },
  { legendName: "Sett, The Boss", tier: "A", comment: "11,5 % sur 278 joueurs et 3 titres. Midrange Corps/Ordre." },
  { legendName: "LeBlanc, Deceiver", tier: "A", comment: "11,5 % sur 869 joueurs, 2 titres. Quatrième du set en présence, et au-dessus de la moyenne : le relevé de juillet la faisait tomber en B sur un corpus qui la voyait mal." },
  { legendName: "Fiora, Grand Duelist", tier: "A", comment: "11,3 % sur 477 joueurs, 3 titres. Midrange Corps/Ordre." },

  { legendName: "Lux, Lady of Luminosity", tier: "B", comment: "11,3 % sur 177 joueurs. Au-dessus de la moyenne, sur un échantillon court." },
  { legendName: "Azir, Emperor of the Sands", tier: "B", comment: "10,8 % sur 526 joueurs, 2 titres dont Utrecht. La moyenne du format, à la décimale." },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "B", comment: "10,7 % sur 394 joueurs. Elle était classée D avec « 0,4 %, la pire du set » : c'était un artefact du corpus, elle est à la moyenne." },
  { legendName: "Rengar, Pridestalker", tier: "B", comment: "9,8 % sur 348 joueurs, finaliste de Vancouver." },
  { legendName: "Darius, Hand of Noxus", tier: "B", comment: "9,8 % sur 123 joueurs. Aggro Corps/Fureur, Top 8 à Utrecht." },
  { legendName: "Kai'Sa, Daughter of the Void", tier: "B", comment: "9,6 % sur 408 joueurs, aucun titre en Unleashed. La reine d'Origines tient sans dominer." },
  { legendName: "Lillia, Bashful Bloom", tier: "B", comment: "8,8 % sur 489 joueurs, 1 titre. Contrôle tempo Calme/Esprit." },
  { legendName: "Vex, Gloomist", tier: "B", comment: "8,6 % sur 537 joueurs. Elle était en C pour « piège volume » : l'écart à la moyenne ne tient aucun test. Le verdict venait du corpus, pas du jeu." },
  { legendName: "Kha'Zix, Voidreaver", tier: "B", comment: "8,1 % sur 357 joueurs. Aggro combo, un cran sous la moyenne." },
  { legendName: "Teemo, Swift Scout", tier: "B", comment: "8,0 % sur 199 joueurs. Sous la moyenne, sans que l'écart tienne." },
  { legendName: "Lucian, Purifier", tier: "B", comment: "7,3 % sur 151 joueurs. Échantillon court, écart non établi." },

  { legendName: "Pyke, Bloodharbor Ripper", tier: "C", comment: "7,0 % sur 345 joueurs, écart en dessous établi (p = 0,041). 4e à Tianjin, 8e à Hartford, mais rien de régulier." },
  { legendName: "Ornn, Fire Below the Mountain", tier: "C", comment: "5,6 % sur 251 joueurs, écart établi (p = 0,012)." },
  { legendName: "Poppy, Keeper of the Hammer", tier: "C", comment: "5,4 % sur 166 joueurs, écart établi (p = 0,040)." },
  { legendName: "Jax, Grandmaster At Arms", tier: "C", comment: "4,5 % sur 133 joueurs, écart établi (p = 0,022)." },
  { legendName: "Vi, Piltover Enforcer", tier: "C", comment: "4,1 % sur 172 joueurs, écart établi (p = 0,004)." },
  { legendName: "Volibear, Relentless Storm", tier: "C", comment: "3,9 % sur 180 joueurs, écart établi (p = 0,003). Rampe midrange." },
  { legendName: "Master Yi, Wuju Master", tier: "C", comment: "3,7 % sur 164 joueurs, écart établi. À ne pas confondre avec le Wuju Bladesman, qui est en S." },

  { legendName: "Jhin, Virtuoso", tier: "D", comment: "2,4 % sur 210 joueurs, écart établi (p < 0,001)." },
  { legendName: "Jinx, Loose Cannon", tier: "D", comment: "2,4 % sur 168 joueurs, écart établi (p < 0,001). Aggro Chaos/Fureur." },
  { legendName: "Yasuo, Unforgiven", tier: "D", comment: "2,4 % sur 170 joueurs, écart établi (p < 0,001)." },
  { legendName: "Garen, Might of Demacia", tier: "D", comment: "1,9 % sur 106 joueurs, écart établi (p = 0,002)." },
  { legendName: "Ahri, Nine-Tailed Fox", tier: "D", comment: "1,8 % sur 279 joueurs, écart établi (p < 0,001). Elle est bien plus jouée que le relevé de juillet ne le montrait, mais elle ne convertit pas." },
  { legendName: "Leona, Radiant Dawn", tier: "D", comment: "0,9 % sur 227 joueurs : 2 places en coupe sur toute la période." },
  { legendName: "Ivern, Green Father", tier: "D", comment: "0,6 % sur 160 joueurs, une seule place en coupe." },
  { legendName: "Lee Sin, Blind Monk", tier: "D", comment: "127 joueurs, zéro place en coupe." },
  { legendName: "Renata Glasc, Chem-Baroness", tier: "D", comment: "107 joueurs, zéro place en coupe." },
  { legendName: "Rumble, Mechanized Menace", tier: "D", comment: "108 joueurs, zéro place en coupe." },
];

// Recalculé le 21 juillet 2026 sur 23 780 decks classés toutes ères (Origins + Spiritforged + Unleashed),
// classements complets de Hartford et du S3 National Open inclus. Taux de Top 8 moyen = 3,23 %.
// Commande : python -X utf8 scripts/tier-unleashed.py Global
const globalTier: TierEntry[] = [
  // Relevé du 27 août 2026, toutes ères confondues : **35 597 joueurs classés sur
  // 111 tournois**, dont 30 au classement complet scrapé. Chiffres par
  // `npx tsx scripts/tier-stats.mts tous`. Conversion moyenne : 10,2 %, sur une
  // coupe proportionnelle à 10 % du champ de chaque tournoi.
  //
  // Lire ce classement pour ce qu'il est : un cumul d'Origines à Vendetta, quatre
  // formats qui n'ont ni la même liste de cartes ni les mêmes bans. Une Légende
  // n'a pas la même puissance dans chacun, et une moyenne sur quatre ères ne
  // remplace pas la tier list du format en cours. Pour jouer aujourd'hui, c'est
  // la tier list Vendetta qui compte.
  //
  // Six écarts tiennent un test binomial au-dessus de la moyenne. Kennen a la
  // meilleure conversion de l'histoire du jeu (18,5 %) mais sur un seul set et
  // 568 joueurs : il est au-dessus, pas au-dessus depuis longtemps.

  { legendName: "Master Yi, Wuju Bladesman", tier: "S", comment: "3 930 joueurs, la Légende la plus jouée de l'histoire du jeu (11,0 % du champ toutes ères), 14,0 % de conversion et 18 titres. Présente et gagnante d'Origines à Vendetta." },
  { legendName: "Draven, Glorious Executioner", tier: "S", comment: "2 208 joueurs, 16,7 % de conversion, 16 titres. Meilleure conversion des grosses Légendes. Roi du Spiritforged, où il signe 15 de ses titres." },
  { legendName: "Irelia, Blade Dancer", tier: "S", comment: "2 746 joueurs, 14,6 % de conversion, 13 titres. Tempo équipement, régulière sur trois sets." },
  { legendName: "Kai'Sa, Daughter of the Void", tier: "S", comment: "3 634 joueurs, 11,9 % de conversion, 18 titres, autant que Master Yi. Reine d'Origines (27,7 % du champ à elle seule), elle tient encore en Spiritforged puis s'efface." },
  { legendName: "Kennen, Heart of the Tempest", tier: "S", comment: "18,5 % de conversion, la meilleure jamais mesurée, mais sur 568 joueurs et un seul set. Domine Vendetta ; il est trop tôt pour dire qu'il domine le jeu." },
  { legendName: "Diana, Scorn of the Moon", tier: "S", comment: "1 244 joueurs, 13,7 % de conversion, 7 titres. Apparue en Déchaînement, immédiatement au sommet." },

  { legendName: "Annie, Dark Child", tier: "A", comment: "753 joueurs, 12,4 % de conversion, 6 titres. Au-dessus de la moyenne dans les quatre sets, et toujours sous-jouée. Rate le seuil statistique de peu (p = 0,054)." },
  { legendName: "Sivir, Battle Mistress", tier: "A", comment: "667 joueurs, 11,8 %, 2 titres. Rampe Aurora." },
  { legendName: "LeBlanc, Deceiver", tier: "A", comment: "1 012 joueurs, 11,6 %, 2 titres. Moteur de râle d'agonie." },
  { legendName: "Darius, Hand of Noxus", tier: "A", comment: "415 joueurs, 11,1 %, jamais titré. Aggro Corps/Fureur régulier en coupe." },
  { legendName: "Rengar, Pridestalker", tier: "A", comment: "498 joueurs, 10,8 %, 2 titres." },
  { legendName: "Ezreal, Prodigal Explorer", tier: "A", comment: "860 joueurs, 10,5 %. La moyenne du jeu, à la décimale." },

  { legendName: "Jayce, Defender of Tomorrow", tier: "B", comment: "193 joueurs, 9,8 %. Vendetta seulement, échantillon court." },
  { legendName: "Azir, Emperor of the Sands", tier: "B", comment: "1 040 joueurs, 9,7 %, 4 titres dont Utrecht et Lille." },
  { legendName: "Viktor, Herald of the Arcane", tier: "B", comment: "1 916 joueurs, 9,5 %, 4 titres. Beaucoup joué, jamais dominant." },
  { legendName: "Rek'Sai, Void Burrower", tier: "B", comment: "717 joueurs, 9,5 %, 1 titre." },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "B", comment: "917 joueurs, 9,3 %, 1 titre. Elle valait mieux que le D que les anciens relevés lui donnaient." },
  { legendName: "Fiora, Grand Duelist", tier: "B", comment: "1 117 joueurs, 9,1 %, 5 titres. Midrange Corps/Ordre." },
  { legendName: "Sett, The Boss", tier: "B", comment: "850 joueurs, 8,9 % mais 8 titres : il gagne plus qu'il ne place." },
  { legendName: "Kha'Zix, Voidreaver", tier: "B", comment: "480 joueurs, 8,5 %." },
  { legendName: "Lillia, Bashful Bloom", tier: "B", comment: "612 joueurs, 8,5 %, 2 titres." },
  { legendName: "Lucian, Purifier", tier: "B", comment: "464 joueurs, 7,8 %. Sous la moyenne, écart non établi (p = 0,091)." },
  { legendName: "Mel, Soul's Reflection", tier: "B", comment: "94 joueurs, 4,3 %. Vendetta seulement, trop peu pour trancher (p = 0,059)." },
  { legendName: "Renekton, Butcher of the Sands", tier: "B", comment: "25 joueurs sur toute l'histoire du jeu. Rien de mesurable." },

  { legendName: "Vex, Gloomist", tier: "C", comment: "623 joueurs, 7,7 %, écart en dessous établi (p = 0,040)." },
  { legendName: "Lux, Lady of Luminosity", tier: "C", comment: "446 joueurs, 7,0 %, écart établi (p = 0,023)." },
  { legendName: "Teemo, Swift Scout", tier: "C", comment: "711 joueurs, 6,8 %, 1 titre, écart établi (p = 0,002)." },
  { legendName: "Nasus, Curator of the Sands", tier: "C", comment: "258 joueurs, 6,2 %, 2 titres, écart établi. Vendetta seulement." },
  { legendName: "Pyke, Bloodharbor Ripper", tier: "C", comment: "411 joueurs, 6,1 %, écart établi (p = 0,004)." },
  { legendName: "Akali, Rogue Assassin", tier: "C", comment: "201 joueurs, 5,5 %, écart établi (p = 0,026). Vendetta seulement." },
  { legendName: "Poppy, Keeper of the Hammer", tier: "C", comment: "183 joueurs, 4,9 %, écart établi (p = 0,014)." },
  { legendName: "Jax, Grandmaster At Arms", tier: "C", comment: "342 joueurs, 4,7 %, écart établi (p < 0,001)." },
  { legendName: "Ornn, Fire Below the Mountain", tier: "C", comment: "572 joueurs, 4,5 %, écart établi, mais 1 titre : Barcelone, le plus gros tournoi jamais joué." },
  { legendName: "Zed, Master of Shadows", tier: "C", comment: "62 joueurs, 3,2 %. Vendetta seulement, échantillon court." },
  { legendName: "Shen, Eye of Twilight", tier: "C", comment: "38 joueurs, zéro place en coupe. Rien de mesurable." },

  { legendName: "Ahri, Nine-Tailed Fox", tier: "D", comment: "802 joueurs, 4,1 %, 1 titre, écart établi (p < 0,001). Beaucoup jouée sur trois sets, presque jamais récompensée." },
  { legendName: "Lee Sin, Blind Monk", tier: "D", comment: "372 joueurs, 4,0 %, écart établi (p < 0,001)." },
  { legendName: "Volibear, Relentless Storm", tier: "D", comment: "402 joueurs, 3,5 %, écart établi (p < 0,001)." },
  { legendName: "Vi, Piltover Enforcer", tier: "D", comment: "232 joueurs, 3,0 %, écart établi (p < 0,001)." },
  { legendName: "Yasuo, Unforgiven", tier: "D", comment: "519 joueurs, 2,9 %, 1 titre, écart établi (p < 0,001)." },
  { legendName: "Master Yi, Wuju Master", tier: "D", comment: "210 joueurs, 2,9 %, écart établi. À ne pas confondre avec le Wuju Bladesman, qui est en S." },
  { legendName: "Jinx, Loose Cannon", tier: "D", comment: "453 joueurs, 2,4 %, 1 titre, écart établi (p < 0,001)." },
  { legendName: "Jhin, Virtuoso", tier: "D", comment: "250 joueurs, 2,0 %, écart établi (p < 0,001)." },
  { legendName: "Ambessa, Matriarch of War", tier: "D", comment: "65 joueurs, une seule place en coupe. Vendetta seulement." },
  { legendName: "Leona, Radiant Dawn", tier: "D", comment: "473 joueurs, 1,5 %, écart établi (p < 0,001)." },
  { legendName: "Rumble, Mechanized Menace", tier: "D", comment: "360 joueurs, 1,4 %, écart établi (p < 0,001)." },
  { legendName: "Garen, Might of Demacia", tier: "D", comment: "210 joueurs, 1,0 %, écart établi (p < 0,001)." },
  { legendName: "Ivern, Green Father", tier: "D", comment: "203 joueurs, une seule place en coupe sur toute l'histoire du jeu." },
  { legendName: "Renata Glasc, Chem-Baroness", tier: "D", comment: "239 joueurs, zéro place en coupe." },
];

const vendettaTier: TierEntry[] = [
  // Relevé du 26 août 2026, sur le CLASSEMENT COMPLET de 23 tournois Vendetta :
  // 5 260 joueurs classés, dont le Regional Qualifier de Barcelone (2 127) et
  // 21 City Challenge chinoises. Corpus produit par
  // `scripts/classements-tournois.mts`, chiffres par `scripts/tier-stats.mts`.
  //
  // Deux changements de méthode par rapport au relevé du 17 août, et ils comptent
  // tous les deux :
  //
  // 1. On compte les JOUEURS CLASSÉS, plus les decklists publiées. Sur Barcelone,
  //    106 listes publiées pour 2 127 joueurs : ce sont ceux qui performent qui
  //    publient, donc l'ancienne base gonflait la conversion des Légendes
  //    populaires. Une liste incomplète reste écartée de la publication, mais
  //    elle dit quand même quelle Légende a joué et à quelle place.
  // 2. La coupe est PROPORTIONNELLE, 10 % du champ de chaque tournoi. Un Top 8
  //    sur 128 joueurs vaut 6,3 % du champ, sur 2 127 il vaut 0,4 % : les mêler
  //    revenait à noter deux formats sur le même barème.
  //
  // Conversion moyenne du format : 10,0 %.
  //
  // Règle du S : seul y entre l'écart qui tient un test binomial (p < 0,05).
  // Kennen (p < 0,001) et Master Yi Wuju Bladesman (p = 0,002) s'y tiennent.
  // Les rangs A à D restent un classement de lecture, pas un résultat de calcul.
  // Le dire plutôt que le maquiller en science.
  //
  // Les Légendes d'Origines sont en bas parce qu'elles n'ont plus de Best-Of à
  // gagner, pas parce qu'elles sont faibles : quand la rotation retire une
  // Légende de la liste des prix, la salle la range avec. Leur part de champ ne
  // mesure plus rien.

  { legendName: "Kennen, Heart of the Tempest", tier: "S", comment: "La Légende de la période : 568 joueurs et 18,5 % de conversion contre 10,0 % pour le format. Trois sièges du Top 8 de Barcelone, et la finale." },
  { legendName: "Master Yi, Wuju Bladesman", tier: "S", comment: "522 joueurs, 14,4 % de conversion. Le seul autre écart qui tient un test statistique. Deux places en Top 8 à Barcelone." },

  { legendName: "Ezreal, Prodigal Explorer", tier: "A", comment: "Meilleure conversion hors S, 15,5 % sur 129 joueurs. Il rate le seuil statistique de peu (p = 0,054) : peu joué, mais il rend." },
  { legendName: "Rengar, Pridestalker", tier: "A", comment: "13,3 % sur 150 joueurs, et le seul Rengar de Barcelone finit 6e. Sa part monte de 4,5 % à 6,9 % entre le samedi et le dimanche." },
  { legendName: "LeBlanc, Deceiver", tier: "A", comment: "11,9 % sur 143 joueurs. Discrète au premier rang, régulière en coupe." },
  { legendName: "Draven, Glorious Executioner", tier: "A", comment: "13,0 % sur 184 joueurs. Perd du terrain au fil du week-end à Barcelone, de 4,2 % à 2,4 %, mais convertit quand il reste." },
  { legendName: "Rek'sai, Void Burrower", tier: "A", comment: "246 joueurs, 11,8 %. Solide partout, dominante nulle part." },
  { legendName: "Azir, Emperor of the Sands", tier: "A", comment: "11,1 % sur 180 joueurs, et une 3e place à Barcelone pour Squirtle, déjà champion d'Utrecht." },
  { legendName: "Irelia, Blade Dancer", tier: "A", comment: "Troisième Légende du format en présence, 393 joueurs, mais 11,2 % de conversion : très jouée, à peine au-dessus de la moyenne." },

  { legendName: "Jayce, Defender of Tomorrow", tier: "B", comment: "193 joueurs, 9,8 %. La moyenne du format, à la décimale." },
  { legendName: "Diana, Scorn of the Moon", tier: "B", comment: "235 joueurs, 9,4 %. Tient son rang sans progresser." },
  { legendName: "Kha'Zix, Voidreaver", tier: "B", comment: "123 joueurs, 9,8 %. Même profil que Diana, sur deux fois moins de monde." },
  { legendName: "Fiora, Grand Duelist", tier: "B", comment: "167 joueurs, 9,0 %. Un cran sous la moyenne, sans que l'écart tienne." },
  { legendName: "Viktor, Herald of the Arcane", tier: "B", comment: "90 joueurs, 7,8 %. L'échantillon devient court pour trancher." },
  { legendName: "Kai'Sa, Daughter of the Void", tier: "B", comment: "285 joueurs mais 8,1 % : très présente en Chine, presque absente à Barcelone (18 joueurs). Le méta n'est pas le même des deux côtés." },
  { legendName: "Ornn, Fire Below the Mountain", tier: "B", comment: "Vainqueur de Barcelone avec 2 % du champ. Sa conversion reste sous la moyenne, 7,3 % sur 96 joueurs : un titre n'est pas une tendance." },
  { legendName: "Lillia, Bashful Bloom", tier: "B", comment: "123 joueurs, 7,3 %. En dessous, mais l'écart ne tient pas encore." },

  { legendName: "Nasus, Curator of the Sands", tier: "C", comment: "258 joueurs pour 6,2 % : l'écart en dessous est établi (p = 0,047). Beaucoup jouée, peu récompensée." },
  { legendName: "Akali, Rogue Assassin", tier: "C", comment: "201 joueurs, 5,5 %, écart établi (p = 0,033). Deuxième relevé de suite en dessous." },
  { legendName: "Lucian, Purifier", tier: "C", comment: "43 joueurs, 4,7 %. Trop peu pour trancher, assez pour douter." },
  { legendName: "Mel, Soul's Reflection", tier: "C", comment: "94 joueurs, 4,3 %. Frôle le seuil statistique (p = 0,082)." },
  { legendName: "Zed, Master of Shadows", tier: "C", comment: "62 joueurs, deux places en coupe sur toute la période." },
  { legendName: "Sivir, Battle Mistress", tier: "C", comment: "16,2 % de conversion, mais sur 37 joueurs : à surveiller, pas à classer." },
  { legendName: "Lux, Lady of Luminosity", tier: "C", comment: "29 joueurs, 13,8 %. Échantillon trop mince pour en tirer un rang." },
  { legendName: "Annie, Dark Child", tier: "C", comment: "20 joueurs, deux places en coupe. Rien de mesurable." },
  { legendName: "Shen, Eye of Twilight", tier: "C", comment: "38 joueurs, aucune place en coupe. Un Best-Of à Barcelone, rien de plus." },
  { legendName: "Renata Glasc, Chem-Baroness", tier: "C", comment: "27 joueurs, aucune place en coupe. Son seul Best-Of vient de la liste publiée par Riot." },
  { legendName: "Renekton, Butcher of the Sands", tier: "C", comment: "25 joueurs, aucune place en coupe." },
  { legendName: "Sett, The Boss", tier: "C", comment: "17 joueurs sur 5 260. Le format l'a oubliée." },
  { legendName: "Poppy, Keeper of the Hammer", tier: "C", comment: "17 joueurs, aucune place en coupe." },

  { legendName: "Vex, Gloomist", tier: "D", comment: "86 joueurs, 2,3 %. Écart en dessous établi (p = 0,011)." },
  { legendName: "Ambessa, Matriarch of War", tier: "D", comment: "65 joueurs, une seule place en coupe. Écart établi (p = 0,020)." },
  { legendName: "Rumble, Mechanized Menace", tier: "D", comment: "66 joueurs, une seule place en coupe. Écart établi." },
  { legendName: "Pyke, Bloodharbor Ripper", tier: "D", comment: "66 joueurs, une seule place en coupe. Écart établi." },
  { legendName: "Vi, Piltover Enforcer", tier: "D", comment: "60 joueurs, zéro place en coupe. L'écart le plus net du bas de tableau (p = 0,004)." },
  { legendName: "Master Yi, Wuju Master", tier: "D", comment: "46 joueurs, zéro place en coupe. À ne pas confondre avec le Wuju Bladesman, qui est en S." },
  { legendName: "Ivern, Green Father", tier: "D", comment: "43 joueurs, zéro place en coupe." },
  { legendName: "Jax, Grandmaster At Arms", tier: "D", comment: "41 joueurs, zéro place en coupe." },
  { legendName: "Jhin, Virtuoso", tier: "D", comment: "40 joueurs, zéro place en coupe." },

  { legendName: "Leona, Radiant Dawn", tier: "D", comment: "11 joueurs sur toute la période. Légende d'Origines : plus de Best-Of à gagner avec elle, donc plus personne pour la jouer. Sa place ici ne dit pas sa puissance." },
  { legendName: "Volibear, Relentless Storm", tier: "D", comment: "9 joueurs. Même cause que Leona : la rotation l'a sortie de la liste des prix." },
  { legendName: "Teemo, Swift Scout", tier: "D", comment: "9 joueurs, dont un seul à Barcelone. Origines, hors rotation." },
  { legendName: "Yasuo, Unforgiven", tier: "D", comment: "7 joueurs. Origines, hors rotation." },
  { legendName: "Ahri, Nine-Tailed Fox", tier: "D", comment: "6 joueurs. Origines, hors rotation." },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "D", comment: "4 joueurs, dont un seul à Barcelone. Origines, hors rotation." },
  { legendName: "Jinx, Loose Cannon", tier: "D", comment: "3 joueurs. Origines, hors rotation." },
  { legendName: "Darius, Hand of Noxus", tier: "D", comment: "2 joueurs. Origines, hors rotation." },
  { legendName: "Lee Sin, Blind Monk", tier: "D", comment: "1 joueur sur 5 260. Origines, hors rotation." },
];



async function seedTierList(
  title: string,
  setContext: string,
  entries: TierEntry[],
  isCurrent: boolean,
) {
  const legendCards = await prisma.card.findMany({
    where: { type: "Legend", alternateArt: false, overnumbered: false, signature: false, set: { not: "OPP" } },
    select: { riftboundId: true, name: true },
  });

  const resolvedEntries = entries.map((e, i) => {
    // Une résolution par prénom publiait la mauvaise image dès qu'un champion avait
    // plusieurs Légendes. Le nom complet canonique est désormais obligatoire.
    const legendId = resoudreLegende(
      e.legendName,
      legendCards.map((carte) => ({ id: carte.riftboundId, name: carte.name })),
    ) ?? "";
    return {
      legendId,
      legendName: e.legendName,
      tier: e.tier,
      position: i + 1,
      comment: e.comment ?? null,
    };
  });

  const unresolved = resolvedEntries.filter((e) => !e.legendId);
  if (unresolved.length > 0) {
    throw new Error(`${unresolved.length} Légendes introuvables : ${unresolved.map((e) => e.legendName).join(", ")}`);
  }

  const existing = await prisma.tierList.findFirst({
    where: { title },
  });
  if (existing) {
    await prisma.tierListEntry.deleteMany({ where: { tierListId: existing.id } });
    await prisma.tierList.delete({ where: { id: existing.id } });
  }

  const tierList = await prisma.tierList.create({
    data: {
      title,
      description: `Tier list ${setContext}`,
      setContext,
      published: true,
      current: isCurrent,
      entries: {
        create: resolvedEntries.filter((e) => e.legendId),
      },
    },
  });

  console.log(`✓ ${title}: ${resolvedEntries.filter((e) => e.legendId).length} entries`);
  return tierList;
}

async function main() {
  console.log("Seeding tier lists...\n");

  await prisma.tierList.updateMany({ where: { current: true }, data: { current: false } });

  await seedTierList("Tier List Origins", "Origins", originsTier, false);
  await seedTierList("Tier List Spiritforged", "Spiritforged", spiritforgedTier, false);
  // Vendetta = format actuel → liste « courante » affichée par défaut (/meta + /tier-list).
  await seedTierList("Tier List Unleashed", "Unleashed", unleashedTier, false);
  await seedTierList("Tier List Vendetta", "Vendetta", vendettaTier, true);
  await seedTierList("Tier List Globale", "Global", globalTier, false);

  console.log("\n✅ All tier lists seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
