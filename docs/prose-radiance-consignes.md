# Réécrire la prose d'une Légende sur les chiffres Radiance

Site : Riftbound France (jeu de cartes Riftbound), dépôt
`C:\Users\Allan\Documents\Claude\RiftboundFr`. Tu ne modifies AUCUN fichier du dépôt.
Tu écris seulement les fichiers de sortie demandés.

## Ce qui a changé

Les fiches Légendes affichent maintenant les cartes et les résultats du set **Radiance**
(11 tournois, 2 033 joueurs classés au relevé du 8 novembre 2026 ; à relire dans
l'en-tête de `radianceTier`, `scripts/tier-tables.ts`, avant chaque passe). Leur prose, elle, décrit encore les listes de
**Vendetta** : des cartes qui ne sont plus jouées, des chiffres d'un autre set. Tu la
réécris pour qu'elle colle à ce que la page affiche.

## Ton dossier

Pour chaque Légende, un fichier `packs/<slug>.json` contient :

- `fiche` : ce que la page affiche. `keyCards` (cartes jouées, avec le % des listes et
  le nombre d'exemplaires), `champions`, `topBattlefields`, `competitiveResults`
  (`joueursClasses`, `coupe10` = joueurs dans les 10 % de tête, `titres`, `conversion`,
  `tournois`, `listesPubliees`, `bestPlacements`), `difficulty`, `domains`.
- `prose_actuelle` : la prose de fiche à remplacer (`archetype`, `legendAbility`,
  `gameplan` {earlyGame, midGame, lateGame, winCondition}, `strengths`, `weaknesses`).
- `guide_actuel` : le guide à remplacer (`bref`, `gagne`, `plan`), en markdown.
- `cartes` : le texte réel (anglais) de chaque carte nommée, et `jouee_en_radiance`.
- `contexte` : moyenne du format (9,9 %), ban.

## Règles absolues

1. **N'invente rien.** Une carte citée doit être dans `fiche.keyCards` ou
   `fiche.champions`, ou être la Légende elle-même. Un pourcentage ou un nombre
   d'exemplaires se recopie depuis `keyCards`/`champions`. Un chiffre de résultat vient
   de `competitiveResults` ou de `contexte`. Ce que fait une carte se lit dans
   `cartes[].texte`, JAMAIS de mémoire.
2. **Une carte de l'ancien texte qui a `jouee_en_radiance: false` disparaît**, avec
   la phrase qui en parle. Stacked Deck est interdit : ne le cite plus.
3. Pas de nom de tournoi, de joueur, de date qui ne soit dans le dossier. Les titres
   et les meilleures places viennent de `competitiveResults`.
4. Si le dossier ne permet pas d'écrire une phrase (trop peu de listes, carte au rôle
   flou), coupe-la. Un texte court et vrai vaut mieux qu'un texte long et deviné.
5. Peu de joueurs (moins de 30) : dis-le simplement, ne tire pas de conclusion.

## Chiffres

- Conversion : `coupe10 / joueursClasses`, écrite « 11,5 % », comparée à la moyenne du
  format, 9,9 %. Virgule décimale, espace avant `%`, espace fine ou normale dans les
  milliers (« 2 033 »).
- Écrire « N joueurs classés sur M tournois », « N dans les 10 % de tête », « aucun
  titre » / « un titre » / « N titres ». « Sur Radiance » ou « en Radiance » si le set
  doit être nommé.
- Ne recopie AUCUN chiffre de l'ancien texte : ils sont tous de Vendetta.

## Langue

- Français courant. Phrases courtes. Voix active. Le lecteur est un joueur qui veut
  savoir comment jouer ce deck aujourd'hui. Pas de ton publicitaire, pas de « robuste »,
  « incontournable », « redoutable », pas de métaphore toute faite.
- **Aucun tiret cadratin (—)** ni demi-cadratin pour une incise. Virgules, deux-points.
- Pas d'anglicisme quand le mot français existe. Les mots-clés du jeu ont leur nom
  français officiel : lis `src/lib/glossary.ts` (champ `term` = français, `en` =
  anglais) et `docs/META-KNOWLEDGE.md`, section « 8. Glossaire FR ». Exemples :
  Assault = Assaut, Shield = Bouclier, Deathknell = Agonie, Ambush = Embuscade,
  Might = Puissance, Exhaust = Épuiser, Ready = Préparer, Trash = Défausse.
- **Les noms de cartes restent en anglais**, exactement comme dans `cartes[].nom`.
- Dans le **guide** : chaque carte s'écrit `**[[Nom exact]]**`, comme dans
  `guide_actuel`. Pas de backtick (`), pas de `${`. Les intertitres du `plan` gardent la
  forme `**Début de partie.**`, `**Milieu de partie.**`, `**Fin de partie.**`,
  `**Ce qui le bat.**`. Paragraphes séparés par une ligne vide.
- Dans la **prose de fiche** : noms de cartes en clair, sans crochets ni gras, comme
  dans `prose_actuelle`.
- Garde à peu près la longueur et la structure de l'ancien texte.

## Ce que tu gardes

- `legendAbility` : ne le change pas, recopie-le tel quel (la Légende n'a pas changé).
- `archetype` : garde-le, sauf si les cartes jouées le contredisent nettement.
- Le style et le ton de l'ancien texte, qui ont été relus par l'auteur du site.

## Ce que tu écris

Un fichier `propositions/<slug>.json` par Légende, au format exact :

```json
{
  "slug": "<slug>",
  "prose": {
    "archetype": "…",
    "legendAbility": "…",
    "gameplan": { "earlyGame": "…", "midGame": "…", "lateGame": "…", "winCondition": "…" },
    "strengths": ["…", "…"],
    "weaknesses": ["…", "…"]
  },
  "guide": { "bref": "…", "gagne": "…", "plan": "…" },
  "sources": ["<chaque chiffre ou fait cité> : <champ du dossier où il se lit>"],
  "coupe": ["<ce que tu as retiré de l'ancien texte, et pourquoi>"]
}
```

Si `prose_actuelle.gameplan` n'a pas `winCondition`, ne l'ajoute pas. JSON valide,
UTF-8, guillemets échappés.

Avant de rendre chaque fichier, relis-le contre les règles absolues : chaque carte
citée est-elle dans `keyCards`/`champions` ? chaque chiffre a-t-il sa ligne dans
`sources` ? un tiret cadratin traîne-t-il ?
