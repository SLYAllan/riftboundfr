import "server-only";
import { decodeDeck } from "./deck-codec";
import { deckIdentifiers, resolveDeckCards } from "./deck-cards";
import { findCard } from "./card-printing";
import { erreursDeck, type DeckCardInfo } from "@/app/deckbuilder/lib/deck-rules";

/**
 * Vérifie côté SERVEUR qu'un code de deck publié est bien un deck jouable.
 *
 * Trois règles différentes décidaient qu'un deck était valide : celle du
 * deckbuilder (complète), celle de la route de publication (trois compteurs
 * DÉCLARÉS par le navigateur, ignorés s'ils manquaient) et celle de la
 * modification (n'importe quelle chaîne non vide). Un appel direct à l'API
 * publiait donc un deck que /d, l'image et le panier ne savent pas relire.
 *
 * Ici on décode le code, on résout les cartes en base par le passage unique, et
 * on rejoue la règle du deckbuilder. Les avertissements passent (41 cartes reste
 * publiable) ; les erreurs, non.
 */
export interface DeckVerifie {
  legendId: string;
  legendName: string;
  domains: string[];
}

export type VerificationDeck = { ok: true; deck: DeckVerifie } | { ok: false; erreur: string };

export async function verifierCodeDeck(deckCode: string): Promise<VerificationDeck> {
  const decode = decodeDeck(deckCode);
  if (!decode) return { ok: false, erreur: "Ce code de deck est illisible." };

  const { map, missing } = await resolveDeckCards(deckIdentifiers(decode));
  // Jamais en silence : une carte introuvable rend le deck impossible à afficher.
  if (missing.length > 0) {
    const apercu = missing.slice(0, 5).join(", ");
    const reste = missing.length > 5 ? ` (et ${missing.length - 5} autres)` : "";
    return { ok: false, erreur: `Cartes inconnues : ${apercu}${reste}` };
  }

  const legende = decode.legend ? findCard(map, decode.legend.cardId) : undefined;
  if (!legende || legende.type !== "Legend") {
    return { ok: false, erreur: "Une Légende est requise" };
  }

  const infos = (entrees: { cardId: string; quantity: number }[]): DeckCardInfo[] =>
    entrees.flatMap((e) => {
      const carte = findCard(map, e.cardId);
      return carte
        ? [{ cardId: carte.id, name: carte.name, type: carte.type, supertype: carte.supertype, domains: carte.domains, quantity: e.quantity }]
        : [];
    });

  // Le code texte sort le Champion du deck principal pour l'écrire à part : il
  // faut l'y remettre, sinon on compte 39 cartes et on ne trouve pas le Champion.
  const principales = decode.champion ? [...decode.main, decode.champion] : decode.main;
  const cartesPrincipales = infos(principales);
  const cartesRunes = infos(decode.rune);
  const cartesReserve = infos(decode.side);
  const total = (cartes: DeckCardInfo[]) => cartes.reduce((s, c) => s + c.quantity, 0);

  const problemes = erreursDeck(
    {
      legend: true,
      legendFirstName: legende.name.split(",")[0] ?? null,
      mainTotal: total(cartesPrincipales),
      runeTotal: total(cartesRunes),
      battlefieldTotal: total(infos(decode.battlefield)),
      sideTotal: total(cartesReserve),
    },
    cartesPrincipales,
    cartesRunes,
    cartesReserve,
    legende.domains,
  );

  if (problemes.length > 0) return { ok: false, erreur: problemes[0].message };

  return { ok: true, deck: { legendId: legende.id, legendName: legende.name, domains: legende.domains } };
}
