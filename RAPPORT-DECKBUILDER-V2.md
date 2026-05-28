# Rapport Deckbuilder V2 — Riftbound France

**Date** : 28 mai 2026  
**Route** : `/deckbuilder`  
**Swap effectué** : 28 mai 2026 — v2 remplace l'ancien deckbuilder  
**Statut** : Build production OK, 0 erreurs

---

## Structure finale

```
src/app/deckbuilder/
├── page.tsx                    Server Component, fetch cards Prisma
├── layout.tsx                  Layout (cache backup)
├── deckbuilder.tsx             Client Component principal
├── components/
│   ├── card-browser.tsx        Grille + recherche unifiée
│   ├── search-bar.tsx          Barre tokens + autocomplétion
│   ├── deck-panel.tsx          Panel deck + stats + validation intégrés
│   ├── deck-progress.tsx       Barre 6 étapes cliquable
│   ├── deck-stats.tsx          3 graphiques (énergie, type, domaine)
│   ├── deck-validation.tsx     Panneau collapsible erreurs cliquables
│   ├── import-modal.tsx        3 formats (Deck Code, Card Names, TTS)
│   ├── export-modal.tsx        4 onglets (Lien, Code, TTS, Image)
│   ├── rune-suggestion.tsx     Calcul auto + bouton Appliquer
│   └── meta-indicator.tsx      Tier + decks tournoi (fetch API)
└── lib/
    ├── search-parser.ts        Parser tokens type:unit domain:fury energy:3+
    ├── deck-rules.ts           Validation complète (40 main, 12 runes, 3 BF, etc.)
    ├── sample-hand.ts          Fisher-Yates shuffle, tirage 7 cartes
    ├── rune-calculator.ts      Répartition proportionnelle aux domaines
    ├── export-formats.ts       Card Names, TTS, parseurs import
    └── export-image.ts         Export PNG visuel (canvas, images cartes, fond custom)
```

---

## Fonctionnalités

### UX Flow
- Barre de progression 6 étapes avec compteurs et couleurs
- Validation temps réel, erreurs cliquables
- Sample Hand (7 cartes, mulligan)

### Recherche unifiée
- Barre unique avec parser de tokens (`type:`, `domain:`, `set:`, `energy:`, etc.)
- Chips colorés, autocomplétion, texte libre

### Stats du deck
- Courbe d'énergie colorée par domaine
- Distribution par type et par domaine
- Suggestion de runes (minimum 4 par domaine)

### Import/Export
- Import 3 formats : Deck Code (base64), Card Names, TTS
- Export 4 onglets : Lien de partage, Deck Code, TTS, Image PNG
- Export image visuel : fond custom, images cartes via proxy API, icônes domaine FR, label "RÉSERVE"
- Publication communauté : connexion Discord requise, deck valide obligatoire

### Règles du deck
- Champions dans le main deck comme unités normales, détection auto via légende
- 3 copies max partagées entre main et réserve
- Réserve capée à 8 cartes
- Runes : 12 total, suggestion minimum 4 par domaine
- Gestion apostrophes (Kai'Sa, Kha'Zix, Rek'Sai)
- Cartes neutres toujours visibles
- Cartes OPP exclues
- Nettoyage signatures à chaque changement de légende

### Publication communauté
- Connexion Discord obligatoire (utilise le nom et l'avatar du compte)
- Deck doit être valide (légende + 40 main + 12 runes + 1-3 battlefields)
- Validation côté serveur (API renvoie 401 si pas connecté, 400 si deck invalide)

---

## API associées

- `POST /api/community-decks` — Publication (auth requise, validation deck)
- `GET /api/community-decks` — Liste publique, pagination, filtre légende
- `GET /api/image-proxy?url=` — Proxy images CDN pour export canvas (CORS)
- `GET /api/legends/meta?name=X` — MetaIndicator (non implémenté, gère le 404)

---

## Historique du swap

| Date | Action |
|---|---|
| 28 mai 2026 | Création `deckbuilder-v2` |
| 28 mai 2026 | Swap : `deckbuilder` → `deckbuilder-old` → supprimé, `deckbuilder-v2` → `deckbuilder` |
| 28 mai 2026 | Suppression `deckbuilder-old` et `deckbuilder-backup` après build OK |
