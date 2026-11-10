type Objet = Record<string, unknown>;

export type ResultatValidation<T> = { ok: true; value: T } | { ok: false; error: string };

const LIMITES = {
  titre: 200,
  texte: 100_000,
  court: 500,
  url: 2_048,
  tags: 30,
  blocs: 100,
  cartes: 300,
  entrees: 500,
} as const;

function objet(value: unknown, nom: string): ResultatValidation<Objet> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? { ok: true, value: value as Objet }
    : { ok: false, error: `${nom} doit être un objet JSON` };
}

function champsConnus(value: Objet, permis: readonly string[], nom: string): string | null {
  const inconnu = Object.keys(value).find((cle) => !permis.includes(cle));
  return inconnu ? `Champ ${nom} inconnu : ${inconnu}` : null;
}

function chaine(value: unknown, chemin: string, limite: number, obligatoire = false): string | null {
  if (value === undefined && !obligatoire) return null;
  if (value === null && !obligatoire) return null;
  if (typeof value !== "string") return `${chemin} doit être une chaîne`;
  if (value.length > limite) return `${chemin} dépasse ${limite} caractères`;
  if (obligatoire && value.trim() === "") return `${chemin} est requis`;
  return null;
}

function booleen(value: unknown, chemin: string): string | null {
  return value === undefined || typeof value === "boolean" ? null : `${chemin} doit être un booléen`;
}

function entier(value: unknown, chemin: string, min: number, max: number): string | null {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
    ? null
    : `${chemin} doit être un entier entre ${min} et ${max}`;
}

function dateIso(value: unknown, chemin: string, obligatoire = false): string | null {
  if (value === undefined && !obligatoire) return null;
  if (value === null && !obligatoire) return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(value)) return `${chemin} doit être une date ISO valide`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return `${chemin} doit être une date ISO valide`;
  const [annee, mois, jour] = value.slice(0, 10).split("-").map(Number);
  const dateCalendrier = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (dateCalendrier.getUTCFullYear() !== annee || dateCalendrier.getUTCMonth() + 1 !== mois || dateCalendrier.getUTCDate() !== jour) return `${chemin} doit être une date ISO valide`;
  return null;
}

function validerTags(value: unknown): string | null {
  if (value === undefined) return null;
  if (!Array.isArray(value) || value.length > LIMITES.tags) return `tags accepte au maximum ${LIMITES.tags} éléments`;
  for (const [i, tag] of value.entries()) {
    const erreur = chaine(tag, `tags.${i}`, 50, true);
    if (erreur) return erreur;
  }
  return null;
}

