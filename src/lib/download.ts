/**
 * Télécharge un blob côté navigateur.
 *
 * Deux pièges que l'ancien code maison ratait, et qui donnaient un
 * téléchargement vide (ou aucun fichier) :
 * - le lien doit être dans le DOM (Firefox ignore un <a> détaché) ;
 * - l'URL blob ne doit pas être révoquée avant que le téléchargement démarre.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 10_000);
}
