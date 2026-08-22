import type { OverlayPlayer, OverlayStateData } from "./overlay";

export type PatchOverlay = Partial<OverlayStateData> & { players?: Array<Partial<OverlayPlayer>> };
type ValidationOverlay = { ok: true; value: PatchOverlay } | { ok: false; error: string };

const LIMITES = {
  corps: 32_768,
  texte: 120,
  url: 2_048,
  cartes: 80,
};

export const TAILLE_MAX_PATCH_OVERLAY = LIMITES.corps;

function estObjet(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function champsConnus(objet: Record<string, unknown>, permis: string[], contexte = "overlay"): string | null {
  const inconnu = Object.keys(objet).find((cle) => !permis.includes(cle));
  return inconnu ? `Champ ${contexte} inconnu : ${inconnu}` : null;
}

function chaine(value: unknown, chemin: string, limite = LIMITES.texte): string | null {
  if (typeof value !== "string") return `${chemin} doit être une chaîne`;
  return value.length > limite ? `${chemin} dépasse ${limite} caractères` : null;
}

function nombre(value: unknown, chemin: string, min: number, max: number): string | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    return `${chemin} doit être compris entre ${min} et ${max}`;
  }
  return null;
}

function validerJoueur(value: unknown, index: number): string | null {
  if (!estObjet(value)) return `players.${index} doit être un objet`;
  const prefixe = `players.${index}`;
  const inconnu = champsConnus(value, ["name", "legendId", "legendName", "championName", "battlefields", "gamesWon", "camUrl", "camBackground", "camNonce"], prefixe);
  if (inconnu) return inconnu;
  for (const cle of ["name", "legendName", "championName"] as const) {
    if (value[cle] !== undefined) {
      const erreur = chaine(value[cle], `${prefixe}.${cle}`);
      if (erreur) return erreur;
    }
  }
  if (value.legendId !== undefined && value.legendId !== null) {
    const erreur = chaine(value.legendId, `${prefixe}.legendId`);
    if (erreur) return erreur;
  }
  if (value.camUrl !== undefined) {
    const erreur = chaine(value.camUrl, `${prefixe}.camUrl`, LIMITES.url);
    if (erreur) return erreur;
  }
  if (value.camBackground !== undefined && typeof value.camBackground !== "boolean") return `${prefixe}.camBackground doit être un booléen`;
  if (value.camNonce !== undefined) {
    // Un horodatage en millisecondes : la borne haute laisse de la marge jusqu'en 2100.
    const erreur = nombre(value.camNonce, `${prefixe}.camNonce`, 0, 4e12);
    if (erreur) return erreur;
  }
  if (value.gamesWon !== undefined) {
    const erreur = nombre(value.gamesWon, `${prefixe}.gamesWon`, 0, 5);
    if (erreur) return erreur;
  }
  if (value.battlefields !== undefined) {
    if (!Array.isArray(value.battlefields) || value.battlefields.length > 3) return `${prefixe}.battlefields accepte au maximum 3 cartes`;
    for (const [i, battlefield] of value.battlefields.entries()) {
      const erreur = chaine(battlefield, `${prefixe}.battlefields.${i}`);
      if (erreur) return erreur;
    }
  }
  return null;
}