function validerBloc(value: unknown, index: number): string | null {
  const bloc = objet(value, `blocks.${index}`);
  if (!bloc.ok) return bloc.error;
  if (typeof bloc.value.type !== "string") return `blocks.${index}.type doit être une chaîne`;
  if (bloc.value.type === "separator") {
    const erreur = champsConnus(bloc.value, ["type", "id"], `blocks.${index}`);
    if (erreur) return erreur;
    return chaine(bloc.value.id, `blocks.${index}.id`, 100, true);
  }

  const schemas: Record<string, readonly string[]> = {
    text: ["type", "id", "content"],
    decklist: ["type", "id", "deckCode", "deckName", "legendName", "championName", "playerName", "context", "deckId", "collapsed"],
    sponsor_link: ["type", "id", "title", "description", "imageUrl", "ctaText", "url", "style", "isSponsored"],
    image: ["type", "id", "src", "alt", "caption", "width"],
    video: ["type", "id", "src", "poster", "caption", "loop"],
    tweet: ["type", "id", "url", "author", "handle", "content", "date", "avatar", "media", "mediaAlt"],
    bracket: ["type", "id", "title", "rounds"],
  };
  const permis = schemas[bloc.value.type];
  if (!permis) return `blocks.${index}.type inconnu`;
  const erreurChamp = champsConnus(bloc.value, permis, `blocks.${index}`);
  if (erreurChamp) return erreurChamp;
  const erreurId = chaine(bloc.value.id, `blocks.${index}.id`, 100, true);
  if (erreurId) return erreurId;

  if (bloc.value.type === "bracket") return validerBracket(bloc.value, index);
  const champsObligatoires: Record<string, readonly string[]> = {
    text: ["content"],
    decklist: ["deckCode", "deckName", "legendName"],
    sponsor_link: ["title", "ctaText", "url"],
    image: ["src", "alt"],
    video: ["src"],
    tweet: ["url", "author", "handle", "content"],
  };
  for (const cle of champsObligatoires[bloc.value.type]) {
    if (bloc.value[cle] === undefined) return `blocks.${index}.${cle} est requis`;
    if (typeof bloc.value[cle] === "string" && bloc.value[cle].trim() === "") return `blocks.${index}.${cle} est requis`;
    const erreur = chaine(bloc.value[cle], `blocks.${index}.${cle}`, cle === "deckCode" || cle === "content" ? LIMITES.texte : LIMITES.court, true);
    if (erreur) return erreur;
  }
  if (bloc.value.type === "sponsor_link") {
    if (bloc.value.style === undefined) return `blocks.${index}.style est requis`;
    if (bloc.value.isSponsored === undefined) return `blocks.${index}.isSponsored est requis`;
  }
  const champsChaines: Record<string, readonly string[]> = {
    text: ["content"],
    decklist: ["deckCode", "deckName", "legendName", "championName", "playerName", "context", "deckId"],
    sponsor_link: ["title", "description", "imageUrl", "ctaText", "url"],
    image: ["src", "alt", "caption"],
    tweet: ["url", "author", "handle", "content", "date", "avatar", "media", "mediaAlt"],
  };
  for (const cle of champsChaines[bloc.value.type] ?? []) {
    if (bloc.value[cle] !== undefined) {
      const erreur = chaine(bloc.value[cle], `blocks.${index}.${cle}`, cle === "deckCode" || cle === "content" ? LIMITES.texte : LIMITES.court);
      if (erreur) return erreur;
    }
  }
  const champsBooleens: Record<string, readonly string[]> = {
    decklist: ["collapsed"],
    sponsor_link: ["isSponsored"],
  };
  for (const cle of champsBooleens[bloc.value.type] ?? []) {
    const erreur = booleen(bloc.value[cle], `blocks.${index}.${cle}`);
    if (erreur) return erreur;
  }
  if (bloc.value.type === "sponsor_link" && bloc.value.style !== undefined && !["standard", "highlight", "minimal"].includes(String(bloc.value.style))) {
    return `blocks.${index}.style inconnu`;
  }
  if (bloc.value.type === "image" && bloc.value.width !== undefined && !["full", "narrow"].includes(String(bloc.value.width))) {
    return `blocks.${index}.width inconnu`;
  }
  for (const cle of ["collapsed", "isSponsored"] as const) {
    const erreur = booleen(bloc.value[cle], `blocks.${index}.${cle}`);
    if (erreur) return erreur;
  }
  return null;
}

function validerBracket(bloc: Objet, index: number): string | null {
  const erreurTitre = chaine(bloc.title, `blocks.${index}.title`, LIMITES.court);
  if (erreurTitre) return erreurTitre;
  const rounds = bloc.rounds;
  if (!Array.isArray(rounds) || rounds.length > 16) return `blocks.${index}.rounds doit contenir au maximum 16 tableaux`;
  for (const [roundIndex, roundValue] of rounds.entries()) {
    const round = objet(roundValue, `blocks.${index}.rounds.${roundIndex}`);
    if (!round.ok) return round.error;
    const erreurChamp = champsConnus(round.value, ["name", "matches"], `blocks.${index}.rounds.${roundIndex}`);
    if (erreurChamp) return erreurChamp;
    if (round.value.name === undefined) return `blocks.${index}.rounds.${roundIndex}.name est requis`;
    const erreurNom = chaine(round.value.name, `blocks.${index}.rounds.${roundIndex}.name`, LIMITES.court, true);
    if (erreurNom) return erreurNom;
    if (!Array.isArray(round.value.matches) || round.value.matches.length > 64) return `blocks.${index}.rounds.${roundIndex}.matches est invalide`;
    for (const [matchIndex, matchValue] of round.value.matches.entries()) {
      const match = objet(matchValue, `blocks.${index}.rounds.${roundIndex}.matches.${matchIndex}`);
      if (!match.ok) return match.error;
      const erreurChampMatch = champsConnus(match.value, ["a", "b"], `blocks.${index}.rounds.${roundIndex}.matches.${matchIndex}`);
      if (erreurChampMatch) return erreurChampMatch;
      for (const slot of ["a", "b"] as const) {
        const slotValue = objet(match.value[slot], `${slot} du match`);
        if (!slotValue.ok) return slotValue.error;
        const erreurSlot = champsConnus(slotValue.value, ["player", "legend", "score", "win"], `${slot} du match`);
        if (erreurSlot) return erreurSlot;
        if (slotValue.value.player === undefined) return `${slot} du match.player est requis`;
        const erreurJoueur = chaine(slotValue.value.player, `${slot} du match.player`, LIMITES.court, true);
        if (erreurJoueur) return erreurJoueur;
        for (const cle of ["legend", "score"] as const) {
          const erreur = chaine(slotValue.value[cle], `${slot} du match.${cle}`, LIMITES.court);
          if (erreur) return erreur;
        }
        const erreurWin = booleen(slotValue.value.win, `${slot} du match.win`);
        if (erreurWin) return erreurWin;
      }
    }
  }
  return null;
}

