# Companion mobile de l’overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le long formulaire du companion par une création guidée et un compteur face-à-face qui pilote l’overlay compact sans compte Discord.

**Architecture:** Garder la route et l’API actuelles. Extraire la logique pure de file d’envoi, d’étapes et d’annulation dans `src/lib/overlay-compagnon-client.ts`, puis laisser le composant client gérer le rendu et les appels réseau. Réutiliser les API de cartes, `OverlayStateData`, `applyStateUpdate` et le `Dialog` Base UI du dépôt.

**Tech Stack:** Next.js 16.3 App Router, React 19.2, TypeScript strict, Tailwind CSS 4, Base UI, Vitest 4.

**Spec:** `docs/superpowers/specs/2026-08-20-compagnon-overlay-mobile-design.md`

## Global Constraints

- Aucun nouveau paquet ni modèle Prisma.
- Garder `/overlay/<token>?compact=1` pour Moblin et `/compagnon/<token>/<cle>` pour la commande privée.
- Envoyer des patchs, jamais l’état entier, afin de ne pas écraser le décor ou les cartes du tableau de bord.
- Un seul champ de bataille actif par joueur.
- Le joueur 2 occupe la moitié haute tournée à 180° ; le joueur 1 occupe la moitié basse.
- Réutiliser `Dialog` de `src/components/ui/dialog.tsx`.
- Aucun tiret cadratin dans le texte rendu.
- Code, variables et commentaires en français.
- Toute nouvelle fonction avec une branche ou une boucle reçoit un test Vitest.
- Lire la documentation locale de Next.js dans `node_modules/next/dist/docs/` avant toute modification des routes ou composants.

---

### Task 1: File d’envoi et état réversible

**Files:**
- Create: `src/lib/overlay-compagnon-client.ts`
- Modify: `src/lib/overlay-compagnon-client.test.ts`

**Interfaces:**
- Consumes: `OverlayStateData` et `applyStateUpdate` depuis `@/lib/overlay`.
- Produces: `fusionnerPatchs(a, b)`, `creerFilePatchs(envoyer, surEtat?)`, `bornerEtape(etape)`, `memoriserManche(state)` et `patchPourRestaurerManche(memoire)`.
- `creerFilePatchs` expose `ajouter`, `renvoyer`, `quandCalme`, `quandVide`, `aDesChangements` et `prendreEnAttente`.

- [ ] **Step 1: Compléter les tests rouges**

Ajouter aux trois tests déjà présents :

```ts
it("borne le parcours entre les trois étapes", () => {
  expect(bornerEtape(-1)).toBe(0);
  expect(bornerEtape(1)).toBe(1);
  expect(bornerEtape(8)).toBe(2);
});

it("restaure les points et les manches précédant la fin de manche", () => {
  const state = applyStateUpdate(defaultOverlayState(), {
    points: { a: 7, b: 5 },
    players: [{ gamesWon: 1 }, { gamesWon: 0 }],
  });
  const memoire = memoriserManche(state);
  expect(patchPourRestaurerManche(memoire)).toEqual({
    points: { a: 7, b: 5 },
    players: [{ gamesWon: 1 }, { gamesWon: 0 }],
  });
});
```

- [ ] **Step 2: Vérifier l’échec**

Run:

```powershell
npx vitest run src/lib/overlay-compagnon-client.test.ts; Write-Output "EXIT=$LASTEXITCODE"
```

Expected: FAIL car `overlay-compagnon-client.ts` n’existe pas.

- [ ] **Step 3: Écrire la logique minimale**

Créer les types et fonctions suivants :

```ts
export type PatchCompagnon = Parameters<typeof applyStateUpdate>[1];
export type EtatEnvoi = "envoi" | "a-jour" | "hors-ligne";

export interface MemoireManche {
  points: OverlayStateData["points"];
  manches: [number, number];
}

export function fusionnerPatchs(a: PatchCompagnon, b: PatchCompagnon): PatchCompagnon;
export function bornerEtape(etape: number): 0 | 1 | 2;
export function memoriserManche(state: OverlayStateData): MemoireManche;
export function patchPourRestaurerManche(memoire: MemoireManche): PatchCompagnon;
export function creerFilePatchs(
  envoyer: (patch: PatchCompagnon) => Promise<void>,
  surEtat?: (etat: EtatEnvoi) => void,
): {
  ajouter(patch: PatchCompagnon): void;
  renvoyer(): void;
  quandCalme(): Promise<void>;
  quandVide(): Promise<void>;
  aDesChangements(): boolean;
  prendreEnAttente(): PatchCompagnon | null;
};
```

