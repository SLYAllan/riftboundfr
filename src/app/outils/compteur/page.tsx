import { PointTracker } from "@/components/point-tracker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compteur de points",
  description: "Compteur de points interactif pour vos parties de Riftbound. Suivez les scores de 2 à 4 joueurs.",
};

export default function CompteurPage() {
  return <PointTracker />;
}
