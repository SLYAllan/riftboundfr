import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getBulkAdminActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exigencesDepuisDeck } from "@/lib/bulking-decks";

/**
 * Crée une recette Bulking depuis un deck officiel, en une seule transaction.
 *
 * La recette garde sourceDeckId, ce qui permet de remonter au deck d'origine.
 * Un nom déjà porté par une autre recette rend 409 (contrainte unique sur name).
 * Le deck ou la langue absents rendent 404.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getBulkAdminActor();
  if (!actor) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }
  const corps = raw as Record<string, unknown>;
  const nom = typeof corps.name === "string" ? corps.name.trim() : "";
  const languageId = typeof corps.languageId === "string" ? corps.languageId : "";
  const includeSideboard = corps.includeSideboard === true;
  if (!nom || nom.length > 160) return NextResponse.json({ error: "Nom de recette invalide" }, { status: 400 });
  if (!languageId) return NextResponse.json({ error: "Langue invalide" }, { status: 400 });

  const { id } = await params;
  const [deck, langue] = await Promise.all([
    prisma.deck.findUnique({ where: { id }, include: { cards: true } }),
    prisma.bulkLanguage.findUnique({ where: { id: languageId }, select: { id: true } }),
  ]);
  if (!deck) return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });
  if (!langue) return NextResponse.json({ error: "Langue introuvable" }, { status: 404 });

  const exigences = exigencesDepuisDeck(
    deck.cards.map((c) => ({ cardId: c.cardId, quantity: c.quantity, section: c.section })),
    languageId,
    includeSideboard,
  );
  if (exigences.length === 0) return NextResponse.json({ error: "Ce deck ne contient aucune carte" }, { status: 400 });

  try {
    const recette = await prisma.$transaction((tx) =>
      tx.bulkProductRecipe.create({
        data: {
          name: nom,
          sourceDeckId: id,
          createdById: actor.adminUserId,
          createdByLabel: actor.adminLabel,
          lines: {
            create: exigences.map((e) => ({
              cardId: e.cardId,
              languageId: e.languageId,
              section: e.section ?? "GENERIC",
              quantity: e.quantity,
            })),
          },
        },
      }),
    );
    return NextResponse.json({ id: recette.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Ce nom est déjà pris" }, { status: 409 });
    }
    return NextResponse.json({ error: "Création impossible" }, { status: 400 });
  }
}
