# Connaissance VOD compétitives — index & mode d'emploi

> **But :** une seule porte d'entrée pour savoir **où vit quoi** et **où ajouter** une nouvelle info.
> Matière privée, reformulée FR (copyright). Aucune decklist fabriquée (cf. `../../AGENTS.md`).

## Où vit quoi (source de vérité par type d'info)

| Type d'info | Source de vérité | Notes |
|---|---|---|
| **Matchups A vs B** | **`matchups-reference.md`** | Source unique, pairwise, qualitatif. Remplace la prose matchup des autres docs. `[avis]`/`[conflit]` marqués. |
| Méta / tier / rulings / chiffres tournois | **`../../META-KNOWLEDGE.md`** | Distillé (éditorial riftbound.gg + VOD). `[avis]` = caster. |
| Règles de deckbuilding, cores/tech par Légende | **`../../DECKBUILDING-RULES.md`** | Table de domaines canonique + cores. |
| Cores/tech par Légende (fiche) | **`../fiches/*.json`** champ `vodInsights` | Vue par légende (22 fiches = liste canonique des Légendes). |
| Synthèse Unleashed (set 3) | `unleashed-vod-synthesis-2026-06.md` | ~40 matchups + cores set 3. |
| Passif Spiritforged/Origins (set 2/1) | `cross-set-casts-2026-06.md` | méta Draven, légendes principales. |
| Légendes secondaires set 2 + rulings | `pass3-2026-06.md` | net-new 118 casts. |
| Détail brut match-par-match | `raw/lot01..11.md` | non distillé, le plus granulaire. |
| Cartes bannies | `../../src/lib/banned-cards.ts` | 7 cartes. Canonique. |

## Hiérarchie de confiance (Allan)
1. **Liens web fournis par Allan** (éditorial riftbound.gg, officiel) + **DB cartes** + **22 fiches** = **plus sûrs pour les NOMS** (Whisper fait des fautes : Ari=Ahri, Aurelia=Irelia…).
2. **Casts de games compétitives** = factuel pour le **gameplay/résultat** (board, lignes, tech), mais **noms à recouper** (web/DB gagne en cas de conflit).
3. **Podcasts / tier lists / first-impressions** = `[avis]` (opinion, jamais affirmé comme fait).
> **Toujours COUPLER une nouvelle info à l'ancienne** (recouper) avant de la figer.

## Pipeline d'ingestion (recette)
1. **Transcrire** : `D:/riftbound-vods/` via `scripts/vod-transcribe-fw.sh` (faster-whisper small.en). Cf. téléchargement YouTube dans `VIDEO-ANALYSIS-PROMPT.md`.
2. **Analyser** en agents/Workflow **par vagues de 3** (jamais plus → rate-limit API). Reformuler FR, classer cast/`[avis]`/guide.
3. **Valider les noms** : `npm run fix:names <doc.md>` (auto-corrige distance ≤ 2 vs DB) puis `npm run validate:names` (gate, exit 1 si suspects). Les inconnus restants → demander un lien web à Allan, ne pas inventer.
4. **Distiller** : matchups → `matchups-reference.md` ; méta/tier/rulings → `META-KNOWLEDGE.md` ; cores/tech → `DECKBUILDING-RULES.md` + fiches.