export function validerArticle(value: unknown, mode: "création" | "mise à jour" = "création"): ResultatValidation<Objet> {
  const article = objet(value, "article");
  if (!article.ok) return article;
  const erreurChamp = champsConnus(article.value, ["title", "excerpt", "coverImage", "category", "tags", "blocks", "published", "featured", "tournamentName", "tournamentDate", "tournamentLocation", "tournamentPlayerCount"], "article");
  if (erreurChamp) return { ok: false, error: erreurChamp };
  if (mode === "mise à jour") {
    for (const cle of ["title", "category"] as const) {
      if (Object.prototype.hasOwnProperty.call(article.value, cle) && article.value[cle] === null) return { ok: false, error: `${cle} doit être une chaîne` };
    }
  }
  for (const [cle, limite, obligatoire] of [["title", LIMITES.titre, true], ["excerpt", LIMITES.texte, false], ["coverImage", LIMITES.url, false], ["category", 50, false], ["tournamentName", LIMITES.court, false], ["tournamentLocation", LIMITES.court, false]] as const) {
    const erreur = chaine(article.value[cle], cle, limite, obligatoire && mode === "création");
    if (erreur) return { ok: false, error: erreur };
  }
  if (article.value.category !== undefined && !["actualite", "guide", "tournoi", "meta", "patch-notes"].includes(String(article.value.category))) return { ok: false, error: "category inconnue" };
  const erreurTags = validerTags(article.value.tags);
  if (erreurTags) return { ok: false, error: erreurTags };
  if (article.value.blocks !== undefined) {
    if (!Array.isArray(article.value.blocks) || article.value.blocks.length > LIMITES.blocs) return { ok: false, error: `blocks accepte au maximum ${LIMITES.blocs} éléments` };
    for (const [i, bloc] of article.value.blocks.entries()) {
      const erreur = validerBloc(bloc, i);
      if (erreur) return { ok: false, error: erreur };
    }
  }
  for (const cle of ["published", "featured"] as const) {
    const erreur = booleen(article.value[cle], cle);
    if (erreur) return { ok: false, error: erreur };
  }
  const erreurDate = dateIso(article.value.tournamentDate, "tournamentDate");
  if (erreurDate) return { ok: false, error: erreurDate };
  if (article.value.tournamentPlayerCount !== undefined && article.value.tournamentPlayerCount !== null) {
    const erreur = entier(article.value.tournamentPlayerCount, "tournamentPlayerCount", 0, 1_000_000);
    if (erreur) return { ok: false, error: erreur };
  }
  return { ok: true, value: article.value };
}

