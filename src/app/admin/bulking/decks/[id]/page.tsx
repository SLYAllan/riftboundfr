import { notFound } from "next/navigation";
import Link from "@/components/lien";
import { verifyAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeckRecipeActions } from "./deck-recipe-actions";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Analyse Bulking d'un deck officiel avant d'en faire une recette.
 *
 * La page ne fait que vérifier l'accès et afficher l'en-tête du deck ; toute la
 * partie interactive (langue, réserve, analyse, création) vit dans le composant
 * client voisin, qui appelle les routes d'analyse et de création.
 */
export default async function DeckBulkingPage({ params }: Props) {
  await verifyAdmin();
  const { id } = await params;
  const deck = await prisma.deck.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true, legendName: true },
  });
  if (!deck) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/decks" className="text-sm text-arcane hover:underline">
          ← Retour aux decks
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-ink">{deck.title}</h1>
        <p className="mt-1 text-sm text-ink-secondary">{deck.legendName}</p>
      </div>
      <DeckRecipeActions deckId={deck.id} deckName={deck.title} />
    </div>
  );
}
