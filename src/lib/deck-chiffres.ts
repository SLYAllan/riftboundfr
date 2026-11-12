/**
 * Coût moyen en énergie d'un lot de cartes, pondéré par les exemplaires. Une carte
 * sans coût (rune, champ de bataille) ne compte pas ; sans aucune carte chiffrée,
 * on rend `null` plutôt que 0, qui se lirait comme « un deck gratuit ».
 */
export function energieMoyenne(cartes: { energy?: number | null; quantity: number }[]): number | null {
  let exemplaires = 0;
  let somme = 0;
  for (const c of cartes) {
    if (c.energy == null) continue;
    exemplaires += c.quantity;
    somme += c.energy * c.quantity;
  }
  return exemplaires > 0 ? somme / exemplaires : null;
}
