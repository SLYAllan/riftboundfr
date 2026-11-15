import { createHash } from "node:crypto";
import { sourcesDecor } from "./overlay-decor";

/**
 * Empreinte du dessin dont sortent les images de `public/stream/`. `npm run gen:decor`
 * l'écrit à côté, un test la recalcule : retoucher une case sans régénérer les images
 * laissait le code et le décor en désaccord, tout au vert.
 *
 * À part de `overlay-decor.ts` : `node:crypto` n'existe pas dans le navigateur, qui
 * importe ce module-là.
 */
export const empreinteDecor = () => createHash("sha256").update(JSON.stringify(sourcesDecor())).digest("hex");
