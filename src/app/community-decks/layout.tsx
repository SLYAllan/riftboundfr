import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Decks communautaires",
  description: "Découvrez et partagez des decks Riftbound créés par la communauté française.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
