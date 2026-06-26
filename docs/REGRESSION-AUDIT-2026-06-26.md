# Audit de non-régression — fixes locaux avant push prod

**Date :** 2026-06-26
**Périmètre :** 9 zones de revue (sécurité, rate-limit, sessions, deckbuilder, caching, articles/JSON-LD, a11y modales, compteurs/parsing) + 2 vérifications adversariales.
**Méthode :** revue par zone + relecture adversariale du code réel (commits `ad9f7ec4 → a7f3fd4c`, `3624e7cd`, `310bce77`), validation `tsc --noEmit`.

---

## 1. VERDICT GLOBAL

# ✅ GO

Aucune régression réelle confirmée. Les deux points de friction identifiés (réinvalidation de session admin, quantité champion non encodée en base64) ont été vérifiés adversairement et qualifiés **Non-Problème** : comportement soit intentionnel et documenté, soit préexistant et non introduit par les fixes.

**Condition unique avant push :** vérifier que `SESSION_SECRET` est bien défini en prod (cf. `DEPLOIEMENT.md:77`). Si oui, zéro impact utilisateur. Si non, au pire une reconnexion admin unique — coût assumé du durcissement sécurité.

| Sévérité | Nombre |
|----------|--------|
| Bloquant | 0 |
| Majeur | 0 |
| Mineur (confirmé réel) | 0 |
| Non-Problème (vérifié, écarté) | 2 |

---

## 2. RÉGRESSIONS CONFIRMÉES RÉELLES

**Aucune.**

Les deux candidats remontés par les revues ont été soumis à vérification adversariale sur le code réel et **écartés** :

### Non-Problème A — Réinvalidation de session admin (retrait fallback `|| ADMIN_PASSWORD`)
- **Fichier :** `src/lib/auth.ts` (`getSessionSecret`), `src/lib/session.ts`, `src/app/api/auth/route.ts`
- **Allégation :** le retrait du fallback HMAC change la clé de signature → sessions admin existantes invalidées.
- **Verdict adversarial : FAUX en tant que régression.** La clé HMAC ne diffère avant/après **que** si `SESSION_SECRET` était absent en prod au moment du login — état non conforme à la checklist (`DEPLOIEMENT.md:77` impose `SESSION_SECRET`, audit M1 a déjà rétrogradé High→Low pour ce motif). Avec `SESSION_SECRET` présent (état attendu), clé identique → **aucune session touchée**. Dans le pire cas (oubli opérateur), impact = **une seule reconnexion** pour l'unique admin ; `checkPassword()` lit toujours `ADMIN_PASSWORD` inchangé et `createSessionValue()` re-signe immédiatement. C'est l'**intention délibérée et documentée** du correctif (fail-fast sans secret).
- **Action :** aucun correctif. Pré-push : confirmer `SESSION_SECRET` défini en prod.

### Non-Problème B — Quantité champion jetée par le codec base64
- **Fichiers :** `src/lib/deck-codec.ts` (`encodeDeckBase64:105`, `decodeLegacyBase64:51`), call-sites `src/app/decks/[slug]/page.tsx:127`, `src/app/d/[code]/page.tsx:209`
- **Allégation :** le fix passe la vraie `quantity` du champion mais elle est silencieusement ignorée par le codec base64.
- **Verdict adversarial : FAUX en tant que régression.** Le codec base64 écrit `C:${cardId}` (sans qty) et force `{quantity:1}` au décodage **depuis l'Initial commit** (`b3e0e70e`) — le fix `a7f3fd4c` ne touche **pas** `deck-codec.ts` (diff vide), il ne modifie que les call-sites. Un champion 2-3 copies partagé via lien base64 revenait déjà à 1 **avant** le fix. Le cas commun (1 champion) reste exact partout — jamais 0 ni 2 — sur tous les chemins testés (base64, deck-code texte, localStorage, TTS, codes /decks et /d). Le champion est en section `legend`, pas `main`, donc round-trip 1-copie = 1.
- **Action :** aucun correctif requis. **Amélioration future optionnelle :** encoder la quantité du champion dans le codec base64 (`C:${cardId}.${qty}`) pour fermer le trou multi-copies des liens de partage.

---

## 3. ZONES VALIDÉES OK (traçabilité)