export function validerEvenement(value: unknown, mode: "création" | "mise à jour" = "création"): ResultatValidation<Objet> {
  const evenement = objet(value, "événement");
  if (!evenement.ok) return evenement;
  const erreurChamp = champsConnus(evenement.value, ["title", "description", "date", "endDate", "location", "url", "type", "published"], "événement");
  if (erreurChamp) return { ok: false, error: erreurChamp };
  if (mode === "mise à jour") {
    for (const cle of ["title", "type"] as const) {
      if (Object.prototype.hasOwnProperty.call(evenement.value, cle) && evenement.value[cle] === null) return { ok: false, error: `${cle} doit être une chaîne` };
    }
  }
  const erreurTitre = chaine(evenement.value.title, "title", LIMITES.titre, mode === "création");
  if (erreurTitre) return { ok: false, error: erreurTitre };
  for (const [cle, limite] of [["description", LIMITES.texte], ["location", LIMITES.court], ["url", LIMITES.url], ["type", 50]] as const) {
    const erreur = chaine(evenement.value[cle], cle, limite);
    if (erreur) return { ok: false, error: erreur };
  }
  const erreurDate = dateIso(evenement.value.date, "date", mode === "création");
  if (mode === "mise à jour" && Object.prototype.hasOwnProperty.call(evenement.value, "date") && evenement.value.date === null) return { ok: false, error: "date doit être une date ISO valide" };
  if (erreurDate) return { ok: false, error: erreurDate };
  const erreurFin = dateIso(evenement.value.endDate, "endDate");
  if (erreurFin) return { ok: false, error: erreurFin };
  const erreurPublie = booleen(evenement.value.published, "published");
  return erreurPublie ? { ok: false, error: erreurPublie } : { ok: true, value: evenement.value };
}

function validerCartes(value: unknown): string | null {
  if (value === undefined) return null;
  if (!Array.isArray(value) || value.length > LIMITES.cartes) return `cards accepte au maximum ${LIMITES.cartes} éléments`;
  const sections = new Set(["legend", "champion", "main", "rune", "battlefield", "side"]);
  const vus = new Set<string>();
  for (const [i, carteValue] of value.entries()) {
    const carte = objet(carteValue, `cards.${i}`);
    if (!carte.ok) return carte.error;
    const erreurChamp = champsConnus(carte.value, ["cardId", "quantity", "section"], `cards.${i}`);
    if (erreurChamp) return erreurChamp;
    const erreurId = chaine(carte.value.cardId, `cards.${i}.cardId`, 100, true);
    if (erreurId) return erreurId;
    if (carte.value.quantity !== undefined) {
      const erreur = entier(carte.value.quantity, `cards.${i}.quantity`, 1, 99);
      if (erreur) return erreur;
    }
    const erreurSection = chaine(carte.value.section, `cards.${i}.section`, 30);
    if (erreurSection) return erreurSection;
    if (carte.value.section === null) return `cards.${i}.section doit être une chaîne`;
    const section = String(carte.value.section ?? "main");
    if (!sections.has(section)) return `cards.${i}.section inconnu`;
    const cle = `${carte.value.cardId}:${section}`;
    if (vus.has(cle)) return `cards.${i}.cardId est déjà présent dans la section ${section}`;
    vus.add(cle);
  }
  return null;
}

export function validerDeck(value: unknown, mode: "création" | "mise à jour" = "création"): ResultatValidation<Objet> {
  const deck = objet(value, "deck");
  if (!deck.ok) return deck;
  const erreurChamp = champsConnus(deck.value, ["title", "legendId", "legendName", "description", "guide", "format", "tags", "authorName", "sourceUrl", "featured", "published", "sourceArticleId", "tournamentContext", "playerName", "cards"], "deck");
  if (erreurChamp) return { ok: false, error: erreurChamp };
  if (mode === "mise à jour") {
    for (const cle of ["title", "legendId", "legendName", "format"] as const) {
      if (Object.prototype.hasOwnProperty.call(deck.value, cle) && deck.value[cle] === null) return { ok: false, error: `${cle} doit être une chaîne` };
    }
  }
  for (const [cle, limite, obligatoire] of [["title", LIMITES.titre, true], ["legendId", 100, true], ["legendName", LIMITES.court, true], ["description", LIMITES.texte, false], ["guide", LIMITES.texte, false], ["format", 50, false], ["authorName", LIMITES.court, false], ["sourceUrl", LIMITES.url, false], ["sourceArticleId", 100, false], ["tournamentContext", LIMITES.court, false], ["playerName", LIMITES.court, false]] as const) {
    const erreur = chaine(deck.value[cle], cle, limite, obligatoire && mode === "création");
    if (erreur) return { ok: false, error: erreur };
  }
  const erreurTags = validerTags(deck.value.tags);
  if (erreurTags) return { ok: false, error: erreurTags };
  for (const cle of ["featured", "published"] as const) {
    const erreur = booleen(deck.value[cle], cle);
    if (erreur) return { ok: false, error: erreur };
  }
  const erreurCartes = validerCartes(deck.value.cards);
  return erreurCartes ? { ok: false, error: erreurCartes } : { ok: true, value: deck.value };
}

