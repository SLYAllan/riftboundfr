// Ce que la page fait de la réponse de /api/cardnexus/panier, appelée en fetch
// par le bouton « Acheter ». Vit à part de `cardnexus.ts`, qui lit le disque et
// ne peut pas partir dans le navigateur.

export type IssuePanier = { url: string } | { erreur: string };

// La page envoie un onglet là où le serveur le dit : seul le lien affilié passe.
// Un autre hôte serait un lien non tracké, donc une vente perdue en silence.
const LIEN_AFFILIE = /^https:\/\/af\.cardnexus\.link\//;

export function lireReponsePanier(statut: number, corps: unknown): IssuePanier {
  const objet = corps && typeof corps === "object" ? (corps as Record<string, unknown>) : null;
  if (statut >= 200 && statut < 300 && typeof objet?.url === "string" && LIEN_AFFILIE.test(objet.url)) {
    return { url: objet.url };
  }
  // Les refus de la route (deck introuvable, carte hors catalogue, 429) portent
  // déjà leur message. Un 502 du proxy, lui, n'est pas du JSON.
  if (typeof objet?.error === "string") return { erreur: objet.error };
  if (statut >= 500) return { erreur: "Le site ne répond pas pour le moment. Réessayez dans un instant." };
  return { erreur: `Réponse inattendue du serveur (${statut}).` };
}
