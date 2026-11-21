export { default, alt, size, contentType } from "./opengraph-image";

// Next ne lit pas ce réglage à travers un réexport : il se redit ici. Sans lui, l'image
// pour X était dessinée au build, quand la base n'est pas joignable dans Docker.
export const dynamic = "force-dynamic";
