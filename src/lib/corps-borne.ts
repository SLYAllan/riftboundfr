/** Refuse dès que le flux dépasse la borne, même sans longueur annoncée. */
export async function lireCorpsBorne(reponse: Pick<Response, "body" | "headers">, maximum: number): Promise<Uint8Array<ArrayBuffer>> {
  if (Number(reponse.headers.get("content-length")) > maximum) throw new Error("Taille maximale dépassée");
  if (!reponse.body) return new Uint8Array();
  const lecteur = reponse.body.getReader();
  const morceaux: Uint8Array[] = [];
  let taille = 0;
  try {
    for (;;) {
      const { done, value } = await lecteur.read();
      if (done) break;
      taille += value.byteLength;
      if (taille > maximum) {
        await lecteur.cancel();
        throw new Error("Taille maximale dépassée");
      }
      morceaux.push(value);
    }
  } finally {
    lecteur.releaseLock();
  }
  const resultat = new Uint8Array(taille);
  let position = 0;
  for (const morceau of morceaux) {
    resultat.set(morceau, position);
    position += morceau.byteLength;
  }
  return resultat;
}
