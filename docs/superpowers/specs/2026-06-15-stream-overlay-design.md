# Stream Overlay + Dashboard — Design

Date : 2026-06-15
Statut : design validé (en attente de relecture finale)

## Objectif

Permettre à un utilisateur connecté de diffuser une partie Riftbound 1v1 avec un overlay OBS à l'image de la diffusion officielle. Depuis un dashboard sur son profil, il contrôle en direct les noms des joueurs, légendes, champions, battlefields pris, points de conquête en jeu et score du Best-of. L'overlay (browser source OBS) reflète l'état presque en temps réel.

## Référence visuelle

Diffusion officielle RQ Utrecht (image fournie) : deux bandeaux verticaux latéraux + centre transparent (cam plateau).

- **Bandeau latéral (×2, miroir)** : nom du joueur (header) ; carte de la légende + nom légende + nom champion + icônes de domaine ; espace cam joueur (transparent, OBS y place la webcam) ; battlefields pris ; en bas branding event (titre + round + timer) et score du BO (ronds/logo RB).
- **Haut-centre** : piste de points de conquête en jeu `1 … 8/9 … 1` (progression de chaque joueur).
- **Centre** : transparent (la cam plateau passe au travers).

Le compact (layout condensé) sera précisé quand les images dédiées arriveront.

## Décisions

- **Propriété** : un overlay par utilisateur connecté (Discord). Dashboard sur `/profil/overlay`. Lien OBS stable lié au compte.
- **Synchro** : polling HTTP toutes les **1,5 s** (les infos sont quasi fixes, bougent surtout entre les games). Pas de SSE/WebSocket. Robuste derrière le proxy Coolify, latence invisible.
- **Format** : `BO1` / `BO3` / `BO5`. BO1 = pas de ronds de score. BO3 = 2 ronds à remplir, BO5 = 3.
- **Points de conquête** : 0 à **9** par joueur (un battlefield peut relever le seuil de victoire à 9). Piste haut-centre `1…9…1`.
- **Cam on/off par joueur** : toggle. Cam masquée → l'espace cam disparaît et le bandeau se recentre automatiquement (reflow vertical).

## Modèle de données (Prisma)

Nouveau modèle `OverlayState` (un par utilisateur) :

```prisma
model OverlayState {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique          // slug aléatoire pour l'URL OBS publique
  state     Json                       // état du match (voir ci-dessous)
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
}
```

Relation inverse `overlayState OverlayState?` ajoutée sur `User`.

Forme du `state` (JSON, flexible pour affiner le visuel) :

```jsonc
{
  "event": { "title": "Regional Qualifier Utrecht", "round": "TOP 8" },
  "format": "BO3",                  // BO1 | BO3 | BO5
  "maxPoints": 8,                   // 8 par défaut, 9 si un battlefield relève le seuil
  "points": { "a": 0, "b": 0 },     // conquête en jeu, 0..maxPoints
  "players": [
    {
      "name": "Squirtle",
      "legendId": "<riftboundId ou card id>",
      "legendName": "Azir, Emperor of the Sands",
      "championName": "Azir, Sovereign",
      "battlefields": ["Hall of Legends"],
      "gamesWon": 0,
      "camEnabled": true
    },
    { "name": "Prismaticismism", "legendId": "...", "legendName": "Annie, Dark Child", "championName": "Annie, Stubborn", "battlefields": ["Zaun Warrens"], "gamesWon": 0, "camEnabled": true }
  ]
}
```

L'art de la légende + les domaines sont dérivés de `legendId` côté rendu via la base cartes existante (pas stockés en double).

## Routes & API

| Route | Méthode | Accès | Rôle |
|---|---|---|---|
| `/api/overlay/[token]` | GET | public | renvoie `state` (pollé toutes les 1,5 s par l'overlay) ; `Cache-Control: no-store` |
| `/api/overlay/state` | GET/POST | session propriétaire | lit / met à jour le `state` de l'utilisateur courant (upsert) |
| `/api/overlay/token` | POST | session propriétaire | régénère le `token` (révoque l'ancien lien OBS) |
| `/overlay/[token]` | page | public | overlay full 1920×1080, fond transparent |
| `/overlay/[token]/compact` | page | public | overlay compact (Phase 2) |
| `/profil/overlay` | page | session | dashboard de contrôle |

Sécurité : le `token` OBS est non devinable ; la lecture publique n'expose que l'état d'affichage (rien de sensible). Toute écriture exige la session du propriétaire.

## Dashboard (`/profil/overlay`)

- **Par joueur (A/B)** : nom (input) ; sélecteur de légende (recherche dans la base → set `legendName`, art, domaines, et la liste de champions de cette légende) ; sélecteur de champion ; battlefields (ajout/retrait via sélecteur + saisie libre) ; stepper points 0–`maxPoints` ; stepper `gamesWon` ; toggle cam on/off.
- **Global** : titre event, round, format (BO1/BO3/BO5), bouton `maxPoints` 8/9.
- **Actions** : « swap joueurs », « reset game » (points→0), « reset match » (points + gamesWon→0).
- **Liens** : « copier le lien OBS » (full + compact) ; « régénérer le lien ».
- **Aperçu** : iframe de l'overlay full (se met à jour via le même polling).
- Chaque modification déclenche un POST debounce (≈300 ms) vers `/api/overlay/state`.

## Overlay full (`/overlay/[token]`)

- 1920×1080, `background: transparent`, aucun scroll, pointer-events none.
- 2 bandeaux verticaux (gauche = joueur A, droite = joueur B, miroir) : header nom ; bloc légende (carte + légende + champion + icônes domaine) ; cadre cam (réserve l'espace, transparent ; masqué si `camEnabled=false` → reflow) ; battlefields pris (liste) ; bas : branding (titre event + round) + ronds du BO (selon format/`gamesWon`).
- Haut-centre : piste de points `1…maxPoints…1`, marqueurs des deux joueurs.
- Centre : vide (cam plateau au travers).
- Polling `/api/overlay/[token]` toutes les 1,5 s ; transitions CSS douces sur les changements.

## Overlay compact (`/overlay/[token]/compact`) — Phase 2

Layout condensé (barre unique ou bandeau réduit) reprenant l'essentiel : noms, légendes, score BO, points. Spécifié quand les images compactes seront fournies.

## Phasage

- **Phase 1** : modèle Prisma + migration, API (GET public, POST state, token), dashboard complet, overlay full au pixel sur l'image fournie, polling. Toggle cam + reflow, points 0–9, formats BO1/3/5.
- **Phase 2** : overlay compact, timer optionnel, polish visuel final.

## Hors périmètre (YAGNI)

- Pas de multi-sessions / liens partageables sans compte (un overlay par profil).
- Pas de SSE/WebSocket.
- Pas de gestion de bracket/tournoi dans l'overlay (juste la partie courante).
- Timer : optionnel, repoussé en Phase 2.

## Tests

- API : GET public renvoie le state ; POST sans session → 401 ; POST met à jour ; régénération de token invalide l'ancien.
- Overlay : rend un state donné (snapshot) ; reflète un changement après polling ; reflow correct quand `camEnabled=false`.
- Points : borne 0–9, piste cohérente avec `maxPoints`.
- Dashboard : un changement persiste (POST) et réapparaît au rechargement.
