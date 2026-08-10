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
  // Le lien de connexion doit rester dans la langue courante, sinon un
  // streamer anglophone atterrit sur la page francaise.
  if (!user) redirect(prefixerLien("/profil", await langueCourante()));
  const row = await getOrCreateOverlayState(user.id);
  return <OverlayDashboard token={row.token} initial={row.state as unknown as OverlayStateData} />;
}
