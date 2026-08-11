import { ICON_MAP } from "./banners";
import { DOMAIN_ICONS, DOMAIN_LABELS_FR } from "./domains";

// Incrustations façon forum : « :furie: » pose le logo du domaine, « :irelia: »
// la vignette de la Légende. Le vocabulaire vient des icônes déjà présentes, on
// n'ajoute aucun asset.

export interface Emote {
  /** Ce qu'on tape entre deux-points, sans les deux-points. */
  nom: string;
  src: string;
  label: string;
  categorie: "domaine" | "legende";
}

// Les joueurs écrivent en français ; on accepte aussi l'anglais des cartes.
const ALIAS_DOMAINE: Record<string, string> = {
  furie: "Fury", fury: "Fury",
  calme: "Calm", calm: "Calm",
  esprit: "Mind", mind: "Mind",
  corps: "Body", body: "Body",
  chaos: "Chaos",
  ordre: "Order", order: "Order",
};

function construire(): Map<string, Emote> {
  const map = new Map<string, Emote>();

  for (const [alias, domaine] of Object.entries(ALIAS_DOMAINE)) {
    const src = DOMAIN_ICONS[domaine];
    if (!src) continue;
    map.set(alias, { nom: alias, src, label: DOMAIN_LABELS_FR[domaine] ?? domaine, categorie: "domaine" });
  }

  for (const [cle, fichier] of Object.entries(ICON_MAP)) {
    // « master yi » ne peut pas s'écrire entre deux-points avec un espace.
    const nom = cle.replace(/[^a-z0-9]/g, "");
    if (!nom || map.has(nom)) continue;
    const label = cle.replace(/\b\w/g, (c) => c.toUpperCase());
    map.set(nom, { nom, src: `/img/legend_icon/${fichier}.webp`, label, categorie: "legende" });
  }

  return map;
}

export const EMOTES = construire();

/**
 * Les incrustations du menu : une par icône. Le parseur connaît « calme » ET
 * « calm », mais les afficher toutes les deux montrerait deux fois le même logo.
 * On garde le nom français, celui de ALIAS_DOMAINE en premier.
 */
export const LISTE_EMOTES: Emote[] = [...new Map([...EMOTES.values()].map((e) => [e.src, e])).values()].sort(
  (a, b) =>
    (a.categorie === b.categorie ? 0 : a.categorie === "domaine" ? -1 : 1) ||
    a.label.localeCompare(b.label, "fr"),
);

export function trouverEmote(nom: string): Emote | undefined {
  return EMOTES.get(nom.toLowerCase());
}

export type MorceauTexte = { type: "texte"; valeur: string };
export type MorceauEmote = { type: "emote"; emote: Emote };
export type Morceau = MorceauTexte | MorceauEmote;

// Un nom d'incrustation ne contient que des lettres et des chiffres : « 12:30 »
// ou « http://… » ne doivent jamais être pris pour une incrustation.
const MOTIF = /:([a-z0-9]{2,24}):/gi;

/** Découpe un texte en morceaux, en remplaçant les « :nom: » connus. */
export function decouperEmotes(texte: string): Morceau[] {
  if (!texte.includes(":")) return [{ type: "texte", valeur: texte }];

  const morceaux: Morceau[] = [];
  let dernier = 0;
  let m: RegExpExecArray | null;
  MOTIF.lastIndex = 0;

  while ((m = MOTIF.exec(texte)) !== null) {
    const emote = trouverEmote(m[1]);
    if (!emote) continue; // nom inconnu : on laisse le texte tel quel
    if (m.index > dernier) morceaux.push({ type: "texte", valeur: texte.slice(dernier, m.index) });
    morceaux.push({ type: "emote", emote });
    dernier = m.index + m[0].length;
  }

  if (dernier === 0) return [{ type: "texte", valeur: texte }];
  if (dernier < texte.length) morceaux.push({ type: "texte", valeur: texte.slice(dernier) });
  return morceaux;
}

export function contientEmote(texte: string): boolean {
  return decouperEmotes(texte).some((m) => m.type === "emote");
}