La file ne lance qu’une promesse à la fois. Elle fusionne les nouveaux patchs dans `attente`. En cas d’échec, elle remet le patch envoyé devant `attente`, passe à `hors-ligne` et attend `renvoyer`. `quandCalme` se résout quand aucun envoi ne tourne. `quandVide` se résout quand aucun envoi ne tourne et que `attente` est vide.

- [ ] **Step 4: Vérifier le vert**

Run:

```powershell
npx vitest run src/lib/overlay-compagnon-client.test.ts; Write-Output "EXIT=$LASTEXITCODE"
```

Expected: 5 tests PASS, `EXIT=0`.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/overlay-compagnon-client.ts src/lib/overlay-compagnon-client.test.ts
git commit -m "fix(overlay): garde les changements du companion dans l’ordre"
```

---

### Task 2: Création guidée de la partie

**Files:**
- Modify: `src/app/compagnon/[token]/[cle]/compagnon.tsx`
- Modify: `src/lib/i18n-en.ts`

**Interfaces:**
- Consumes: `creerFilePatchs`, `bornerEtape`, `PatchCompagnon` et `EtatEnvoi` de la tâche 1.
- Produces: trois étapes locales dans `Compagnon` et une sauvegarde réseau séquentielle.

- [ ] **Step 1: Brancher la file sans changer le rendu**

Créer une seule file dans un `useRef`. Son expéditeur appelle :

```ts
const reponse = await fetch(`/api/overlay/${token}/compagnon`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-cle-compagnon": cle },
  body: JSON.stringify(patch),
  keepalive: true,
});
```

Lever une erreur avec le message JSON du serveur si `reponse.ok` vaut `false`. `envoyer` applique le patch localement, puis appelle `file.current.ajouter(patch)`. Retirer le minuteur de 300 ms et les références `minuteur` et `enAttente` du composant.

- [ ] **Step 2: Ajouter le retour de synchronisation**

Garder une région stable :

```tsx
<p role="status" aria-live="polite" className="text-xs text-ink-secondary">
  {etatEnvoi === "envoi" ? t("Envoi…") : etatEnvoi === "hors-ligne" ? t("Hors ligne") : t("À jour")}
</p>
```

En cas d’échec, afficher `role="alert"`, `text-error-light` et un bouton `Réessayer` qui appelle `file.current.renvoyer()`.

- [ ] **Step 3: Charger les listes avec un état explicite**

Remplacer les trois `.catch(() => {})` par un helper local qui vérifie `response.ok`. Conserver un message par ressource : Légendes, Champions et champs de bataille. Chaque erreur offre un bouton `Réessayer` et ne supprime pas une liste déjà chargée.

- [ ] **Step 4: Découper le formulaire en trois étapes rendues dans le même composant**

Ajouter `const [etape, setEtape] = useState<0 | 1 | 2>(0)`.

- Étape 0 : format, points et deux pseudos.
- Étape 1 : une carte par joueur avec Légende, Champion et champ de bataille.
- Étape 2 : résumé des deux joueurs avec illustration de Légende, puis « Lancer la partie ».

Les boutons `Retour` et `Continuer` appellent `setEtape(bornerEtape(etape ± 1))`. Aucun choix de deck n’est obligatoire. Les contrôles portent `name`, `autocomplete="off"` et des étiquettes visibles.

- [ ] **Step 5: Ajouter les traductions exactes**

Ajouter à `src/lib/i18n-en.ts` les clés françaises nouvelles, notamment :

```ts
"Créer la partie": "Create match",
"Choisir les decks": "Choose decks",
"Vérifier la partie": "Review match",
"Continuer": "Continue",
"Retour": "Back",
"Vos changements s’affichent sur le stream dès qu’ils sont enregistrés.":
  "Your changes appear on stream as soon as they are saved.",
"Modification non envoyée. Vérifiez votre connexion, puis réessayez.":
  "Change not sent. Check your connection, then try again.",