| # | Zone | Verdict | Note |
|---|------|---------|------|
| 1 | CSRF middleware (`src/middleware.ts`) — refus écritures `/api` cross-origin | OK | OAuth Discord en GET (hors filtre) ; tous les fetch d'écriture same-origin (URLs relatives) ; SW ignore non-GET ; Origin absent toléré. Aucune action/formulaire cassé. |
| 2 | `src/lib/rate-limit.ts` + 9 endpoints + CSRF | OK | Buckets par endpoint isolés ; seuils > usage humain ; extraction IP améliorée (`x-real-ip` puis `x-forwarded-for`) ; aucune signature de route cassée ; `{liked,likes}` bien consommé par `like-button.tsx:37`. |
| 3 | `src/lib/session.ts` + `src/lib/auth.ts` — expiration 30j + retrait fallback | OK | Format payload inchangé depuis l'origine → `Number.isFinite` true, pas de déconnexion massive ; login admin intact. (Voir Non-Problème A.) |
| 4 | Deckbuilder champion quantity encode/import | OK | Cas commun 1 champion exact sur tous les chemins. (Voir Non-Problème B.) |
| 5 | `meta/page.tsx`, `tier-list/page.tsx`, `cartes/page.tsx` — wrap `unstable_cache` + refactor | OK | Queries strictement identiques ; `select` léger couvre exactement les champs consommés ; `createdAt`/`updatedAt` Date→string géré par `formatDate` ; fallback gracieux conservé ; `tsc` propre. Seul changement volontaire : staleness ≤5 min (meta/tier) / 1h (sets). |
| 6 | Articles (covers `next/image`), block-renderer lazy, layout, JSON-LD, CardGrid Pick | OK | Parents `<Image fill>` ont `relative` ; covers 100% locales ; JSON-LD échappe `<` (pas de breakout `</script>`) ; `CardGrid` Pick = 7 champs du `select` ; `metadataBase`/skip-link/RSS OK ; `tsc` propre. |
| 7 | `src/hooks/use-dialog-a11y.ts` + modales + navbar + user-menu (a11y lot 5) | OK | Escape ferme toujours ; piège n'intercepte que Tab ; retour focus protégé par optional chaining ; tous les modales ont un focusable ; changements navbar additifs. Réserve qualité non bloquante : `onClose` inline non mémoïsé (à surveiller). |
| 8 | Compteurs likes/vues + parsing decklist + collection/bulk (lot 6/7) | OK | Like recompté transactionnel idempotent (corrige drift optimiste) ; vues réelles toujours comptées par `/d/[code]/page.tsx:65-68` ; regex setCode préserve titres multi-mots (`Master Yi (Wuju Master)`) ; bulk filtre sur `Card.id` (FK confirmée), borne 5000 > catalogue ~1048. Réserve mineure non bloquante : `existing` lu hors transaction (préexistant). |

---

## 4. RÉSERVES NON BLOQUANTES (suivi post-push, hors périmètre régression)

- **a11y (zone 7) :** `onClose` inline non mémoïsé re-déclenche l'effet focus à chaque re-render parent. Sans impact tant que le parent ne re-render pas pendant l'interaction. → mémoïser `onClose` (`useCallback`) si symptômes.
- **like communautaire (zone 8) :** `existing` lu hors transaction → sur double-clic concurrent extrême, possible violation d'unicité au `create`. Comportement préexistant équivalent, non introduit ici.
- **deck-codec (Non-Problème B) :** champions multi-copies non encodés en base64 → amélioration future.

---

## RÉSUMÉ

**VERDICT GLOBAL : GO.** L'audit de non-régression sur les 9 zones de fixes locaux ne révèle **aucune régression réelle** : Bloquant 0, Majeur 0, Mineur 0. Les 2 seuls candidats (réinvalidation session admin via retrait du fallback `|| ADMIN_PASSWORD`, et quantité champion jetée par le codec base64) ont été vérifiés adversairement sur le code réel et écartés comme **Non-Problème** — le premier est l'intention sécurité documentée (au pire une reconnexion admin unique, et seulement si `SESSION_SECRET` était absent), le second est un comportement préexistant depuis l'Initial commit que le fix ne touche pas (`deck-codec.ts` diff vide). **Condition unique avant push :** confirmer que `SESSION_SECRET` est défini en prod (`DEPLOIEMENT.md:77`) ; si oui, impact utilisateur nul. Les huit autres zones (CSRF, rate-limit, sessions/expiration, caching `unstable_cache`, articles/JSON-LD, a11y modales, compteurs/parsing/bulk) passent `tsc --noEmit` et préservent toutes les fonctionnalités. **Aucun correctif requis avant push.** Suivi post-push optionnel : mémoïser `onClose` (a11y), encoder la qté champion en base64 (multi-copies). Document complet : `docs/REGRESSION-AUDIT-2026-06-26.md`.
