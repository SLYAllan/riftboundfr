import { redirect } from "next/navigation";
import { getUserFromSession } from "@/lib/session";
import { getOrCreateOverlayState } from "@/lib/overlay-server";
import type { OverlayStateData } from "@/lib/overlay";
import { OverlayDashboard } from "./overlay-dashboard";
import { langueCourante } from "@/lib/i18n-server";
import { prefixerLien } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function OverlayDashboardPage() {
  const user = await getUserFromSession();
  // L'OAuth conserve cette destination locale dans un cookie HTTP-only lié à
  // son state : l'utilisateur revient ici sans ouvrir de redirection externe.
  if (!user) {
    const retour = prefixerLien("/profil/overlay", await langueCourante());
    redirect(`/api/auth/discord?retour=${encodeURIComponent(retour)}`);
  }
  const row = await getOrCreateOverlayState(user.id);
  return <OverlayDashboard token={row.token} initial={row.state as unknown as OverlayStateData} />;
}
