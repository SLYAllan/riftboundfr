import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { metaTraduite } from "@/lib/i18n-server";
import { getStateByToken } from "@/lib/overlay-server";
import { cleCompagnonValide } from "@/lib/overlay-compagnon";
import { Compagnon } from "./compagnon";

export const dynamic = "force-dynamic";

// Le lien porte de quoi écrire sur l'habillage : il n'a rien à faire dans un index.
const metadata: Metadata = {
  title: "Compagnon de match",
  robots: { index: false, follow: false },
};

// Le titre de l'onglet suivait la langue de la page partout ailleurs, sauf ici :
// un joueur anglophone ouvrait « Compagnon de match » sur son téléphone.
export const generateMetadata = () => metaTraduite(metadata);

export default async function CompagnonPage({ params }: { params: Promise<{ token: string; cle: string }> }) {
  const { token, cle } = await params;
  // Même réponse pour une clé fausse et un habillage inconnu : rien ne dit à qui
  // essaie des jetons au hasard qu'il est tombé sur un vrai.
  if (!cleCompagnonValide(token, cle)) notFound();
  const state = await getStateByToken(token);
  if (!state) notFound();
  return <Compagnon token={token} cle={cle} initial={state} />;
}
