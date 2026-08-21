# Corrections de l’audit du 21 août 2026

## But

Corriger les défauts confirmés par l’audit sans changer les règles métier, sans
inventer de decklist et sans toucher à la production. Le chantier doit réduire
les pertes d’état, remettre le contenu à jour, rendre les parcours utilisables au
clavier et retirer le code mort sûr.

## Périmètre

Le travail comprend quatre lots, exécutés dans cet ordre :

1. fiabilité et sécurité des écritures ;
2. contenu Vendetta, anglais et signaux SEO ;
3. accessibilité et retours d’erreur ;
4. suppressions Ponytail sans effet sur le comportement.

Les anciens scripts ponctuels ne seront pas supprimés dans ce chantier. Leur
utilité dépend de l’historique des imports et demande une décision séparée.

## 1. Fiabilité et sécurité

### État de l’habillage

Le tableau de bord et le compagnon écrivent le même enregistrement. Un PATCH ne
suffit pas si deux requêtes lisent le même ancien état avant d’écrire.

La correction gardera `saveState` et `saveStateByToken` comme passages uniques,
mais rendra la lecture, la fusion et l’écriture indivisibles. PostgreSQL prendra
un verrou sur la ligne pendant une transaction. La création initiale gardera son
comportement actuel.

Un test de logique couvrira la fusion. La concurrence réelle sera vérifiée par un
test ciblé si elle peut l’être sans base factice ; sinon le test portera sur la
fonction pure extraite et le build vérifiera le branchement Prisma.

### Collection

Les changements de quantité passeront par une seule file client. Elle gardera le
dernier état voulu, n’enverra qu’une requête à la fois et conservera le changement
en attente après un échec. L’interface affichera l’échec et proposera de réessayer.

La route bornera les quantités. L’import CSV bornera la taille du corps et le
nombre de lignes avant toute requête en base.

### Commentaires, votes et versions

Les chargements vérifieront `r.ok` puis la forme du JSON. Une erreur laissera la
page utilisable et affichera « Réessayer ».

Les votes et les versions de decks communautaires grouperont leurs écritures dans
une transaction. Les erreurs d’unicité attendues auront une réponse propre ; les
autres erreurs ne seront plus présentées comme un succès.

### Secrets et limites

Les liens de classeurs partagés utiliseront `crypto.randomBytes`. Les routes
CardNexus et compagnon recevront une limite de débit. Les caches en mémoire auront
une borne simple. Aucun nouveau service ni aucune dépendance ne sera ajouté.

## 2. Contenu, anglais et SEO

Les guides ne présenteront plus Unleashed comme format actuel. Les chiffres et le
texte Vendetta viendront des données déjà vérifiées dans le dépôt ; aucune valeur
ne sera déduite de mémoire.

Les métadonnées anglaises auront une canonique sous `/en`. Le sitemap publiera les
deux langues pour les pages traduites et gardera les pages privées hors index. Les
dates `lastmod` viendront des données quand elles existent ; les pages statiques
n’annonceront plus une modification à chaque requête.

Le dictionnaire recevra les clés manquantes. Les libellés français déjà couverts
par `i18n-en.ts` passeront par `t()`. `llms.txt` sera mis à jour avec les chiffres
présents sur le site au 21 août 2026.

## 3. Accessibilité et retours utilisateur

Les actions sur une carte utiliseront un élément natif quand la mise en page le
permet. Sinon elles recevront un chemin clavier équivalent, un nom et un état
accessibles.

Les curseurs auront un nom. Les sections repliables publieront `aria-expanded`.
Le menu utilisateur reprendra le motif de divulgation de la barre de navigation.
Les filtres et onglets publieront `aria-pressed` ou `aria-selected` selon leur
rôle. Les champs auront un label relié. Les changements de quantité et les erreurs
réseau utiliseront des zones d’état stables.

Les corrections garderont les tailles et l’aspect actuels sauf quand le contraste
ou la zone tactile ne respecte pas le seuil retenu.

## 4. Nettoyage Ponytail

Le chantier supprimera seulement ce dont l’absence d’usage est prouvée :

- les composants `src/components/ui/` jamais importés ;
- `html-to-image` et `tailwindcss-animate` s’ils restent sans usage ;
- les exports morts confirmés par recherche ;
- les deux fichiers de réexport du deckbuilder ;
- les copies exactes de `slugify` qui peuvent importer la fonction commune.

Les doublons qui portent des valeurs métier différentes restent en place. Le
nettoyage ne crée aucune abstraction nouvelle.

## Données et production

Aucun seed, `prisma db push`, accès à la base de production, déploiement ou push
n’entre dans ce chantier. Les 1 201 decklists sans source brute restent en place
et restent signalées comme invérifiables. Toute retouche d’un index ou d’une doc de
pipeline doit conserver les données existantes et passer le validateur.

## Vérification

Chaque lot commence par le plus petit test qui échoue, puis reçoit la correction
minimale. La vérification finale comprend :

- les tests Vitest ciblés, puis `npm test` ;
- `npm run lint` ;
- `npm run verify` avec son vrai code de sortie ;
- `npm run validate:decks` avec une longue limite ;
- `git diff --check` ;
- un contrôle rendu des routes françaises et anglaises touchées ;
- un parcours clavier des composants modifiés quand le navigateur est disponible.

Le travail s’arrête si une donnée Vendetta ou une decklist ne peut pas être
recoupée contre une source du dépôt.
