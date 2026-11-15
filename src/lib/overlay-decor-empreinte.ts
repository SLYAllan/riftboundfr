import { createHash } from "node:crypto";
import { placementCartes, sourcesDecor } from "./overlay-decor";

/**
 * Empreinte du dessin dont sortent les images de `public/stream/`. `npm run gen:decor`
 * l'écrit à côté, un test la recalcule : retoucher une case sans régénérer les images
 * laissait le code et le décor en désaccord, tout au vert.
 *
 * La place des cadres de cartes en fait partie : les gabarits Photoshop la montrent en
 * repère. Le 15 novembre 2026, agrandir les cartes de 15 % a laissé ces repères à
 * l'ancienne place sans qu'aucun test ne bouge.
 *
 * À part de `overlay-decor.ts` : `node:crypto` n'existe pas dans le navigateur, qui
 * importe ce module-là.
 */
export const empreinteDecor = () =>
  createHash("sha256")
    .update(JSON.stringify({ ...sourcesDecor(), cartes: [placementCartes("left"), placementCartes("right"), placementCartes("left", true), placementCartes("right", true)] }))
    .digest("hex");
