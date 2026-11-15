import { OverlayFull } from "./overlay-full";

export const dynamic = "force-dynamic";

export default async function OverlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ compact?: string; cartes?: string }>;
}) {
  const { token } = await params;
  const { compact, cartes } = await searchParams;
  // ESSAI, à retirer une fois la taille choisie : `?cartes=1.15` pour comparer.
  const taille = Number(cartes);
  // ?compact=1 : version sans habillage, pour qui n'a ni décor ni caméra.
  return <OverlayFull token={token} compact={compact === "1"} tailleCartes={taille >= 1 && taille <= 1.2 ? taille : undefined} />;
}
