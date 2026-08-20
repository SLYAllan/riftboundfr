import { applyStateUpdate, type OverlayStateData } from "./overlay";

export type PatchCompagnon = Parameters<typeof applyStateUpdate>[1];
export type EtatEnvoi = "envoi" | "a-jour" | "hors-ligne";

export interface MemoireManche {
  points: OverlayStateData["points"];
  manches: [number, number];
}

function estVide(patch: PatchCompagnon): boolean {
  return Object.keys(patch).length === 0;
}

export function fusionnerPatchs(a: PatchCompagnon, b: PatchCompagnon): PatchCompagnon {
  const joueurs = a.players || b.players;
  return {
    ...a,
    ...b,
    event: a.event || b.event ? { ...a.event, ...b.event } : undefined,
    points: a.points || b.points ? { ...a.points, ...b.points } : undefined,
    players: joueurs
      ? [
          { ...a.players?.[0], ...b.players?.[0] },
          { ...a.players?.[1], ...b.players?.[1] },
        ]
      : undefined,
  } as PatchCompagnon;
}

export function bornerEtape(etape: number): 0 | 1 | 2 {
  return Math.max(0, Math.min(2, etape)) as 0 | 1 | 2;
}

export function memoriserManche(state: OverlayStateData): MemoireManche {
  return {
    points: { ...state.points },
    manches: [state.players[0].gamesWon, state.players[1].gamesWon],
  };
}

export function patchPourRestaurerManche(memoire: MemoireManche): PatchCompagnon {
  return {
    points: { ...memoire.points },
    players: [{ gamesWon: memoire.manches[0] }, { gamesWon: memoire.manches[1] }],
  } as PatchCompagnon;
}

export function creerFilePatchs(
  envoyer: (patch: PatchCompagnon) => Promise<void>,
  surEtat: (etat: EtatEnvoi) => void = () => {},
) {
  let attente: PatchCompagnon = {};
  let enCours = false;
  let bloquee = false;
  let calme: Array<() => void> = [];
  let vide: Array<() => void> = [];

  function notifier() {
    if (!enCours) {
      calme.forEach((resoudre) => resoudre());
      calme = [];
    }
    if (!enCours && estVide(attente)) {
      vide.forEach((resoudre) => resoudre());
      vide = [];
    }
  }

  async function vider() {
    if (enCours || bloquee || estVide(attente)) {
      notifier();
      return;
    }
    const patch = attente;
    attente = {};
    enCours = true;
    surEtat("envoi");
    try {
      await envoyer(patch);
      surEtat("a-jour");
    } catch {
      attente = fusionnerPatchs(patch, attente);
      bloquee = true;
      surEtat("hors-ligne");
    } finally {
      enCours = false;
      notifier();
      if (!bloquee && !estVide(attente)) void vider();
    }
  }

  return {
    ajouter(patch: PatchCompagnon) {
      attente = fusionnerPatchs(attente, patch);
      // Une action de plus vaut un nouvel essai. Sans ça, un seul envoi refusé
      // gelait la file : le téléphone continuait de compter, l'écran du stream
      // restait figé, et rien ne repartait tant que personne ne lisait la
      // bannière pour cliquer « Réessayer ».
      bloquee = false;
      void vider();
    },
    renvoyer() {
      bloquee = false;
      void vider();
    },
    quandCalme: () => (enCours ? new Promise<void>((resoudre) => calme.push(resoudre)) : Promise.resolve()),
    quandVide: () => (!enCours && estVide(attente) ? Promise.resolve() : new Promise<void>((resoudre) => vide.push(resoudre))),
    aDesChangements: () => enCours || !estVide(attente),
    prendreEnAttente() {
      // Un second POST pendant celui qui tourne pourrait arriver le premier en base,
      // puis se faire écraser par l'ancien. Mieux vaut laisser keepalive finir l'envoi.
      if (enCours || estVide(attente)) return null;
      const patch = attente;
      attente = {};
      notifier();
      return patch;
    },
  };
}
