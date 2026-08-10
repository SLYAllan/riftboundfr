import { redirect } from "next/navigation";
import { getUserFromSession } from "@/lib/session";
import { getOrCreateOverlayState } from "@/lib/overlay-server";
import type { OverlayStateData } from "@/lib/overlay";
import { OverlayDashboard } from "./overlay-dashboard";

export const dynamic = "force-dynamic";

export default async function OverlayDashboardPage() {
  const user = await getUserFromSession();
  if (!user) redirect("/profil");
  const row = await getOrCreateOverlayState(user.id);
  return <OverlayDashboard token={row.token} initial={row.state as unknown as OverlayStateData} />;
}
