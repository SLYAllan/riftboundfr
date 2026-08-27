---
name: reecrire
description: Réécrit un texte français selon les six règles du projet et retire les tics d'écriture IA. À utiliser pour toute prose rendue sur le site (article, guide, texte de page, description), et pour un message de commit ou une description de PR. Ne pas utiliser pour du code ni pour des termes techniques.
---

# Réécrire selon les six règles

Les six règles (Orwell, 1946). Elles valent pour la prose, **jamais pour le code
ni les termes techniques**. Remplacer par un mot courant seulement si le sens
reste exact.

1. Jamais une image qu'on lit partout ailleurs.
2. Jamais un mot long quand un court suffit.
3. Si un mot peut sauter, le couper.
4. Jamais le passif quand l'actif est possible.
5. Jamais un mot savant, du jargon ou un mot étranger si un mot français courant existe.
6. Enfreindre ces règles plutôt qu'écrire une horreur.

## Marche à suivre

D'abord lister chaque infraction, séparément :

- chaque tournure toute faite ;
- chaque mot long, avec le mot court qui le remplace ;
- chaque mot à couper ;
- chaque passif, avec sa version active.

Ensuite seulement, donner la réécriture.

## Éviter le ton IA

Un texte naturel ne cherche pas un effet à chaque phrase. À la relecture :

- remplacer les phrases nominales et les fragments par des phrases ordinaires ;
- couper les annonces creuses comme « les chiffres parlent », « ce que X raconte »,
  « à l'autre bout » ou « prochaine étape » ;
- ne pas interpeller le lecteur pour commenter une donnée (« regardez », « notez ») :
  dire ce qu'elle montre ;
- éviter les oppositions montées de toutes pièces et les phrases en miroir ;
- retirer les images vagues comme « mètre étalon », « sortir du sac », « laisser de
  la place » ou « trouver un angle » ;
- varier la longueur sans fabriquer un rythme de slogans ;
- relier chaque avis à un fait précis. Si le fait suffit, supprimer l'avis.

Ne pas rendre le texte plat pour autant. Garder une voix franche, des verbes précis
et les détails qui donnent envie de lire. Lire le résultat à voix haute : si une
phrase ressemble à une légende de réseau social ou à une conclusion de dissertation,
la reprendre.

## Ce qui ne bouge pas

Garder tels quels : faits, chiffres, noms, chemins de fichiers, termes du jeu,
blocs de code. Une réécriture qui change un chiffre est un bug, pas un style.

## Deux règles propres au site

- **Aucun tiret cadratin (—) dans le contenu rendu.** Toléré dans les docs
  internes et les commentaires de code.
- Terminologie française officielle du jeu : `docs/META-KNOWLEDGE.md`.

## Messages de commit

Format du dépôt : `portée: ce qui change`, en français, en minuscules, à
l'indicatif. Dire ce qui change et pourquoi. Pas de ton triomphal, pas de
« complet », « exhaustif », « robuste », « optimal ». Un relecteur doit
comprendre à la première lecture.