export function validerImportDeck(value: unknown): ResultatValidation<Objet> {
  const importation = objet(value, "import");
  if (!importation.ok) return importation;
  const erreurChamp = champsConnus(importation.value, ["deckCode", "title", "playerName", "placement", "tournamentName", "tournamentTier", "date", "record", "description"], "import");
  if (erreurChamp) return { ok: false, error: erreurChamp };
  for (const [cle, limite, obligatoire] of [["deckCode", LIMITES.texte, true], ["title", LIMITES.titre, true], ["playerName", LIMITES.court, false], ["placement", 50, false], ["tournamentName", LIMITES.court, false], ["tournamentTier", 20, false], ["record", 50, false], ["description", LIMITES.texte, false]] as const) {
    const erreur = chaine(importation.value[cle], cle, limite, obligatoire);
    if (erreur) return { ok: false, error: erreur };
  }
  if (importation.value.tournamentTier !== undefined && !["P", "S", "A", "B", ""].includes(String(importation.value.tournamentTier))) return { ok: false, error: "tournamentTier inconnu" };
  const erreurDate = dateIso(importation.value.date, "date");
  return erreurDate ? { ok: false, error: erreurDate } : { ok: true, value: importation.value };
}

export function validerTierList(value: unknown, mode: "création" | "mise à jour" = "création"): ResultatValidation<Objet> {
  const tierList = objet(value, "tier list");
  if (!tierList.ok) return tierList;
  const permis = mode === "mise à jour" ? ["id", "title", "description", "format", "setContext", "published", "current", "entries"] : ["title", "description", "format", "setContext"];
  const erreurChamp = champsConnus(tierList.value, permis, "tier list");
  if (erreurChamp) return { ok: false, error: erreurChamp };
  if (mode === "mise à jour") {
    for (const cle of ["title", "format"] as const) {
      if (Object.prototype.hasOwnProperty.call(tierList.value, cle) && tierList.value[cle] === null) return { ok: false, error: `${cle} doit être une chaîne` };
    }
  }
  if (mode === "mise à jour") {
    const erreurId = chaine(tierList.value.id, "id", 100, true);
    if (erreurId) return { ok: false, error: erreurId };
  }
  for (const [cle, limite] of [["title", LIMITES.titre], ["description", LIMITES.texte], ["format", 50], ["setContext", 50]] as const) {
    const erreur = chaine(tierList.value[cle], cle, limite);
    if (erreur) return { ok: false, error: erreur };
  }
  for (const cle of ["published", "current"] as const) {
    const erreur = booleen(tierList.value[cle], cle);
    if (erreur) return { ok: false, error: erreur };
  }
  if (tierList.value.entries !== undefined) {
    if (!Array.isArray(tierList.value.entries) || tierList.value.entries.length > LIMITES.entrees) return { ok: false, error: `entries accepte au maximum ${LIMITES.entrees} éléments` };
    const legendsVues = new Set<string>();
    for (const [i, entryValue] of tierList.value.entries.entries()) {
      const entry = objet(entryValue, `entries.${i}`);
      if (!entry.ok) return entry;
      const erreurChampEntry = champsConnus(entry.value, ["id", "tierListId", "legendId", "legendName", "tier", "position", "comment", "deckId"], `entries.${i}`);
      if (erreurChampEntry) return { ok: false, error: erreurChampEntry };
      for (const [cle, limite, obligatoire] of [["id", 100, false], ["tierListId", 100, false], ["legendId", 100, true], ["legendName", LIMITES.court, true], ["tier", 20, true], ["comment", LIMITES.court, false], ["deckId", 100, false]] as const) {
        const erreur = chaine(entry.value[cle], `entries.${i}.${cle}`, limite, obligatoire);
        if (erreur) return { ok: false, error: erreur };
      }
      if (!["S", "A", "B", "C", "D"].includes(String(entry.value.tier))) return { ok: false, error: `entries.${i}.tier doit être S, A, B, C ou D` };
      if (entry.value.position !== undefined) {
        const erreur = entier(entry.value.position, `entries.${i}.position`, 0, LIMITES.entrees);
        if (erreur) return { ok: false, error: erreur };
      }
      if (legendsVues.has(String(entry.value.legendId))) return { ok: false, error: `entries.${i}.legendId est déjà présent` };
      legendsVues.add(String(entry.value.legendId));
    }
  }
  return { ok: true, value: tierList.value };
}
