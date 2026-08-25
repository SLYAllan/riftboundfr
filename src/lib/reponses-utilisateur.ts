type ObjetJson = Record<string, unknown>;

async function lireObjet(reponse: Response): Promise<ObjetJson | null> {
  const corps: unknown = await reponse.json().catch(() => null);
  return corps && typeof corps === "object" && !Array.isArray(corps) ? corps as ObjetJson : null;
}

export async function lirePublicationDeck(reponse: Response, origine: string): Promise<string> {
  const corps = await lireObjet(reponse);
  if (!reponse.ok) {
    return typeof corps?.error === "string" && corps.error.trim()
      ? corps.error
      : "Publication impossible. Réessayez.";
  }
  return typeof corps?.shareCode === "string" && corps.shareCode
    ? `${origine}/d/${corps.shareCode}`
    : "Réponse du serveur invalide. Réessayez.";
}

export type EtatCollectionCharge =
  | { type: "anonyme" }
  | { type: "connecte"; quantities: Record<string, number> };

export async function lireEtatCollection(reponse: Response): Promise<EtatCollectionCharge> {
  const corps = await lireObjet(reponse);
  if (!reponse.ok || !corps) throw new Error("chargement impossible");
  if (corps.anonymous === true) return { type: "anonyme" };
  if (Object.values(corps).every((quantite) => typeof quantite === "number" && Number.isFinite(quantite))) {
    return { type: "connecte", quantities: corps as Record<string, number> };
  }
  throw new Error("chargement impossible");
}

export interface EtatLike {
  liked: boolean;
  likes: number;
}

export async function lireEtatLike(reponse: Response): Promise<EtatLike> {
  const corps = await lireObjet(reponse);
  if (!reponse.ok) throw new Error("action refusée");
  if (!corps || typeof corps.liked !== "boolean" || typeof corps.likes !== "number" || !Number.isFinite(corps.likes)) {
    throw new Error("réponse invalide");
  }
  return { liked: corps.liked, likes: corps.likes };
}

export interface RapportImport {
  imported: number;
  rows: number;
  unmatched: { variantNumber: string; name: string; raison: string }[];
}

export class ErreurImport extends Error {
  constructor(message: string, readonly rapport?: RapportImport) {
    super(message);
  }
}

function estRapportImport(corps: ObjetJson | null): corps is ObjetJson & RapportImport {
  return !!corps
    && typeof corps.imported === "number"
    && typeof corps.rows === "number"
    && Array.isArray(corps.unmatched)
    && corps.unmatched.every((item) => !!item && typeof item === "object"
      && typeof item.variantNumber === "string" && typeof item.name === "string" && typeof item.raison === "string");
}

export async function executerImportPiltover(
  fichier: { text: () => Promise<string> },
  url: string,
  fetcher: (url: string, init: RequestInit) => Promise<Response>,
): Promise<RapportImport> {
  let texte: string;
  try {
    texte = await fichier.text();
  } catch {
    throw new Error("Fichier illisible.");
  }

  let reponse: Response;
  try {
    reponse = await fetcher(url, { method: "POST", body: texte });
  } catch {
    throw new Error("Connexion impossible. Vérifiez votre réseau puis réessayez.");
  }

  const corps = await lireObjet(reponse);
  if (!reponse.ok) {
    const messages: Record<string, string> = {
      file_too_large: "Le fichier est trop volumineux.",
      too_many_lines: "Le fichier contient trop de lignes.",
      invalid_quantity: "Le fichier contient une quantité invalide.",
      cards_not_found: "Certaines cartes n’ont pas été reconnues.",
      binder_not_found: "Ce classeur n’existe plus.",
    };
    const message = reponse.status === 401
      ? "Connectez-vous avec Discord pour importer votre collection."
      : typeof corps?.error === "string" && messages[corps.error]
        ? messages[corps.error]
        : "Import refusé par le serveur. Réessayez.";
    throw new ErreurImport(message, estRapportImport(corps) ? corps : undefined);
  }
  if (!estRapportImport(corps)) {
    throw new Error("Réponse du serveur invalide. Réessayez.");
  }
  return corps;
}
