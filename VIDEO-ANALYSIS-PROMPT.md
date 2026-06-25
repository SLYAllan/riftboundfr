# VIDEO-ANALYSIS-PROMPT.md — Analyse des VOD pour nourrir la connaissance méta

> But : transformer les VOD compétitives Riftbound (casts, breakdowns, guides) en
> **connaissance synthétisée** pour le projet. On ne recopie pas, on ne traduit pas
> mot à mot : on **comprend** et on **réécrit avec nos mots**. Mis en place le 25 juin 2026.

## ⚠️ Règle copyright (impérative)
- **Jamais de transcription verbatim ni de traduction littérale** publiée. Les transcriptions
  Whisper (`D:/riftbound-vods/transcripts/`) sont une **matière première privée**, pas du contenu.
- On en extrait des **idées** (matchups, lignes de jeu, tech, séquençage, tier), qu'on **reformule
  entièrement en français** dans nos propres ressources. Objectif : nourrir la connaissance, pas
  republier la source.
- Ne jamais citer la chaîne/le caster comme source dans les articles publics (cf.
  [[feedback_article_conventions]]). Usage interne uniquement.
- **Intégrité decklists inchangée** : aucune liste n'est créée depuis une vidéo. Les decklists
  viennent toujours du scrape réel (`data/decklists/`). Une vidéo peut confirmer une tech/un ratio,
  jamais fabriquer une liste.

## Sources (3 chaînes)
- **twitch.tv/riftbound** — streams officiels Jour 1 (12 h, lourds, redondants avec R&R → bas de priorité).
- **youtube.com/@RunesAndRift** — casts match par match des Regionals (Utrecht, Tianjin, Xi'an, Hartford, Tournament 15). Matchup + round dans le titre.
- **youtube.com/@RiftlabTCG** — le plus dense en analyse : « Best Decks / Meta Breakdown » par Regional, « How to Play <Legend> », tier list, deck profiles, Nexus Night (casts analytiques), mises à jour de règles.

Listings bruts : `D:/riftbound-vods/youtube/*.txt`, `twitch/*.txt`.
Worklists priorisées : `worklist-p1.txt` (RiftLab, connaissance) → `worklist-p2.txt` (R&R finales/top cuts) → `worklist-p3.txt` (R&R rounds).

## Pipeline de transcription (audio seul, GPU, en série)
```bash
bash scripts/vod-transcribe.sh /d/riftbound-vods/worklist-p1.txt
```
- yt-dlp (audio mp3) → Whisper `small.en` GPU → `D:/riftbound-vods/transcripts/<id>.txt`.
- **Un job à la fois** (ne sature pas le PC). Audio supprimé après transcription (économie disque).
- Reprend automatiquement (skip si `.txt` déjà présent). Logs : `D:/riftbound-vods/logs/`.
- Suivi : `tail D:/riftbound-vods/logs/pipeline.log`.

## ⚖️ Hiérarchie de confiance des sources (IMPÉRATIF)

Toutes les VOD ne se valent pas. À pondérer à l'analyse :

- **Casts de games compétitives = la SEULE « vraie » valeur.** C'est du concret : ce qui se passe
  réellement sur le board (matchups joués, lignes décisives, tech vues en jeu, résultats). À privilégier
  pour tout ce qui est factuel (qui bat qui, comment, quelles cartes apparaissent).
- **Podcasts / tier lists / « first impressions » / deck profiles d'opinion = AVIS PERSONNELS.** À prendre
  avec des pincettes : c'est de la prédiction/ressenti, pas de l'observé. Toujours les marquer comme **opinion**
  (« avis caster », `[avis]`), jamais présenter comme un fait.
- **Règle d'arbitrage :** quand un avis (podcast/tier) contredit ce qu'on observe en cast ou la DB,
  **le concret gagne** (cast > data > opinion). Un tier de podcast ne « prouve » rien.

## Ce qu'on extrait de chaque transcription
1. **Matchups** : qui bat qui et pourquoi (plan, cartes pivots, pièges).
2. **Tech & flex slots** : cartes que les casters signalent comme clés/montantes (ex. anti-Aurora, gear removal, stuns, Akshan, Star-Crossed, Scuttle Crab, Baited Hook).
3. **Lignes de jeu / séquençage** : ordres de pose, fenêtres de conquête, gestion des runes, timing du Contrôle.
4. **Lecture méta / tier** : qui monte, qui descend, archétypes émergents, consensus des casters.
5. **Confirmations de cores** : ratios unités/sorts/équipements évoqués (à recouper avec `DECKBUILDING-RULES.md`).

## Où écrire les apprentissages (toujours reformulé FR)
- `META-KNOWLEDGE.md` — lecture méta, tier, matchups, cartes du format, historique.
- `DECKBUILDING-RULES.md` — cores, ratios, flex/tech par Légende, anti-tech.
- `data/fiches/<legend>.json` — gameplan, key cards, forces/faiblesses (les guides « How to Play » alimentent ça).
- `scripts/seed-fiche-articles.mts` — enrichir les guides d'article par Légende (cf. [[feedback_per_legend_articles]]).
- `src/app/guides/*` — guides du site (deckbuilding, méta, débuter) si une notion générale ressort.

## ⚠️ Vérification OBLIGATOIRE — recouper avec le savoir déjà établi (avant de figer)

Whisper massacre les noms propres (« Aurelia » = Irelia, « Mind Splitter » = Mindsplitter,
« Cold Shot » = Called Shot, « Kinku » = Kinkou…). **Ne jamais figer une donnée sans la confronter
à ce qu'on sait déjà.** À chaque import :

1. **Noms de cartes/Légendes → base réelle.** Lancer `npx tsx scripts/validate-card-names.mts`
   (gate, exit 1 s'il reste des suspects ; suggère la correction). Recouper aussi la **table
   canonique des paires de domaines** (DECKBUILDING-RULES.md) — les VOD confirment, ne contredisent pas.
2. **Cartes bannies → `src/lib/banned-cards.ts`** (liste officielle : Fight or Flight, Scrapheap,
   Obelisk of Power, The Dreaming Tree, Draven Vanquisher, Called Shot) + `data/meta-reports/*post-ban*`.
   Si une VOD parle d'une carte « bannie », vérifier qu'elle y figure (déduire le bon nom au lieu d'inventer).
3. **Tier / méta / résultats → META-KNOWLEDGE.md + data/meta-reports + DB.** Un chiffre VOD qui
   contredit la DB = la DB gagne (les avis casters sont éditoriaux, pas data-backed).
4. **Decklists → scrape brut `data/raw-scrapes/`** uniquement. **Jamais** fabriquer une liste depuis une
   VOD (cf. [[feedback_never_fabricate_decks]]).

Règle générale : **une nouvelle donnée se valide d'abord contre les sources canoniques existantes**
(DB cartes, banned-cards.ts, table domaines, meta-reports, scrape brut). Marquer `[incertain]` ce qui
ne se recoupe pas, ne jamais l'affirmer.

## Boucle de travail (automatisée)
1. Lancer la transcription d'un lot en arrière-plan (P1 d'abord).
2. À mesure que les `.txt` apparaissent, les analyser (éventuellement en agents parallèles — la
   transcription, elle, reste en série pour le GPU).
3. Reformuler et reporter dans les ressources ci-dessus.
4. **Vérifier** (section ci-dessus : validateur + recoupement) AVANT de considérer la connaissance figée.
5. Enchaîner P2 puis P3. Allan pré-valide : pas d'arrêt pour approbation, on documente au fil de l'eau.
