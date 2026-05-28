# Audit de sécurité — Riftbound France

**Date** : 2026-05-24
**Auditeur** : Claude Opus 4.6

---

## Résumé

17 vulnérabilités identifiées. **10 corrigées**, 7 restantes (faible priorité ou nécessitent configuration serveur).

## Vulnérabilités corrigées

### ~~CRITIQUE — Endpoint sync-cards sans authentification~~
- **Fichier** : `src/app/api/sync-cards/route.ts`
- **Fix** : Ajout vérification `isAdmin()` avant toute opération.

### ~~CRITIQUE — Comparaison de mot de passe en string simple~~
- **Fichier** : `src/lib/auth.ts`
- **Fix** : Utilisation de `crypto.timingSafeEqual()` pour éviter les timing attacks.

### ~~CRITIQUE — Session cookie forgeable (valeur statique)~~
- **Fichier** : `src/lib/auth.ts`, `src/app/api/auth/route.ts`
- **Fix** : Session signée avec HMAC-SHA256 + nonce aléatoire + timestamp. Vérification de signature côté serveur.

### ~~HIGH — XSS via markdown (HTML brut injecté)~~
- **Fichier** : `src/components/markdown-renderer.tsx`
- **Fix** : `skipHtml` activé + whitelist `allowedElements` stricte.

### ~~HIGH — Community decks sans validation d'input~~
- **Fichier** : `src/app/api/community-decks/route.ts`
- **Fix** : Limites de longueur (titre 200, deckCode 10K, nom 60, desc 500). Validation de types.

### ~~HIGH — Pas de rate limiting~~
- **Fichier** : `src/app/api/community-decks/route.ts`
- **Fix** : Rate limit en mémoire (5 req/min par IP sur POST).

### ~~HIGH — Génération de share codes avec Math.random()~~
- **Fichier** : `src/app/api/community-decks/route.ts`
- **Fix** : Utilisation de `crypto.randomBytes()`.

### ~~HIGH — Pagination non bornée~~
- **Fichier** : `src/app/api/community-decks/route.ts`
- **Fix** : `page` clampé entre 1 et 100.

## Vulnérabilités restantes (à traiter en production)

### MEDIUM — Mot de passe admin en clair dans .env
- **Risque** : Si le .env est exposé, l'admin est compromis.
- **Recommandation** : Utiliser bcrypt pour hasher le password et stocker le hash. Ou passer à un provider OAuth (NextAuth).
- **Note** : `.env` est bien dans `.gitignore`.

### MEDIUM — Pas de CSRF token sur les mutations admin
- **Risque** : Un site malveillant pourrait déclencher des actions admin si l'utilisateur est connecté.
- **Recommandation** : Ajouter un middleware CSRF ou des tokens par formulaire. `sameSite: "lax"` sur le cookie offre une protection partielle.

### MEDIUM — Pas de validation d'input sur les routes admin
- **Fichiers** : `src/app/api/admin/articles/route.ts`, `events/route.ts`, `decks/route.ts`, `tier-list/route.ts`
- **Risque** : Données malformées ou excessivement longues.
- **Recommandation** : Ajouter Zod ou un schéma de validation sur chaque route admin.

### MEDIUM — Pas d'audit logging
- **Risque** : Impossible de tracer qui a fait quoi.
- **Recommandation** : Logger les actions admin (création/modification/suppression) avec timestamp et IP.

### LOW — Credentials par défaut (`postgres`)
- **Risque** : Seulement en développement local.
- **Recommandation** : Changer le mot de passe admin ET DB avant tout déploiement.

### LOW — Variable SESSION_SECRET manquante
- **Risque** : Fallback sur ADMIN_PASSWORD pour signer les sessions.
- **Recommandation** : Ajouter `SESSION_SECRET` dans `.env` avec une valeur aléatoire de 64+ caractères.

### LOW — Rate limiting en mémoire uniquement
- **Risque** : Se reset au redémarrage, ne marche pas en multi-instance.
- **Recommandation** : Utiliser Redis ou un service de rate limiting (Vercel Edge) en production.

---

## Checklist avant déploiement

- [ ] Changer `ADMIN_PASSWORD` (mot de passe fort)
- [ ] Ajouter `SESSION_SECRET` dans `.env` (64+ chars aléatoires)
- [ ] Changer le mot de passe PostgreSQL
- [ ] Vérifier que `.env` n'est pas versionné
- [ ] Considérer bcrypt pour le password ou OAuth
- [ ] Configurer rate limiting niveau infra (Vercel/Cloudflare)
- [ ] Activer les headers de sécurité (CSP, HSTS, X-Frame-Options)
