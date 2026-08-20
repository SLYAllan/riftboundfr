# Companion mobile de l’overlay

Date : 2026-08-20
Statut : design validé

## But

Permettre à deux joueurs de gérer seuls une partie filmée depuis un téléphone posé entre eux. Le companion ouvre un compteur face-à-face et met à jour l’overlay de stream. Le diffuseur peut donc jouer sans garder le tableau de bord ouvert.

Le companion reste accessible par un lien privé, sans compte Discord. L’overlay compact garde son propre lien pour Moblin.

## Liens

- `/overlay/<token>?compact=1` : source de l’overlay compact dans Moblin.
- `/compagnon/<token>/<cle>` : commande mobile partagée avec les joueurs.

Le lien companion porte une clé d’écriture. Le tableau de bord rappelle de ne pas le montrer en direct. « Nouveau lien » révoque le lien de l’overlay et celui du companion, comme aujourd’hui.

## Parcours de création

Le long formulaire actuel devient un parcours en trois étapes. Le téléphone reste dans le sens normal pendant cette phase.

### 1. Partie

- format BO1, BO3 ou BO5 ;
- nombre de points pour gagner : 8, 9 ou 10 ;
- nom des deux joueurs.

### 2. Decks

Pour chaque joueur :

- Légende ;
- Champion élu, filtré selon la Légende ;
- un champ de bataille actif.

Les listes viennent des API existantes. Un échec ne produit jamais une liste vide sans explication : le companion affiche l’erreur et un bouton « Réessayer ».

### 3. Vérification

Le companion résume les choix des deux joueurs. « Lancer la partie » ouvre le compteur. Un bouton « Retour » permet de corriger chaque étape sans perdre les valeurs.

Le parcours n’impose ni Légende, ni Champion, ni champ de bataille. Ces données améliorent le rendu, mais une partie improvisée doit pouvoir commencer avec les noms et le format seuls.

## Compteur face-à-face

Le téléphone se pose entre les deux joueurs en mode portrait :

- le joueur 1 occupe la moitié basse ;
- le joueur 2 occupe la moitié haute, tournée à 180° ;
- chaque moitié utilise l’illustration de sa Légende comme fond ;
- un voile sombre garde le nom, le Champion, le champ de bataille et les points lisibles ;
- les boutons moins et plus mesurent au moins 64 px ;
- les points restent le premier élément visuel.

Une barre centrale neutre affiche :

- le score des manches ;
- le format et le seuil de points ;
- l’état `Envoi…`, `À jour` ou `Hors ligne` ;
- l’accès aux réglages ;
- « Fin de la manche ».

Sur un écran bas ou en paysage, le compteur peut défiler. Il ne doit jamais couper un bouton. Les zones fixes tiennent compte des encoches et de la barre d’accueil du téléphone.

## Fin de manche et fin de match

« Fin de la manche » ouvre un dialogue accessible. Le choix de chaque gagnant fait face au joueur concerné. Après le choix :

1. le gagnant gagne une manche ;
2. les points des deux joueurs reviennent à zéro ;
3. le compteur reprend si le BO continue.

Le companion garde l’état qui précédait la dernière manche. « Annuler la dernière manche » restaure les points et le score. Une seule annulation suffit.

Quand un joueur gagne le BO, un dialogue annonce le gagnant. Il propose :

- « Corriger la dernière manche » ;
- « Nouveau match », avec confirmation avant la remise à zéro.

## Envoi des changements

Le companion continue d’envoyer des patchs pour ne pas écraser le décor ou les cartes que le diffuseur règle dans son tableau de bord.

Une file unique garantit l’ordre :

1. un seul envoi part à la fois ;
2. les changements reçus pendant cet envoi se fusionnent ;
3. un échec remet le patch en tête de file ;
4. « Réessayer » renvoie ce patch ;
5. le companion garde son état local et signale clairement qu’il diffère de l’overlay.

Les requêtes utilisent `keepalive` afin qu’un envoi déjà parti puisse finir si la page se ferme. Au départ de la page, le companion tente aussi d’envoyer le patch encore en attente. Il ne promet pas un mode hors ligne durable après la fermeture du navigateur.

## Accessibilité et texte

- Les dialogues utilisent le composant `Dialog` existant : focus bloqué, touche Échap et retour au déclencheur.
- Les erreurs utilisent `role="alert"` et donnent une action.
- Les états de sauvegarde et de copie utilisent une région `status` stable.
- Toutes les petites actions tactiles atteignent 44 px.
- Le rouge d’erreur utilise `text-error-light` sur les fonds sombres.
- Les pseudos longs sont coupés sans élargir la page.
- Les champs gardent une taille de 16 px sur mobile.
- Le companion reste utilisable au clavier et au zoom 200 %.

Texte principal : « Vos changements s’affichent sur le stream dès qu’ils sont enregistrés. »

Erreur réseau : « Modification non envoyée. Vérifiez votre connexion, puis réessayez. »

## Bloc de partage du tableau de bord

Le bloc « Lien compagnon (téléphone) » devient une vraie section avec un titre. Le bouton de copie :

- attend la réponse du presse-papiers ;
- affiche et annonce « Copié » en cas de succès ;
- affiche une erreur en cas de refus.

Un seul avertissement suffit : « Toute personne qui possède ce lien peut modifier l’habillage. Ne le montrez pas en direct. »

## Données et composants réutilisés

- `OverlayStateData` et `applyStateUpdate` gardent l’état du match.
- `/api/legends`, `/api/legends/champions` et `/api/battlefields` fournissent les choix.
- `imageUrl` de la Légende fournit le fond du compteur.
- `/api/overlay/[token]/compagnon` reste le point d’écriture.
- `Dialog` de `src/components/ui/dialog.tsx` gère les fenêtres.
- Les couleurs, polices et surfaces viennent de `globals.css`.

Aucun paquet ni modèle Prisma ne s’ajoute.

## Tests et vérification

Tests unitaires :

- fusion de deux patchs imbriqués ;
- ordre de la file d’envoi ;
- conservation d’un patch refusé ;
- restauration de la dernière manche ;
- bornes des étapes du parcours.

Vérification manuelle :

- 320 px de large ;
- mode portrait face-à-face ;
- paysage et faible hauteur ;
- zoom 200 % ;
- clavier seul ;
- coupure réseau puis nouvel essai ;
- erreur de chargement des listes ;
- BO1, BO3 et BO5 ;
- correction de la dernière manche ;
- copie du lien accordée et refusée ;
- mise à jour visible sur l’overlay compact dans Moblin.

La porte finale reste `npm run verify`.

## Hors périmètre

- pas de PWA ;
- pas de sauvegarde hors ligne après fermeture ;
- pas de plusieurs champs de bataille par joueur ;
- pas de nouveau rendu d’overlay ;
- pas de WebSocket ou SSE ;
- pas de compte pour les joueurs.