"Réessayer": "Try again",
"À jour": "Up to date",
"Hors ligne": "Offline",
```

- [ ] **Step 6: Vérifier types et test ciblé**

Run:

```powershell
npx vitest run src/lib/overlay-compagnon-client.test.ts; Write-Output "TEST_EXIT=$LASTEXITCODE"
npx tsc --noEmit; Write-Output "TSC_EXIT=$LASTEXITCODE"
```

Expected: tests PASS et deux codes `0`.

- [ ] **Step 7: Commit**

```powershell
git add src/app/compagnon/[token]/[cle]/compagnon.tsx src/lib/i18n-en.ts
git commit -m "feat(compagnon): guide la création de la partie"
```

---

### Task 3: Compteur graphique face-à-face

**Files:**
- Modify: `src/app/compagnon/[token]/[cle]/compagnon.tsx`
- Modify: `src/app/compagnon/[token]/[cle]/compagnon.module.css`
- Modify: `src/lib/i18n-en.ts`

**Interfaces:**
- Consumes: `memoriserManche`, `patchPourRestaurerManche`, `Dialog`, `DialogContent`, `DialogTitle` et `DialogDescription`.
- Produces: écran face-à-face, fin de manche accessible et annulation d’une manche.

- [ ] **Step 1: Mémoriser la dernière manche**

Avant `finDeManche`, stocker `memoriserManche(state)` dans un état `derniereManche`. Après le choix du gagnant, remettre les points à zéro et incrémenter `gamesWon` comme aujourd’hui.

Créer `annulerDerniereManche` : envoyer `patchPourRestaurerManche(derniereManche)`, vider la mémoire et fermer le dialogue de victoire. `nouveauMatch` vide aussi cette mémoire.

- [ ] **Step 2: Transformer chaque moitié en panneau illustré**

Pour chaque joueur, retrouver la Légende dans `legendes` et poser `imageUrl` en arrière-plan avec un style en ligne. Ajouter un voile sombre en CSS. Le panneau haut reçoit la classe CSS `joueurInverse` avec `transform: rotate(180deg)` ; ne pas retourner toute la page ni la barre centrale.

Chaque panneau affiche : pseudo, Champion, champ de bataille, points, moins et plus. Contraindre les textes longs avec `min-w-0`, `max-w-full` et `truncate`.

- [ ] **Step 3: Construire la barre centrale**

La barre affiche le score des manches, le format, le seuil, l’état réseau, `Réglages`, `Fin de la manche` et, si disponible, `Annuler la dernière manche`. Tous les boutons ont `min-h-11`. `Fin de la manche` reste l’action principale.

- [ ] **Step 4: Remplacer les fenêtres maison par Dialog**

Le dialogue de fin de manche utilise `Dialog` contrôlé par `demandeGagnant`. Son contenu contient deux boutons de 64 px ; celui du joueur 2 tourne son contenu à 180°.

Le dialogue de victoire utilise `Dialog` contrôlé par `vainqueur !== null`. Il contient le gagnant, `Corriger la dernière manche` et `Nouveau match`. Le premier clic sur `Nouveau match` révèle `Confirmer le nouveau match`; le second appelle `nouveauMatch`.

- [ ] **Step 5: Corriger le responsive et le mouvement**

Dans `compagnon.module.css` :

```css
.match {
  min-height: 100dvh;
  padding-block: env(safe-area-inset-top) env(safe-area-inset-bottom);
}

.joueurInverse {
  transform: rotate(180deg);
}

