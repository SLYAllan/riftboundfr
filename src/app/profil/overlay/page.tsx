import { redirect } from "next/navigation";
import { getUserFromSession } from "@/lib/session";
import { getOrCreateOverlayState } from "@/lib/overlay-server";
import { cleCompagnon } from "@/lib/overlay-compagnon";
import type { OverlayStateData } from "@/lib/overlay";
import { OverlayDashboard } from "./overlay-dashboard";
import type { Metadata } from "next";
import { langueCourante, metaTraduite } from "@/lib/i18n-server";
import { prefixerLien } from "@/lib/i18n";

export const dynamic = "force-dynamic";

// Sans titre propre, l'onglet reprenait celui du site entier (WCAG 2.4.2).
const metadata: Metadata = { title: "Overlay de stream" };
export const generateMetadata = () => metaTraduite(metadata);

export default async function OverlayDashboardPage() {
  const user = await getUserFromSession();
  // L'OAuth conserve cette destination locale dans un cookie HTTP-only lié à
  // son state : l'utilisateur revient ici sans ouvrir de redirection externe.
  if (!user) {
    const retour = prefixerLien("/profil/overlay", await langueCourante());
    redirect(`/api/auth/discord?retour=${encodeURIComponent(retour)}`);
  }
  const row = await getOrCreateOverlayState(user.id);
  return <OverlayDashboard token={row.token} cleCompagnon={cleCompagnon(row.token)} initial={row.state as unknown as OverlayStateData} />;
}
