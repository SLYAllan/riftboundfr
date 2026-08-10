// next/og rend d'abord un SVG (satori) puis le convertit en PNG avec sharp.
// Or l'optimiseur d'images de Next appelle `sharp.block({ operation:
// ['VipsForeignLoad'] })` puis ne réautorise que heif/jpeg/gif/png/tiff/webp
// (voir node_modules/next/dist/server/image-optimizer.js). sharp est un
// singleton dans le processus : dès qu'une image passe par /_next/image, le
// lecteur SVG est coupé pour tout le monde et next/og échoue avec
// « Input buffer contains unsupported image format ». Toutes les images OG et
// les visuels de deck tombaient en 500 (502 derrière le proxy en prod).
//
// On réautorise donc le lecteur SVG juste avant chaque rendu. Portée : sharp ne
// lit ici que le SVG produit par satori et les covers d'articles servies par le
// site. L'optimiseur, lui, refuse déjà le SVG sur le type MIME avant d'arriver
// au décodage (`dangerouslyAllowSVG` n'est pas activé).
export async function allowSvgInSharp(): Promise<void> {
  try {
    const sharp = (await import("sharp")).default;
    sharp.unblock({ operation: ["VipsForeignLoadSvg"] });
  } catch {
    // sharp absent : next/og retombe sur resvg, qui n'a pas le problème.
  }
}
