# Règles officielles Riftbound (FR) — référence terminologie

- **Source** : https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/6de671178d5f6dd6658de7f09a78a1f477ac0eeb.pdf
- **Titre** : « Règles du jeu de Riftbound »
- **Dernière mise à jour (doc)** : 30/03/2026
- **107 pages**, importé le 2026-06-05
- Texte brut extrait : `data/riftbound-rules-fr.txt`

## Limite d'extraction
La police embarquée du PDF n'a pas de table ToUnicode pour les caractères accentués :
pypdf **et** pdfminer rendent les accents en `�` (perte non récupérable par substitution).
Le texte non-accentué et la numérotation des règles restent intacts et recherchables
(ex. `Assaut`, `Embuscade`, `Chasse`, `Confrontation`, numéros `002.`, `052.`…).

## Vérification terminologie (2026-06-05)
Termes officiels confrontés à notre code / mémoire — **tout est aligné, aucun changement requis** :

| EN | Notre FR (`src/lib/domains.ts`) | Officiel |
|----|----|----|
| Fury | Furie | Furie ✓ |
| Calm | Calme | Calme ✓ |
| Mind | Esprit | Esprit ✓ |
| Body | Corps | Corps ✓ |
| Chaos | Chaos | Chaos ✓ |
| Order | Ordre | Ordre ✓ |

Mots-clés (mémoire `reference_riftbound_terminology_fr`) confirmés présents dans le doc :
Assaut, Embuscade, Chasse, Confrontation, Caché. Aucun écart détecté.

## Note utile (règle 052)
Le doc précise que **runes, légendes et champs de bataille ne sont pas des « cartes »**
lorsqu'un effet parle de « carte » (deck principal uniquement), mais le sont au sens des règles.
→ Pertinent pour la feature Collection : décider si les runes doivent compter dans le calcul
« cartes manquantes » (voir `project_collection_feature`).
