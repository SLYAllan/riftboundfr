/**
 * Les cinq tier lists, telles qu'elles sont RÉDIGÉES.
 *
 * Séparées du seed pour que `scripts/tier-ecarts.mts` puisse les relire sans
 * écrire en base : `seed-tier-lists.ts` ouvre un client Prisma et seede dès
 * l'import, l'importer pour vérifier aurait tout réécrit.
 *
 * Les lettres et les commentaires s'écrivent à la main, d'après
 * `npx tsx --env-file=.env scripts/tier-stats.mts <set|tous>`. Un rang est un
 * choix éditorial appuyé sur un test statistique, pas une sortie de calcul.
 * `npm run maj:stats` dit ce qui ne colle plus ; c'est un humain qui tranche.
 */

export interface TierEntry {
  legendName: string;
  tier: string;
  comment?: string;
  /**
   * Rang assumé CONTRE le test statistique, et pourquoi. `tier-ecarts.mts` cesse
   * alors de le signaler à chaque passage : un rapport qui répète deux lignes
   * qu'on a déjà tranchées finit par ne plus être lu du tout. Ce champ ne sort
   * pas sur le site, il n'existe que pour le contrôle.
   */
  assume?: string;
}

// Recalculé sur 6799 decks classés Origins (Shanghai NO + Beijing/Guangzhou/Chongqing/Hangzhou RO + City Challenges)
export const originsTier: TierEntry[] = [
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

export const spiritforgedTier: TierEntry[] = [
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
export const unleashedTier: TierEntry[] = [
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

  { legendName: "Annie, Dark Child", tier: "A", assume: "l'écart tient, mais sur cinq fois moins de monde que le trio de tête", comment: "15,3 % sur 274 joueurs (p = 0,010) et 3 titres : l'écart tient, mais sur quatre fois moins de monde que le trio de tête. Aggro Chaos/Fureur qui reste sous-jouée." },
  { legendName: "Sivir, Battle Mistress", tier: "A", assume: "l'écart tient, mais sur trois fois moins de monde que le trio de tête", comment: "13,4 % sur 432 joueurs (p = 0,040), 2 titres. Rampe Aurora, la meilleure économie de runes du format." },
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
export const globalTier: TierEntry[] = [
  // Relevé du 7 octobre 2026, toutes ères confondues : **43 831 joueurs classés
  // sur 134 tournois**, dont 53 au classement complet scrapé. Chiffres par
  // `npx tsx scripts/tier-stats.mts tous 0.10 100`. Conversion moyenne : 10,1 %,
  // sur une coupe proportionnelle à 10 % du champ de chaque tournoi.
  //
  // Lire ce classement pour ce qu'il est : un cumul d'Origines à Vendetta, quatre
  // formats qui n'ont ni la même liste de cartes ni les mêmes bans. Une Légende
  // n'a pas la même puissance dans chacun, et une moyenne sur quatre ères ne
  // remplace pas la tier list du format en cours. Pour jouer aujourd'hui, c'est
  // la tier list Vendetta qui compte.
  //
  // Huit écarts tiennent un test binomial au-dessus de la moyenne, et les huit
  // sont en S. Annie (p = 0,047) y est entrée au relevé de Singapour et s'y
  // tient de justesse : un p juste sous 0,05 ne tient pas toujours d'un relevé à
  // l'autre. LeBlanc, entrée le même jour, s'y installe (p = 0,007). Kennen a la
  // meilleure conversion de l'histoire du jeu (19,1 %) mais sur un seul set : il
  // est au-dessus, pas au-dessus depuis longtemps.

  { legendName: "Master Yi, Wuju Bladesman", tier: "S", comment: "4 482 joueurs, la Légende la plus jouée de l'histoire du jeu (10,2 % du champ toutes ères), 13,9 % de conversion et 20 titres. Présente et gagnante d'Origines à Vendetta." },
  { legendName: "Draven, Glorious Executioner", tier: "S", comment: "2 382 joueurs, 15,9 % de conversion, 14 titres. Meilleure conversion des grosses Légendes. Roi du Spiritforged, où il signe l'essentiel de ses titres." },
  { legendName: "Irelia, Blade Dancer", tier: "S", comment: "3 390 joueurs, 14,2 % de conversion, 15 titres. Tempo équipement, régulière sur quatre sets." },
  { legendName: "Kai'Sa, Daughter of the Void", tier: "S", comment: "3 807 joueurs, 11,7 % de conversion, 18 titres. Reine d'Origines (9,2 % du champ à elle seule), elle tient encore en Spiritforged puis s'efface." },
  { legendName: "Kennen, Heart of the Tempest", tier: "S", comment: "19,1 % de conversion, la meilleure jamais mesurée, mais sur 1 410 joueurs et un seul set. Domine Vendetta ; il est trop tôt pour dire qu'il domine le jeu." },
  { legendName: "Diana, Scorn of the Moon", tier: "S", comment: "1 513 joueurs, 12,6 % de conversion, 8 titres. Apparue en Déchaînement, immédiatement au sommet." },
  { legendName: "Annie, Dark Child", tier: "S", comment: "762 joueurs, 12,3 % de conversion, 5 titres. Au-dessus de la moyenne dans les quatre sets, et toujours sous-jouée. Elle passe le seuil statistique de justesse (p = 0,047) : un rang à revérifier au prochain relevé." },
  { legendName: "LeBlanc, Deceiver", tier: "S", comment: "1 421 joueurs, 12,3 %, 3 titres. Moteur de râle d'agonie. Son écart tient le test depuis Singapour, et de plus en plus nettement (p = 0,007)." },

  { legendName: "Sivir, Battle Mistress", tier: "A", comment: "733 joueurs, 11,5 %, 2 titres. Rampe Aurora." },
  { legendName: "Rengar, Pridestalker", tier: "A", comment: "862 joueurs, 11,8 %, 4 titres, dont le Regional Qualifier de Los Angeles et le City Challenge de Shanghai du 3 octobre." },
  { legendName: "Darius, Hand of Noxus", tier: "A", comment: "416 joueurs, 11,1 %, jamais titré. Aggro Corps/Fureur régulier en coupe." },
  { legendName: "Ezreal, Prodigal Explorer", tier: "A", comment: "1 030 joueurs, 10,7 %, sans titre. La moyenne du jeu toutes ères, à peine au-dessus. En Vendetta il convertit mieux (13,4 %), sans que l'écart tienne le test." },

  { legendName: "Azir, Emperor of the Sands", tier: "B", comment: "1 396 joueurs, 10,2 %, 6 titres dont Utrecht et Lille." },
  { legendName: "Jayce, Defender of Tomorrow", tier: "B", comment: "639 joueurs, 8,9 %, sans titre. Vendetta seulement." },
  { legendName: "Rek'Sai, Void Burrower", tier: "B", comment: "1 006 joueurs, 9,4 %, 1 titre." },
  { legendName: "Viktor, Herald of the Arcane", tier: "B", comment: "2 000 joueurs, 9,3 %, 4 titres. Beaucoup joué, jamais dominant." },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "B", comment: "924 joueurs, 9,2 %, 1 titre. Elle valait mieux que le D que les anciens relevés lui donnaient." },
  { legendName: "Fiora, Grand Duelist", tier: "B", comment: "1 417 joueurs, 9,1 %, 7 titres. Midrange Corps/Ordre." },
  { legendName: "Kha'Zix, Voidreaver", tier: "B", comment: "670 joueurs, 9,4 %, sans titre." },
  { legendName: "Sett, The Boss", tier: "B", comment: "864 joueurs, 8,8 % mais 8 titres : il gagne plus qu'il ne place." },
  { legendName: "Vex, Gloomist", tier: "B", comment: "910 joueurs, 9,5 %, 1 titre. Sous la moyenne, écart non établi (p = 0,545)." },
  { legendName: "Lillia, Bashful Bloom", tier: "B", comment: "812 joueurs, 7,9 %, 2 titres. L'écart en dessous tient maintenant le test, de justesse (p = 0,036)." },
  { legendName: "Lucian, Purifier", tier: "B", comment: "565 joueurs, 8,0 %. Sous la moyenne, écart non établi (p = 0,094)." },

  { legendName: "Lux, Lady of Luminosity", tier: "C", comment: "467 joueurs, 6,9 %, écart établi (p = 0,017)." },
  { legendName: "Teemo, Swift Scout", tier: "C", comment: "729 joueurs, 6,9 %, écart établi (p = 0,003)." },
  { legendName: "Akali, Rogue Assassin", tier: "C", comment: "637 joueurs, 7,2 %, écart établi (p = 0,015), et pourtant 4 titres : Singapour, le Regional Open de Shenyang, les City Challenge de Shanghai et de Guangzhou du 27 septembre. Vendetta seulement." },
  { legendName: "Pyke, Bloodharbor Ripper", tier: "C", comment: "536 joueurs, 5,2 %, écart établi (p < 0,001)." },
  { legendName: "Nasus, Curator of the Sands", tier: "C", comment: "477 joueurs, 5,7 %, 2 titres, écart établi (p = 0,001). Vendetta seulement." },
  { legendName: "Poppy, Keeper of the Hammer", tier: "C", comment: "253 joueurs, 4,3 %, écart établi (p = 0,001)." },
  { legendName: "Ornn, Fire Below the Mountain", tier: "C", comment: "842 joueurs, 5,2 %, écart établi, mais 1 titre : Barcelone, le plus gros tournoi jamais joué." },
  { legendName: "Jax, Grandmaster At Arms", tier: "C", comment: "429 joueurs, 4,2 %, écart établi (p < 0,001)." },

  { legendName: "Ahri, Nine-Tailed Fox", tier: "D", comment: "816 joueurs, 4,0 %, 1 titre, écart établi (p < 0,001). Beaucoup jouée sur trois sets, presque jamais récompensée." },
  { legendName: "Lee Sin, Blind Monk", tier: "D", comment: "377 joueurs, 4,0 %, écart établi (p < 0,001)." },
  { legendName: "Master Yi, Wuju Master", tier: "D", comment: "299 joueurs, 3,7 %, écart établi. À ne pas confondre avec le Wuju Bladesman, qui est en S." },
  { legendName: "Volibear, Relentless Storm", tier: "D", comment: "405 joueurs, 3,5 %, écart établi (p < 0,001)." },
  { legendName: "Vi, Piltover Enforcer", tier: "D", comment: "332 joueurs, 3,0 %, écart établi (p < 0,001)." },
  { legendName: "Mel, Soul's Reflection", tier: "D", comment: "213 joueurs, 2,8 %, écart établi (p < 0,001). Vendetta seulement." },
  { legendName: "Yasuo, Unforgiven", tier: "D", comment: "521 joueurs, 2,9 %, 1 titre, écart établi (p < 0,001)." },
  { legendName: "Zed, Master of Shadows", tier: "D", comment: "157 joueurs, 1,9 %, écart établi (p < 0,001). Vendetta seulement." },
  { legendName: "Jinx, Loose Cannon", tier: "D", comment: "456 joueurs, 2,4 %, 1 titre, écart établi (p < 0,001)." },
  { legendName: "Jhin, Virtuoso", tier: "D", comment: "322 joueurs, 3,1 %, écart établi (p < 0,001)." },
  { legendName: "Leona, Radiant Dawn", tier: "D", comment: "487 joueurs, 1,4 %, écart établi (p < 0,001)." },
  { legendName: "Rumble, Mechanized Menace", tier: "D", comment: "443 joueurs, 1,1 %, écart établi (p < 0,001)." },
  { legendName: "Ivern, Green Father", tier: "D", comment: "311 joueurs, quatre places en coupe sur toute l'histoire du jeu." },
  { legendName: "Garen, Might of Demacia", tier: "D", comment: "212 joueurs, 0,9 %, écart établi (p < 0,001)." },
  { legendName: "Ambessa, Matriarch of War", tier: "D", comment: "167 joueurs, une seule place en coupe, écart établi (p < 0,001). Vendetta seulement." },
  { legendName: "Renata Glasc, Chem-Baroness", tier: "D", comment: "316 joueurs, zéro place en coupe sur toute l'histoire du jeu." },
  { legendName: "Shen, Eye of Twilight", tier: "D", comment: "131 joueurs, zéro place en coupe. Vendetta seulement." },
  { legendName: "Renekton, Butcher of the Sands", tier: "D", comment: "85 joueurs, zéro place en coupe. Vendetta seulement." },
];

export const vendettaTier: TierEntry[] = [
  // Relevé du 7 octobre 2026, sur le CLASSEMENT COMPLET de 46 tournois
  // Vendetta : 13 494 joueurs classés, dont les Regional Qualifier de Barcelone
  // (2 127), de Los Angeles (1 966) et de Singapour (1 883), les Regional Open de
  // Wuhan (1 242) et de Shenyang (1 148), le Showdown d'Ottawa (579) et 40 autres
  // épreuves chinoises. Corpus produit par `scripts/classements-tournois.mts`,
  // chiffres par `scripts/tier-stats.mts`.
  //
  // Deux choix de méthode qui comptent :
  //
  // 1. On compte les JOUEURS CLASSÉS, pas les decklists publiées. Sur Barcelone,
  //    106 listes publiées pour 2 127 joueurs, sur Singapour 38 pour 1 883 : ce
  //    sont ceux qui performent qui publient, donc compter les listes gonflerait
  //    la conversion des Légendes populaires. Une liste incomplète reste écartée
  //    de la publication, mais elle dit quand même quelle Légende a joué et à
  //    quelle place.
  // 2. La coupe est PROPORTIONNELLE, 10 % du champ de chaque tournoi. Un Top 8
  //    sur 128 joueurs vaut 6,3 % du champ, sur 2 127 il vaut 0,4 % : les mêler
  //    revenait à noter deux formats sur le même barème.
  //
  // Conversion moyenne du format : 9,9 %.
  //
  // Règle du S : seul y entre l'écart qui tient un test binomial (p < 0,05).
  // Irelia en sort au relevé de Singapour (p = 0,055) après y être entrée avec
  // Wuhan (p = 0,041), et y revient au relevé du 30 septembre (p = 0,013), avec
  // Los Angeles et les City Challenge chinoises du 26 et du 27. LeBlanc y entre à
  // Singapour et s'y installe (p = 0,005). Ezreal y entre au relevé de Shenyang
  // (p = 0,022), après l'avoir raté de peu (p = 0,055), et en sort au relevé du
  // 7 octobre (p = 0,052). Rengar y entre au relevé
  // du 20 septembre (p = 0,029), après trois relevés au-dessus de la moyenne sans
  // jamais tenir le test. Les rangs A à D restent un classement
  // de lecture, pas un résultat de calcul. Le dire plutôt que le maquiller en science.
  //
  // Les Légendes d'Origines sont en bas parce qu'elles n'ont plus de Best-Of à
  // gagner, pas parce qu'elles sont faibles : quand la rotation retire une
  // Légende de la liste des prix, la salle la range avec. Leur part de champ ne
  // mesure plus rien.

  { legendName: "Kennen, Heart of the Tempest", tier: "S", comment: "La Légende de la période : 1 410 joueurs, 19,1 % de conversion contre 9,9 % pour le format, 10 titres, dont les City Challenge de Shanghai et de Guangzhou du 19 septembre. Finaliste à Barcelone et à Singapour, où il prend quatre des huit places du Top 8." },
  { legendName: "Master Yi, Wuju Bladesman", tier: "S", comment: "1 074 joueurs, 13,9 % de conversion (p < 0,001), 7 titres, le deuxième total du format, dont le City Challenge de Chengdu du 2 octobre. Le plus régulier : il place partout, dans les deux hémisphères." },
  { legendName: "LeBlanc, Deceiver", tier: "S", comment: "552 joueurs, 13,6 % de conversion, et l'écart tient le test (p = 0,005). Un premier titre, au City Challenge de Chongqing du 26 septembre : jusque-là elle plaçait sans gagner." },
  { legendName: "Rengar, Pridestalker", tier: "S", comment: "13,2 % sur 514 joueurs (p = 0,014), 3 titres : le Showdown d'Ottawa, le Regional Qualifier de Los Angeles et le City Challenge de Shanghai du 3 octobre." },
  { legendName: "Irelia, Blade Dancer", tier: "S", comment: "1 037 joueurs, 12,2 % (p = 0,017), 2 titres dont le Regional Open de Wuhan, et la finale de Los Angeles. De retour en S : l'écart tient de nouveau le test." },

  { legendName: "Ezreal, Prodigal Explorer", tier: "A", comment: "299 joueurs, 13,4 % de conversion, la quatrième du format, mais l'écart ne tient plus le test (p = 0,052). Sorti du S au relevé du 7 octobre. Sans titre." },
  { legendName: "Azir, Emperor of the Sands", tier: "A", comment: "11,4 % sur 536 joueurs, 3 titres, dont les City Challenge de Shanghai du 5 septembre et de Fuzhou du 27. Deux Azir dans le Top 4 de Los Angeles." },
  { legendName: "Rek'sai, Void Burrower", tier: "A", comment: "535 joueurs, 10,5 %, sans titre. Solide partout, dominante nulle part." },
  { legendName: "Draven, Glorious Executioner", tier: "A", comment: "9,2 % sur 358 joueurs, 1 titre. Retombé à la moyenne du format." },

  { legendName: "Kha'Zix, Voidreaver", tier: "B", comment: "313 joueurs, 10,9 %. Un peu au-dessus de la moyenne, sans que l'écart tienne (p = 0,569)." },
  { legendName: "Jayce, Defender of Tomorrow", tier: "B", comment: "639 joueurs, 8,9 %, sans titre. Un peu sous la moyenne du format, sans que l'écart tienne (p = 0,466)." },
  { legendName: "Diana, Scorn of the Moon", tier: "B", comment: "504 joueurs, 8,3 %, mais 5 titres : sous la moyenne en coupe, et pourtant le troisième total de victoires du format. Elle gagne plus qu'elle ne place." },
  { legendName: "Fiora, Grand Duelist", tier: "B", comment: "467 joueurs, 9,0 %, 3 titres : deux au City Challenge de Nanjing (15 août et 26 septembre), un à celui de Guangzhou du 1er octobre. La moyenne du format, ou presque." },
  { legendName: "Kai'Sa, Daughter of the Void", tier: "B", comment: "458 joueurs mais 8,3 %, pour 2 titres : très présente en Chine, presque absente à Barcelone et à Singapour. Le méta n'est pas le même des deux côtés." },
  { legendName: "Lillia, Bashful Bloom", tier: "B", comment: "323 joueurs, 6,5 %, 1 titre. En dessous, et l'écart tient le test, de justesse (p = 0,040)." },
  { legendName: "Ornn, Fire Below the Mountain", tier: "B", comment: "Vainqueur de Barcelone avec 2,7 % du champ, Top 8 à Los Angeles. Sa conversion reste basse, 6,8 % sur 366 joueurs, sans que l'écart en dessous tienne (p = 0,053) : un titre n'est toujours pas une tendance." },
  { legendName: "Viktor, Herald of the Arcane", tier: "B", comment: "174 joueurs, 6,9 %. Sous la moyenne, sans que l'écart tienne (p = 0,205)." },

  { legendName: "Sivir, Battle Mistress", tier: "C", comment: "10,7 % de conversion sur 103 joueurs, sans que l'écart tienne (p = 0,741). La moyenne, sur un petit échantillon." },
  { legendName: "Lux, Lady of Luminosity", tier: "C", comment: "50 joueurs, 10,0 %. Échantillon trop mince pour en tirer un rang." },
  { legendName: "Annie, Dark Child", tier: "C", comment: "29 joueurs. Rien de mesurable." },
  { legendName: "Vex, Gloomist", tier: "C", comment: "373 joueurs, 10,7 %, 1 titre, au City Challenge de Hangzhou du 19 septembre. Un peu au-dessus de la moyenne, sans que l'écart tienne (p = 0,544)." },
  { legendName: "Lucian, Purifier", tier: "C", comment: "144 joueurs, 7,6 %. Trop peu pour trancher, assez pour douter." },
  { legendName: "Akali, Rogue Assassin", tier: "C", comment: "4 titres, à Singapour avec Gorica, au Regional Open de Shenyang et aux City Challenge de Shanghai et de Guangzhou du 27 septembre, et pourtant 7,2 % de conversion sur 637 joueurs : l'écart en dessous tient le test (p = 0,024). Elle gagne, elle ne place pas." },
  { legendName: "Nasus, Curator of the Sands", tier: "C", comment: "477 joueurs pour 5,7 % : l'écart en dessous est établi (p = 0,001). Beaucoup jouée, peu récompensée, malgré 2 titres." },
  { legendName: "Sett, The Boss", tier: "C", comment: "31 joueurs sur 13 494. Le format l'a oubliée." },
  { legendName: "Poppy, Keeper of the Hammer", tier: "C", comment: "87 joueurs, deux places en coupe. Écart en dessous établi (p = 0,011)." },

  { legendName: "Mel, Soul's Reflection", tier: "D", comment: "213 joueurs, 2,8 %. Écart en dessous établi (p < 0,001)." },
  { legendName: "Master Yi, Wuju Master", tier: "D", comment: "135 joueurs, 3,7 %, écart établi (p = 0,013). À ne pas confondre avec le Wuju Bladesman, qui est en S." },
  { legendName: "Jhin, Virtuoso", tier: "D", comment: "112 joueurs, cinq places en coupe, 4,5 %. Sous la moyenne, mais l'écart ne tient plus le test, de peu (p = 0,056)." },
  { legendName: "Pyke, Bloodharbor Ripper", tier: "D", comment: "191 joueurs, 2,1 %. Écart établi (p < 0,001)." },
  { legendName: "Zed, Master of Shadows", tier: "D", comment: "157 joueurs, 1,9 %, trois places en coupe sur toute la période. Écart établi (p < 0,001)." },
  { legendName: "Vi, Piltover Enforcer", tier: "D", comment: "160 joueurs, trois places en coupe. Écart établi (p < 0,001)." },
  { legendName: "Ambessa, Matriarch of War", tier: "D", comment: "167 joueurs, une seule place en coupe. Écart établi (p < 0,001)." },
  { legendName: "Rumble, Mechanized Menace", tier: "D", comment: "149 joueurs, une seule place en coupe. Écart établi (p < 0,001)." },
  { legendName: "Jax, Grandmaster At Arms", tier: "D", comment: "128 joueurs, deux places en coupe (p < 0,001)." },
  { legendName: "Ivern, Green Father", tier: "D", comment: "151 joueurs, trois places en coupe (p < 0,001)." },
  { legendName: "Shen, Eye of Twilight", tier: "D", comment: "131 joueurs, zéro place en coupe (p < 0,001). Des Best-Of, jamais une place en coupe." },
  { legendName: "Renata Glasc, Chem-Baroness", tier: "D", comment: "104 joueurs, zéro place en coupe (p < 0,001)." },
  { legendName: "Renekton, Butcher of the Sands", tier: "D", comment: "85 joueurs, zéro place en coupe (p < 0,001)." },

  { legendName: "Leona, Radiant Dawn", tier: "D", comment: "25 joueurs sur toute la période. Légende d'Origines : plus de Best-Of à gagner avec elle, donc plus personne pour la jouer. Sa place ici ne dit pas sa puissance." },
  { legendName: "Teemo, Swift Scout", tier: "D", comment: "27 joueurs. Même cause que Leona : la rotation l'a sortie de la liste des prix." },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "D", comment: "11 joueurs. Origines, hors rotation." },
  { legendName: "Volibear, Relentless Storm", tier: "D", comment: "12 joueurs. Origines, hors rotation." },
  { legendName: "Ahri, Nine-Tailed Fox", tier: "D", comment: "20 joueurs. Origines, hors rotation." },
  { legendName: "Yasuo, Unforgiven", tier: "D", comment: "9 joueurs. Origines, hors rotation." },
  { legendName: "Jinx, Loose Cannon", tier: "D", comment: "6 joueurs. Origines, hors rotation." },
  { legendName: "Darius, Hand of Noxus", tier: "D", comment: "3 joueurs. Origines, hors rotation." },
  { legendName: "Lee Sin, Blind Monk", tier: "D", comment: "6 joueurs sur 13 494. Origines, hors rotation." },
];
