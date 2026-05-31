import Link from "next/link";
import { BookOpen, Layers, BookText, Shield, Monitor, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Guides", description: "Guides pour débuter et progresser au TCG Riftbound. En français." };

const guides = [
  { href: "/guides/debuter", icon: BookOpen, title: "Guide du débutant", description: "Règles complètes : composition de deck, phases de tour, ressources, conditions de victoire et mots-clés." },
  { href: "/guides/deckbuilding", icon: Layers, title: "Guide de deckbuilding", description: "Construisez un deck compétitif : courbe d'énergie, ratio de cartes, synergies de domaines, mulligan." },
  { href: "/guides/domaines", icon: Shield, title: "Les 6 Domaines", description: "Fury, Calm, Mind, Body, Chaos, Order : philosophies, forces et légendes associées à chaque domaine." },
  { href: "/guides/meta", icon: TrendingUp, title: "Méta & Tier List", description: "Le méta compétitif set par set, les meilleures légendes et les archétypes. Basé sur 88 tournois analysés." },
  { href: "/guides/glossaire", icon: BookText, title: "Glossaire", description: "Tous les termes du jeu expliqués en français : mots-clés, mécaniques, jargon TCG." },
  { href: "/guides/jouer-en-ligne", icon: Monitor, title: "Jouer en ligne", description: "Comment jouer à Riftbound gratuitement en ligne avec TCG Arena et RiftAtlas. Guide pas-à-pas." },
];

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Guides</h1>
      <p className="mt-2 text-ink-secondary">Tout ce qu&apos;il faut pour débuter et progresser au TCG Riftbound.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {guides.map((guide) => (
          <Link key={guide.href} href={guide.href} className="card-hover rounded-feature border border-hairline bg-surface p-6">
            <guide.icon className="text-arcane" size={32} />
            <h2 className="mt-4 text-xl font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{guide.title}</h2>
            <p className="mt-2 text-sm text-ink-secondary">{guide.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
