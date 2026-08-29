import { Prisma, type BulkCardCondition, type BulkCardFinish, type BulkCostAllocationMethod } from "@prisma/client";
import { calculerCoutUniforme } from "./bulking-stock";

export type LigneEntreeBulk = {
  cardId: string;
  quantity: number;
  condition: BulkCardCondition;
  finish: BulkCardFinish;
  storageLocationId: string;
  acquisitionUnitCost: string | null;
};

export function fusionnerLignesEntree(lines: LigneEntreeBulk[]) {
  const fusionnees = new Map<string, LigneEntreeBulk>();
  for (const line of lines) {
    const key = [line.cardId, line.condition, line.finish, line.storageLocationId].join("|");
    const precedente = fusionnees.get(key);
    if (precedente) precedente.quantity += line.quantity;
    else fusionnees.set(key, { ...line });
  }
  return [...fusionnees.values()];
}

export function coutsPourComptabilisation(
  method: BulkCostAllocationMethod,
  totalPrice: Prisma.Decimal.Value,
  lines: LigneEntreeBulk[],
) {
  if (method === "UNIFORM") {
    const cout = calculerCoutUniforme(totalPrice, lines.reduce((total, line) => total + line.quantity, 0));
    return lines.map(() => cout);
  }

  const couts = lines.map((line) => {
    if (line.acquisitionUnitCost === null) throw new Error("Le coût unitaire manque sur une ligne");
    return new Prisma.Decimal(line.acquisitionUnitCost);
  });
  const somme = couts.reduce((total, cout, index) => total.add(cout.mul(lines[index].quantity)), new Prisma.Decimal(0));
  if (!somme.toDecimalPlaces(2).equals(new Prisma.Decimal(totalPrice).toDecimalPlaces(2))) throw new Error("Le total des lignes ne correspond pas au prix du lot");
  return couts;
}
