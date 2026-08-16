import { NextRequest, NextResponse } from "next/server";
import { lireFiltresDecks, listerDecks } from "@/lib/deck-listing";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    return NextResponse.json(await listerDecks(lireFiltresDecks(params)));
  } catch (error) {
    console.error("GET /api/decks", error);
    return NextResponse.json({ error: "Impossible de charger les decks." }, { status: 500 });
  }
}