@media (orientation: landscape), (max-height: 560px) {
  .match {
    min-height: 100dvh;
    overflow-y: auto;
  }
}
```

Utiliser `active:scale-[0.96]`, jamais `active:scale-90`. Ne pas animer l’illustration ni le flou. Respecter le réglage global `prefers-reduced-motion`.

- [ ] **Step 6: Ajouter les traductions**

Ajouter : `Annuler la dernière manche`, `Corriger la dernière manche`, `Confirmer le nouveau match`, `Champion`, `Champ de bataille` et les textes du dialogue.

- [ ] **Step 7: Vérifier**

Run:

```powershell
npx vitest run src/lib/overlay-compagnon-client.test.ts; Write-Output "TEST_EXIT=$LASTEXITCODE"
npx tsc --noEmit; Write-Output "TSC_EXIT=$LASTEXITCODE"
```

Expected: tests PASS et deux codes `0`.

- [ ] **Step 8: Commit**

```powershell
git add src/app/compagnon/[token]/[cle]/compagnon.tsx src/app/compagnon/[token]/[cle]/compagnon.module.css src/lib/i18n-en.ts
git commit -m "feat(compagnon): affiche le compteur face-à-face"
```

---

### Task 4: Partage du companion et garde de sortie

**Files:**
- Modify: `src/app/profil/overlay/overlay-dashboard.tsx`
- Modify: `src/lib/i18n-en.ts`

**Interfaces:**
- Consumes: API native `navigator.clipboard.writeText`.
- Produces: retour accessible et exact pour la copie du lien companion.

- [ ] **Step 1: Rendre la copie honnête**

Remplacer l’appel sans attente par :

```ts
async function copierCompagnon() {
  try {
    await navigator.clipboard.writeText(urlCompagnon);
    setCopieCompagnon("copie");
  } catch {
    setCopieCompagnon("erreur");
  }
}
```

Typer l’état `"repos" | "copie" | "erreur"`. Revenir à `repos` après 1,5 s seulement après un succès.

- [ ] **Step 2: Corriger la structure et le texte**

Remplacer le `<label>` sans contrôle par `<h3>`. Garder une région `role="status"` stable pour `Copié`. En cas d’échec, afficher `role="alert"` et « Copie impossible. Sélectionnez le lien et copiez-le. »

Remplacer les deux avertissements par : « Toute personne qui possède ce lien peut modifier l’habillage. Ne le montrez pas en direct. »

- [ ] **Step 3: Ajouter les traductions exactes**

Ajouter les deux nouvelles phrases françaises et leurs versions anglaises dans `src/lib/i18n-en.ts`.

- [ ] **Step 4: Vérifier les types**

Run:

```powershell
npx tsc --noEmit; Write-Output "EXIT=$LASTEXITCODE"
```

Expected: `EXIT=0`.

- [ ] **Step 5: Commit**

```powershell
git add src/app/profil/overlay/overlay-dashboard.tsx src/lib/i18n-en.ts
git commit -m "fix(overlay): confirme la copie du lien companion"
```

---

### Task 5: Vérification visuelle et porte finale

**Files:**
- Modify only if a check exposes a defect in the files from Tasks 1-4.

**Interfaces:**
- Consumes: companion local, overlay compact local et scripts du dépôt.
- Produces: preuve de fonctionnement et dépôt vert.

- [ ] **Step 1: Tester le parcours mobile**

Avec le serveur local et un vrai lien companion de la base de développement, vérifier :

- création en trois étapes à 320 px ;
- retour sans perte de données ;
- illustration de Légende ;
- joueur 2 lisible depuis le haut du téléphone ;
- boutons de 64 px et petites actions de 44 px ;
- pseudos très longs ;
- dialogue au clavier, Échap et retour du focus ;
- zoom 200 % ;
- paysage à moins de 560 px de haut.

- [ ] **Step 2: Tester l’envoi et l’overlay compact**

Ouvrir `/overlay/<token>?compact=1` en parallèle. Marquer plusieurs points vite, couper le réseau, marquer un point, rétablir le réseau et toucher `Réessayer`. Vérifier que l’overlay reçoit les valeurs dans le bon ordre. Finir une manche, l’annuler, puis finir un BO.

Pour Moblin, charger le même lien compact. Ne pas créer un autre rendu.

- [ ] **Step 3: Tester le bloc de partage**

Vérifier la copie accordée, puis refusée. Le texte visuel et le lecteur d’écran doivent recevoir le bon résultat.

- [ ] **Step 4: Lancer les tests**

Run:

```powershell
npx vitest run; Write-Output "TEST_EXIT=$LASTEXITCODE"
npm run lint; Write-Output "LINT_EXIT=$LASTEXITCODE"
```

Expected: tous les tests PASS, lint avec 0 erreur. Les avertissements déjà connus ne bloquent pas.

- [ ] **Step 5: Lancer la porte du dépôt**

Run:

```powershell
npm run verify; Write-Output "VERIFY_EXIT=$LASTEXITCODE"
```

Expected: TypeScript et build Next.js réussissent, `VERIFY_EXIT=0`.

- [ ] **Step 6: Relire le diff**

Run:

```powershell
git diff --check
git status --short
```

Vérifier qu’aucun fichier hors du plan n’a changé et qu’aucun tiret cadratin n’apparaît dans le nouveau texte rendu.

- [ ] **Step 7: Commit final si une correction de vérification existe**

```powershell
git add src/lib/overlay-compagnon-client.ts src/lib/overlay-compagnon-client.test.ts src/app/compagnon/[token]/[cle]/compagnon.tsx src/app/compagnon/[token]/[cle]/compagnon.module.css src/app/profil/overlay/overlay-dashboard.tsx src/lib/i18n-en.ts
git commit -m "fix(compagnon): corrige le rendu mobile vérifié"
```
