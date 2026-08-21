import { creerFileEnvoi } from "./overlay-envoi";
import type { EtatEnvoi } from "./overlay-envoi";

export type { EtatEnvoi };

export interface MajCollection {
  cardId: string;
  quantity: number;
}

// Les quantités d'une file : la clé est le cardId, la valeur la dernière
// quantité absolue voulue. Plusieurs cartes peuvent attendre côte à côte.
export type CartesEnAttente = Record<string, number>;

/**
 * File d'écriture de la collection.
 *
 * Même garantie que la file de l'habillage — un seul POST en vol, le dernier
 * état voulu gagne — mais indexée par carte : deux changements sur la même
 * carte ne s'additionnent jamais, la dernière quantité absolue écrase la
 * précédente ; deux cartes distinctes attendent côte à côte sans qu'aucune
 * ne disparaisse. Un refus garde la quantité en attente jusqu'à `renvoyer()`.
 */
export function creerFileCollection(
  envoyer: (cartes: CartesEnAttente) => Promise<void>,
  surEtat: (etat: EtatEnvoi) => void = () => {},
) {
  const file = creerFileEnvoi<CartesEnAttente>(envoyer, {
    combiner: (attente, nouveau) => ({ ...attente, ...nouveau }),
    surEtat,
  });

  return {
    ajouter({ cardId, quantity }: MajCollection) {
      file.ajouter({ [cardId]: quantity });
    },
    renvoyer() {
      file.renvoyer();
    },
    quandCalme: () => file.quandCalme(),
    quandVide: () => file.quandVide(),
  };
}
