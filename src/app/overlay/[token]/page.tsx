import { versionOverlay } from "@/lib/overlay-version";
import { OverlayFull } from "./overlay-full";
import { OverlayV1 } from "./overlay-v1";

export const dynamic = "force-dynamic";

export default async function OverlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ compact?: string; version?: string }>;
}) {
  const { token } = await params;
  const { compact, version } = await searchParams;
  // Deux versions jusqu'à la bascule du 1er décembre 2026 : le lien déjà collé dans OBS
  // garde l'ancienne, `?version=2` montre la nouvelle. Voir `overlay-version.ts`.
  const Overlay = versionOverlay(version) === 2 ? OverlayFull : OverlayV1;
  // ?compact=1 : version sans habillage, pour qui n'a ni décor ni caméra.
  return <Overlay token={token} compact={compact === "1"} />;
}
