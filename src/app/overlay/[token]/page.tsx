import { OverlayFull } from "./overlay-full";

export const dynamic = "force-dynamic";

export default async function OverlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ compact?: string }>;
}) {
  const { token } = await params;
  const { compact } = await searchParams;
  // ?compact=1 : version sans habillage, pour qui n'a ni décor ni caméra.
  return <OverlayFull token={token} compact={compact === "1"} />;
}
