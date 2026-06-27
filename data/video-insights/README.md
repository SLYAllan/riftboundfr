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
| Guides de Légende RiftLab (Set 3 Unleashed) | `pass4-legend-guides-2026-06.md` | 13 guides dédiés : core + chosen champion + battlefields + matchups par légende. "Aurora" = archétype (gear Dazzling Aurora), pas une légende. |
| Tier list Unleashed + deck profiles | `pass5-tierlist-deckprofiles-2026-06.md` | Tier list complète (panel RiftLab, `[avis]` début de set) + cores des deck profiles LeBlanc (DZiden, CCS Atlanta) & Jhin (Jibbs, Utrecht). ⚠️ Aurelia/Irelia ambigus (Whisper). |
| Meta breakdowns RQ (Sydney/Hartford/Vancouver) | `pass6-rq-meta-breakdowns-2026-06.md` | Meta J1/J2, conversion, top 8, tech — **résultats factuels** + `[avis]`. Confirme Factor (Hartford) & AlanZQ Diana double champion (Vancouver). ⚠️⚠️ Irelia≠Aurelia traités comme 2 decks → contredit la mémoire, à trancher. |
| Nexus Night casts (gameplay local) | `pass7-nexus-night-casts-2026-06.md` | Leona/Rengar, Vex/Ezreal, Master Yi/MF Aurora : tech + matchups + **rulings** (Elder Dragon, Baron, Bullet Time, Zenith Blade). **Akshan = compteur Aurora clé**. Vex se construit à part (pas de Scuttle Crab/Grove). |
| Podcasts bans/règles + "Vex overrated" | `pass8-podcasts-bans-rules-2026-06.md` | Liste de bans (Draven/Cull the Weak/Fight or Flight, **PAS Aurora**), origine règle 702, rulings (Symbol of the Solari cassée, contrôle battlefield sur la chain), Vex=A pas S, méta Europe=Victor/USA=Ornn. |
| Podcast #4 Lille + timeline + inventaire | `pass9-podcast4-lille-2026-06.md` | Lille = Azir (Squirtle) invaincu ; ⚠️ podcasts #1/#2/#4 PRÉ-sortie Unleashed (prédictions). Inventaire des 102 nouveaux transcripts. |
| Guides de Légende Set 1/2 + Spiritforged | `pass10-legend-guides-set12-spiritforged-2026-06.md` | 15 guides "Learn X" / Spiritforged + counter Master Yi : cores/battlefields/matchups Kai'Sa, Victor, Darius, Sett, Annie, Ornn, MF, Teemo, Yasuo, Draven, Sivir, Azir, Ezreal, Irelia. ⚠️ Set 1/2 (avant Unleashed). |
| Suzhou Regional — top cut (Unleashed) | `pass11-suzhou-topcut-2026-06.md` | Analyse des 6 top-cuts (finale Master Yi>Irelia, demi >Sivir, Ezreal>Diana, Lillia>Rek'Sai, Garen>Sivir) : decklists/tech, lignes, rulings. **🔑 "Aurelia" = Irelia (résolu)**. Adaptatron/Divine Judgment/Akshan anti-Aurora. |
| Suzhou Regional — rounds Swiss (Unleashed) | `pass12-suzhou-rounds-2026-06.md` | Analyse des 6 rounds (Azir/Irelia, Ivern/Yi, Kha'Zix/Irelia, Ezreal/Fiora, Poppy/Fiora, LeBlanc/Fiora) : tech, combos (Faefolk+Forbidding Waste, Challenge anti-Karthus), rulings, méta diverse. |
| Triple Win-A-Box Tournament (Unleashed) | `pass13-winabox-tournament-2026-06.md` | Vainqueur = Bradykin (Ezreal control). GF Ezreal>Vex, Azir>Pyke, Lillia>Darius, Yi>Viktor. ⭐ **Volibear "Dragon Storm" (Gem Dragon + Herald of Scales = draw/mana infinie)**. Unchecked Power anti-Vex. |
| Contenders London + net-new résiduel | `pass14-contenders-london-2026-06.md` | Sett gagne London (vs Aurora-Yi, via Sabotage + Divine Judgment) ; miroir Aurora-Yi vs Tempo-Yi. ⚠️ pré-Unleashed. Liste du backlog résiduel SKIP (low/redondant). |
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