export function validerPatchOverlay(value: unknown): ValidationOverlay {
  if (!estObjet(value)) return { ok: false, error: "Le patch overlay doit être un objet JSON" };
  if (JSON.stringify(value).length > LIMITES.corps) return { ok: false, error: "Le patch overlay dépasse 32 Kio" };

  const inconnu = champsConnus(value, ["event", "format", "maxPoints", "points", "players", "cards"]);
  if (inconnu) return { ok: false, error: inconnu };

  if (value.format !== undefined && !["BO1", "BO3", "BO5"].includes(String(value.format))) {
    return { ok: false, error: "format doit être BO1, BO3 ou BO5" };
  }
  if (value.maxPoints !== undefined && ![8, 9, 10].includes(Number(value.maxPoints))) {
    return { ok: false, error: "maxPoints doit être 8, 9 ou 10" };
  }

  if (value.event !== undefined) {
    if (!estObjet(value.event)) return { ok: false, error: "event doit être un objet" };
    const erreurChamp = champsConnus(value.event, ["title", "round", "logoUrl", "endsAt", "timerVisible", "pointsVisible", "paused", "timerDepassement", "timerMonte", "layout", "backgroundUrl", "backgroundNocamUrl", "backgroundCompactUrl"], "event");
    if (erreurChamp) return { ok: false, error: erreurChamp };
    for (const cle of ["title", "round"] as const) {
      if (value.event[cle] !== undefined) {
        const erreur = chaine(value.event[cle], `event.${cle}`);
        if (erreur) return { ok: false, error: erreur };
      }
    }
    for (const cle of ["logoUrl", "backgroundUrl", "backgroundNocamUrl", "backgroundCompactUrl"] as const) {
      if (value.event[cle] !== undefined) {
        const erreur = chaine(value.event[cle], `event.${cle}`, LIMITES.url);
        if (erreur) return { ok: false, error: erreur };
      }
    }
    if (value.event.endsAt !== undefined && value.event.endsAt !== null) {
      const erreur = chaine(value.event.endsAt, "event.endsAt");
      if (erreur) return { ok: false, error: erreur };
    }
    for (const cle of ["timerVisible", "pointsVisible", "timerDepassement", "timerMonte"] as const) {
      if (value.event[cle] !== undefined && typeof value.event[cle] !== "boolean") {
        return { ok: false, error: `event.${cle} doit être un booléen` };
      }
    }
    if (value.event.paused !== undefined && value.event.paused !== null) {
      // Borne basse negative : en prolongation, la pause fige un temps DEPASSE.
      const erreur = nombre(value.event.paused, "event.paused", -86400, 86400);
      if (erreur) return { ok: false, error: erreur };
    }
    if (value.event.layout !== undefined && !["cams", "nocam"].includes(String(value.event.layout))) {
      return { ok: false, error: "event.layout doit être cams ou nocam" };
    }
  }

  if (value.points !== undefined) {
    if (!estObjet(value.points)) return { ok: false, error: "points doit être un objet" };
    const erreurChamp = champsConnus(value.points, ["a", "b"], "points");
    if (erreurChamp) return { ok: false, error: erreurChamp };
    for (const cle of ["a", "b"] as const) {
      if (value.points[cle] !== undefined) {
        const erreur = nombre(value.points[cle], `points.${cle}`, 0, 10);
        if (erreur) return { ok: false, error: erreur };
      }
    }
  }

  if (value.players !== undefined) {
    if (!Array.isArray(value.players) || value.players.length > 2) return { ok: false, error: "players accepte au maximum 2 joueurs" };
    for (const [i, joueur] of value.players.entries()) {
      const erreur = validerJoueur(joueur, i);
      if (erreur) return { ok: false, error: erreur };
    }
  }

  if (value.cards !== undefined) {
    if (!estObjet(value.cards)) return { ok: false, error: "cards doit être un objet" };
    const erreurChamp = champsConnus(value.cards, ["lists", "ignored", "mode", "auto", "index", "seconds"], "cards");
    if (erreurChamp) return { ok: false, error: erreurChamp };
    // `lists` et `ignored` : deux listes de noms de cartes.
    for (const cle of ["lists", "ignored"] as const) {
      const v = value.cards[cle];
      if (v === undefined) continue;
      if (!Array.isArray(v) || v.length !== 2) return { ok: false, error: `cards.${cle} doit contenir 2 listes` };
      for (const [li, liste] of v.entries()) {
        if (!Array.isArray(liste) || liste.length > LIMITES.cartes) return { ok: false, error: `cards.${cle}.${li} accepte au maximum ${LIMITES.cartes} cartes` };
        for (const [ci, carte] of liste.entries()) {
          const erreur = chaine(carte, `cards.${cle}.${li}.${ci}`);
          if (erreur) return { ok: false, error: erreur };
        }
      }
    }
    // `mode` : aucune / un cadre mêlé / deux cadres.
    if (value.cards.mode !== undefined && !["none", "mixed", "split"].includes(String(value.cards.mode))) {
      return { ok: false, error: "cards.mode doit être none, mixed ou split" };
    }
    // `auto` : un seul booléen (diapo automatique).
    if (value.cards.auto !== undefined && typeof value.cards.auto !== "boolean") {
      return { ok: false, error: "cards.auto doit être un booléen" };
    }
    // `index` : deux entiers (la carte courante par côté).
    if (value.cards.index !== undefined) {
      const v = value.cards.index;
      if (!Array.isArray(v) || v.length !== 2 || v.some((x) => typeof x !== "number")) return { ok: false, error: "cards.index doit être deux nombres" };
    }
    // `seconds` : durée d'une carte en diapo auto.
    if (value.cards.seconds !== undefined) {
      const erreur = nombre(value.cards.seconds, "cards.seconds", 1, 60);
      if (erreur) return { ok: false, error: erreur };
    }
  }

  return { ok: true, value: value as PatchOverlay };
}
