/** Le corpus entier, sans charger toutes ses cartes d'un coup. */
export async function parcourirLots<T>(charger: (offset: number, taille: number) => Promise<T[]>, traiter: (lot: T[]) => void, taille = 300): Promise<void> {
  for (let offset = 0; ; offset += taille) {
    const lot = await charger(offset, taille);
    traiter(lot);
    if (lot.length < taille) return;
  }
}
