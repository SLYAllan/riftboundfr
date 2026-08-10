import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import { decodeDeck } from "@/lib/deck-codec";
import { displayLegendName } from "@/lib/utils";
import { allowSvgInSharp } from "@/lib/og-sharp";

export const runtime = "nodejs";

const DOMAIN_COLORS: Record<string, string> = {
  Fury: "#ef4444",
  Calm: "#22c55e",
  Mind: "#3b82f6",
  Body: "#f97316",
  Chaos: "#8b5cf6",
  Order: "#eab308",
  Sorcery: "#ec4899",
};

const DOMAIN_LABELS_FR: Record<string, string> = {
  Fury: "Furie",
  Calm: "Calme",
  Mind: "Esprit",
  Body: "Corps",
  Chaos: "Chaos",
  Order: "Ordre",
  Sorcery: "Sorcellerie",
};

interface CardInfo {
  name: string;
  imageUrl: string | null;
  quantity: number;
  energy: number | null;
  type: string;
  domains: string[];
  section: string;
}

// 1:1 square - the safest format for Twitter/X (no cropping in the timeline)
// Rendu en 2000 px : à 1000 le texte des cartes devenait illisible une fois
// l'image recompressée par X. Toutes les dimensions ci-dessous suivent.
//
// `story` est le 9:16 des formats verticaux (story, reel, short). Même densité
// de pixels que le carré à largeur égale, donc même lisibilité après
// recompression. La mise en page est identique : seul le cadre change, et
// `pickSizes` retrouve tout seul la taille de carte qui rentre.
const FORMATS = {
  square: { w: 2000, h: 2000 },
  // 1620 et pas 1350 : le cadre vertical est étroit, donc le nombre de colonnes est
  // dicté par la largeur. À 1350 le solveur tombait à 132 px de large par carte sur un
  // gros deck, illisible. À 1620 il tient 184 px pour le même deck, soit 39 % de plus,
  // sans changer le rapport 9:16.
  story: { w: 1620, h: 2880 },
} as const;
type FormatKey = keyof typeof FORMATS;

const CARD_GAP = 12;
// Écart entre les deux groupes quand Runes et Champs de bataille partagent une bande.
const BAND_SPACING = 56;

// Choisit la PLUS GRANDE taille de carte qui laisse tout le deck (deck principal +
// runes + champs de bataille + réserve) tenir dans le cadre.
//
// Deux ou trois runes et trois champs de bataille occupaient chacun une bande pleine
// largeur : sur onze colonnes, huit restaient vides et la moitié de la hauteur partait
// en fond perdu, ce qui rabaissait toutes les cartes. Quand les deux groupes tiennent
// côte à côte, ils partagent une bande, et la place récupérée revient aux cartes.
function pickSizes(mainN: number, runeN: number, bfN: number, sideN: number, width: number, height: number) {
  const BODY_W = width - 128; // 64px de marge de chaque côté
  const HEADER = 356; // bloc Légende du haut
  const FOOTER = 128;
  const SECT = 68; // titre de section + espacement
  const BAND_GAP = 24; // marginTop entre deux sections
  // Pas de 4 px : le palier grossier laissait jusqu'à 200 px inutilisés en bas.
  for (let pw = 320; pw >= 104; pw -= 4) {
    const ph = Math.round(pw * 1.4);
    const lw = Math.round(pw * 1.7);
    const lh = Math.round(pw * 1.2);
    const cols = Math.floor((BODY_W + CARD_GAP) / (pw + CARD_GAP));
    if (cols < 1) continue;
    const bfCols = Math.max(1, Math.floor((BODY_W + CARD_GAP) / (lw + CARD_GAP)));
    const rowH = ph + CARD_GAP;
    const runeW = runeN ? runeN * (pw + CARD_GAP) - CARD_GAP : 0;
    const bfW = bfN ? bfN * (lw + CARD_GAP) - CARD_GAP : 0;
    const paired = runeN > 0 && bfN > 0 && runeW + BAND_SPACING + bfW <= BODY_W;

    let h = HEADER + FOOTER;
    h += SECT + Math.ceil(mainN / cols) * rowH;
    if (paired) {
      h += BAND_GAP + SECT + Math.max(rowH, lh + CARD_GAP);
    } else {
      if (runeN) h += BAND_GAP + SECT + Math.ceil(runeN / cols) * rowH;
      if (bfN) h += BAND_GAP + SECT + Math.ceil(bfN / bfCols) * (lh + CARD_GAP);
    }
    if (sideN) h += BAND_GAP + SECT + Math.ceil(sideN / cols) * rowH;
    if (h <= height) return { pw, ph, lw, lh, paired };
  }
  return { pw: 104, ph: 146, lw: 177, lh: 125, paired: false };
}

function CardSlot({ card, w, h }: { card: CardInfo; w: number; h: number }) {
  // Use card image URL directly - satori fetches server-side, no CORS issues
  const imgSrc = card.imageUrl || null;

  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: w,
        height: h,
        borderRadius: 12,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          width={w}
          height={h}
          style={{
            objectFit: "cover",
            borderRadius: 12,
          }}
        />
      ) : (
        <div
          style={{
            display: "flex",
            width: w,
            height: h,
            backgroundColor: "#1e1b2e",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            border: "2px solid #2a2740",
          }}
        >
          <span
            style={{
              color: "#6b6580",
              fontSize: 20,
              textAlign: "center",
              padding: 8,
            }}
          >
            {card.name}
          </span>
        </div>
      )}
      {card.quantity > 1 && (
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(8, 8, 14, 0.85)",
            borderRadius: 8,
            padding: "2px 12px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            x{card.quantity}
          </span>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginBottom: 16,
        marginTop: 8,
      }}
    >
      <span
        style={{
          color: "#d4a843",
          fontSize: 28,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        {label}
      </span>
      <span style={{ color: "#6b6580", fontSize: 26 }}>({count})</span>
      <div
        style={{
          display: "flex",
          flex: 1,
          height: 2,
          backgroundColor: "#2a2740",
        }}
      />
    </div>
  );
}

function CardRow({ cards, w, h }: { cards: CardInfo[]; w: number; h: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: CARD_GAP,
      }}
    >
      {cards.map((card, i) => (
        <CardSlot key={`${card.name}-${i}`} card={card} w={w} h={h} />
      ))}
    </div>
  );
}

async function fetchDeckFromSlug(slug: string) {
  const deck = await prisma.deck.findUnique({
    where: { slug },
    include: {
      cards: {
        include: { card: true },
        orderBy: [{ section: "asc" }, { card: { energy: "asc" } }, { card: { name: "asc" } }],
      },
    },
  });

  if (!deck || !deck.published) return null;

  // Resolve legend card if not in deck cards
  const hasLegendSection = deck.cards.some(
    (dc) => dc.section === "legend" && dc.card.type === "Legend",
  );

  let legendCard: typeof deck.cards[0]["card"] | null = null;
  if (!hasLegendSection) {
    const dashName = deck.legendName.replace(", ", " - ");
    const prefix = deck.legendName.split(",")[0].split(" - ")[0].trim();
    legendCard = await prisma.card.findFirst({
      where: {
        OR: [
          { riftboundId: deck.legendId },
          { type: "Legend", name: { equals: deck.legendName, mode: "insensitive" } },
          { type: "Legend", name: { equals: dashName, mode: "insensitive" } },
        ],
      },
    });
    if (!legendCard) {
      legendCard = await prisma.card.findFirst({
        where: {
          type: "Legend",
          name: { startsWith: prefix, mode: "insensitive" },
          NOT: { name: { contains: "Overnumbered" } },
        },
      });
    }
  }

  const cards: CardInfo[] = [];

  // Add resolved legend if needed
  if (legendCard && !deck.cards.some((dc) => dc.card.id === legendCard!.id)) {
    cards.push({
      name: legendCard.name,
      imageUrl: legendCard.imageUrl,
      quantity: 1,
      energy: legendCard.energy,
      type: legendCard.type,
      domains: legendCard.domains,
      section: "legend",
    });
  }

  for (const dc of deck.cards) {
    cards.push({
      name: dc.card.name,
      imageUrl: dc.card.imageUrl,
      quantity: dc.quantity,
      energy: dc.card.energy,
      type: dc.card.type,
      domains: dc.card.domains,
      section: dc.section,
    });
  }

  return {
    title: deck.title,
    legendName: deck.legendName,
    playerName: deck.playerName ?? deck.authorName ?? null,
    tournamentContext: deck.tournamentContext ?? null,
    placement: deck.placement ?? null,
    record: deck.record ?? null,
    cards,
    domains: getLegendDomains(cards),
  };
}

async function fetchDeckFromCode(deckCode: string) {
  const decoded = decodeDeck(deckCode);
  if (!decoded) return null;

  const allIdentifiers: string[] = [];
  if (decoded.legend) allIdentifiers.push(decoded.legend.cardId);
  if (decoded.champion) allIdentifiers.push(decoded.champion.cardId);
  for (const e of [
    ...decoded.main,
    ...decoded.rune,
    ...decoded.battlefield,
    ...decoded.side,
  ]) {
    allIdentifiers.push(e.cardId);
  }

  const isNameFormat = allIdentifiers.some(
    (id) => id.includes(" ") || id.includes(","),
  );

  const dbCards = await prisma.card.findMany({
    where: isNameFormat
      ? { name: { in: allIdentifiers, mode: "insensitive" }, alternateArt: false }
      : { riftboundId: { in: allIdentifiers } },
  });

  const cardMap = new Map<string, (typeof dbCards)[number]>();
  for (const c of dbCards) {
    cardMap.set(c.riftboundId, c);
    cardMap.set(c.name, c);
    cardMap.set(c.name.toLowerCase(), c);
  }

  function resolve(
    entries: { cardId: string; quantity: number }[],
    section: string,
  ): CardInfo[] {
    return entries
      .map((e) => {
        const card =
          cardMap.get(e.cardId) ?? cardMap.get(e.cardId.toLowerCase());
        if (!card) return null;
        return {
          name: card.name,
          imageUrl: card.imageUrl,
          quantity: e.quantity,
          energy: card.energy,
          type: card.type,
          domains: card.domains,
          section,
        };
      })
      .filter(Boolean) as CardInfo[];
  }

  const cards: CardInfo[] = [
    ...resolve(decoded.legend ? [decoded.legend] : [], "legend"),
    ...resolve(decoded.champion ? [decoded.champion] : [], "legend"),
    ...resolve(decoded.main, "main"),
    ...resolve(decoded.rune, "rune"),
    ...resolve(decoded.battlefield, "battlefield"),
    ...resolve(decoded.side, "side"),
  ];

  const legendCard = cards.find(
    (c) => c.section === "legend" && c.type === "Legend",
  );

  return {
    title: legendCard
      ? displayLegendName(legendCard.name)
      : "Deck Riftbound",
    legendName: legendCard?.name ?? "Deck",
    playerName: null,
    tournamentContext: null,
    placement: null,
    record: null,
    cards,
    domains: getLegendDomains(cards),
  };
}

async function fetchDeckFromShareCode(shareCode: string) {
  const deck = await prisma.communityDeck.findUnique({
    where: { shareCode },
    select: {
      title: true,
      legendName: true,
      authorName: true,
      domains: true,
      deckCode: true,
    },
  });

  if (!deck) return null;

  const decoded = decodeDeck(deck.deckCode);
  if (!decoded) return null;

  const allIdentifiers: string[] = [];
  if (decoded.legend) allIdentifiers.push(decoded.legend.cardId);
  if (decoded.champion) allIdentifiers.push(decoded.champion.cardId);
  for (const e of [
    ...decoded.main,
    ...decoded.rune,
    ...decoded.battlefield,
    ...decoded.side,
  ]) {
    allIdentifiers.push(e.cardId);
  }

  const isNameFormat = allIdentifiers.some(
    (id) => id.includes(" ") || id.includes(","),
  );

  const dbCards = await prisma.card.findMany({
    where: isNameFormat
      ? { name: { in: allIdentifiers, mode: "insensitive" }, alternateArt: false }
      : { riftboundId: { in: allIdentifiers } },
  });

  const cardMap = new Map<string, (typeof dbCards)[number]>();
  for (const c of dbCards) {
    cardMap.set(c.riftboundId, c);
    cardMap.set(c.name, c);
    cardMap.set(c.name.toLowerCase(), c);
  }

  function resolve(
    entries: { cardId: string; quantity: number }[],
    section: string,
  ): CardInfo[] {
    return entries
      .map((e) => {
        const card =
          cardMap.get(e.cardId) ?? cardMap.get(e.cardId.toLowerCase());
        if (!card) return null;
        return {
          name: card.name,
          imageUrl: card.imageUrl,
          quantity: e.quantity,
          energy: card.energy,
          type: card.type,
          domains: card.domains,
          section,
        };
      })
      .filter(Boolean) as CardInfo[];
  }

  const cards: CardInfo[] = [
    ...resolve(decoded.legend ? [decoded.legend] : [], "legend"),
    ...resolve(decoded.champion ? [decoded.champion] : [], "legend"),
    ...resolve(decoded.main, "main"),
    ...resolve(decoded.rune, "rune"),
    ...resolve(decoded.battlefield, "battlefield"),
    ...resolve(decoded.side, "side"),
  ];

  return {
    title: deck.title,
    legendName: deck.legendName,
    playerName: deck.authorName,
    tournamentContext: null,
    placement: null,
    record: null,
    cards,
    domains: deck.domains.length > 0 ? deck.domains : getLegendDomains(cards),
  };
}

function getLegendDomains(cards: CardInfo[]): string[] {
  const legend = cards.find(
    (c) => c.section === "legend" && c.type === "Legend",
  );
  return legend?.domains ?? [];
}

export async function GET(req: NextRequest) {
  await allowSvgInSharp();
  const { searchParams } = req.nextUrl;
  // Branded export background - read from disk and inline as a data URI.
  // Fetching it via req.nextUrl.origin fails in prod: behind Coolify's reverse
  // proxy the origin is the internal container host (https://<id>:3000) which
  // satori cannot reach ("Can't load image ... fetch failed").
  let bgUrl: string | null = null;
  try {
    const bgBuf = await readFile(
      join(process.cwd(), "public", "img", "fond-export.png"),
    );
    bgUrl = `data:image/png;base64,${bgBuf.toString("base64")}`;
  } catch {
    bgUrl = null;
  }
  const slug = searchParams.get("slug");
  const code = searchParams.get("code");
  const shareCode = searchParams.get("share");
  // ?format=story pour le 9:16, carré par défaut : tout ce qui existait continue
  // de rendre exactement la même image.
  const formatKey: FormatKey = searchParams.get("format") === "story" ? "story" : "square";
  const WIDTH = FORMATS[formatKey].w;
  const HEIGHT = FORMATS[formatKey].h;

  if (!slug && !code && !shareCode) {
    return new Response(
      JSON.stringify({ error: "Provide ?slug=, ?code=, or ?share= parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  let deckData;
  try {
    if (slug) {
      deckData = await fetchDeckFromSlug(slug);
    } else if (shareCode) {
      deckData = await fetchDeckFromShareCode(shareCode);
    } else {
      deckData = await fetchDeckFromCode(code!);
    }
  } catch {
    return new Response(
      JSON.stringify({ error: "Failed to fetch deck data" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!deckData) {
    return new Response(JSON.stringify({ error: "Deck not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { legendName, playerName, tournamentContext, placement, record, cards, domains } =
    deckData;
  // Le code de deck ne transporte que des cartes : le titre saisi dans le deckbuilder
  // s'y perdait et l'image retombait sur le nom de la Légende. On l'accepte en
  // paramètre plutôt que de changer le format du code, qui sert aussi aux liens de
  // partage. Borné à 80 caractères, la mise en page en tronque déjà l'affichage.
  const titleParam = searchParams.get("title")?.trim().slice(0, 80);
  const title = titleParam || deckData.title;

  // Organize cards by section
  const legendCards = cards.filter(
    (c) => c.section === "legend" && c.type === "Legend",
  );
  // Le champion peut arriver en section "champion" (code deck d'article) ou
  // "legend" non-Légende (deck en base) → on reconnaît les deux, comme partout.
  const championCards = cards.filter(
    (c) => (c.section as string) === "champion" || (c.section === "legend" && c.type !== "Legend"),
  );
  const mainCards = cards
    .filter((c) => c.section === "main")
    .sort(
      (a, b) => (a.energy ?? 99) - (b.energy ?? 99) || a.name.localeCompare(b.name),
    );
  const runeCards = cards.filter((c) => c.section === "rune");
  const battlefieldCards = cards.filter((c) => c.section === "battlefield");
  const sideCards = cards
    .filter((c) => c.section === "side")
    .sort(
      (a, b) => (a.energy ?? 99) - (b.energy ?? 99) || a.name.localeCompare(b.name),
    );

  // Combine champion into main for display
  const mainDisplayCards = [...championCards, ...mainCards];
  const mainCount = mainDisplayCards.reduce((s, c) => s + c.quantity, 0);
  const sideCount = sideCards.reduce((s, c) => s + c.quantity, 0);

  const domainColor1 = DOMAIN_COLORS[domains[0]] ?? "#8b5cf6";
  const domainColor2 = DOMAIN_COLORS[domains[1]] ?? domainColor1;

  const legendImgUrl = legendCards[0]?.imageUrl || null;

  // Largest card sizes that still fit the whole deck in the square.
  const { pw, ph, lw, lh, paired } = pickSizes(
    mainDisplayCards.length,
    runeCards.length,
    battlefieldCards.length,
    sideCards.length,
    WIDTH,
    HEIGHT,
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a0a12",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Branded background image */}
        {bgUrl && (
          <img
            src={bgUrl}
            width={WIDTH}
            height={HEIGHT}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: WIDTH,
              height: HEIGHT,
              objectFit: "cover",
            }}
          />
        )}

        {/* Voile sombre uni : lisibilité, sans teinte ni dégradé */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(10, 10, 18, 0.82)",
            display: "flex",
          }}
        />

        {/* Filet du haut : une couleur pleine par domaine, pas de dégradé */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, display: "flex" }}>
          <div style={{ display: "flex", flex: 1, backgroundColor: domainColor1 }} />
          <div style={{ display: "flex", flex: 1, backgroundColor: domainColor2 }} />
        </div>

        {/* ===== HEADER ===== */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "48px 64px 28px",
            position: "relative",
          }}
        >
          {/* Legend image + info row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 40,
            }}
          >
            {/* Legend card image */}
            {legendImgUrl && (
              <div
                style={{
                  display: "flex",
                  width: 180,
                  height: 252,
                  borderRadius: 16,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={legendImgUrl}
                  width={180}
                  height={252}
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}

            {/* Info column */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                gap: 12,
              }}
            >
              {/* Legend name */}
              <div
                style={{
                  display: "flex",
                  fontSize: 56,
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.2,
                }}
              >
                {displayLegendName(legendName)}
              </div>

              {/* Domains */}
              {domains.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginTop: 4,
                  }}
                >
                  {/* Pastille pleine + texte neutre : pas de fond teinté sous du texte teinté */}
                  {domains.map((d) => (
                    <div
                      key={d}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginRight: 12,
                        color: "#c4c0d0",
                        fontSize: 26,
                        fontWeight: 700,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: DOMAIN_COLORS[d] ?? "#8b5cf6",
                        }}
                      />
                      {DOMAIN_LABELS_FR[d] ?? d}
                    </div>
                  ))}
                </div>
              )}

              {/* Tournament + player info */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  marginTop: 8,
                }}
              >
                {tournamentContext && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      fontSize: 28,
                      color: "#a3a3b8",
                    }}
                  >
                    <span style={{ display: "flex" }}>{tournamentContext}</span>
                    {placement && (
                      <span
                        style={{
                          display: "flex",
                          color: "#d4a843",
                          fontWeight: 700,
                        }}
                      >
                        {placement}
                      </span>
                    )}
                    {record && (
                      <span style={{ display: "flex", color: "#8b8698", fontWeight: 600 }}>
                        ({record})
                      </span>
                    )}
                  </div>
                )}
                {playerName && (
                  <div
                    style={{
                      display: "flex",
                      fontSize: 28,
                      color: "#8b8698",
                    }}
                  >
                    par {playerName}
                  </div>
                )}
              </div>

              {/* Deck title if different from legend name */}
              {title !== displayLegendName(legendName) && (
                <div
                  style={{
                    display: "flex",
                    fontSize: 32,
                    fontWeight: 600,
                    color: "#c4c0d0",
                    marginTop: 4,
                  }}
                >
                  {title.length > 50 ? title.slice(0, 50) + "..." : title}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Separator */}
        <div
          style={{
            display: "flex",
            height: 2,
            margin: "0 64px",
            backgroundColor: "#2a2740",
          }}
        />

        {/* ===== CARD GRID BODY ===== */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            // Le solveur travaille par paliers : il reste toujours un peu de hauteur
            // inutilisée. Centrée, elle se lit comme une marge ; en bas, comme un trou.
            justifyContent: "center",
            padding: "32px 64px",
            gap: 8,
            overflow: "hidden",
          }}
        >
          {/* Main deck section */}
          <SectionHeader label="Deck Principal" count={mainCount} />
          <CardRow cards={mainDisplayCards} w={pw} h={ph} />

          {/* Runes et champs de bataille : côte à côte quand ils tiennent sur une bande */}
          {paired ? (
            <div style={{ display: "flex", marginTop: 24, gap: BAND_SPACING }}>
              <div style={{ display: "flex", flexDirection: "column", width: runeCards.length * (pw + CARD_GAP) - CARD_GAP }}>
                <SectionHeader label="Runes" count={runeCards.reduce((s, r) => s + r.quantity, 0)} />
                <CardRow cards={runeCards} w={pw} h={ph} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", width: battlefieldCards.length * (lw + CARD_GAP) - CARD_GAP }}>
                <SectionHeader label="Champs de bataille" count={battlefieldCards.reduce((s, b) => s + b.quantity, 0)} />
                <CardRow cards={battlefieldCards} w={lw} h={lh} />
              </div>
            </div>
          ) : (
            <>
              {runeCards.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", marginTop: 24 }}>
                  <SectionHeader label="Runes" count={runeCards.reduce((s, r) => s + r.quantity, 0)} />
                  <CardRow cards={runeCards} w={pw} h={ph} />
                </div>
              )}
              {battlefieldCards.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", marginTop: 24 }}>
                  <SectionHeader
                    label="Champs de bataille"
                    count={battlefieldCards.reduce((s, b) => s + b.quantity, 0)}
                  />
                  <CardRow cards={battlefieldCards} w={lw} h={lh} />
                </div>
              )}
            </>
          )}

          {/* Side deck section */}
          {sideCards.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", marginTop: 24 }}>
              <SectionHeader label="Réserve" count={sideCount} />
              <CardRow cards={sideCards} w={pw} h={ph} />
            </div>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "32px 64px 48px",
            borderTop: "2px solid #1e1b2e",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
              color: "#6b6580",
              fontSize: 26,
            }}
          >
            <span style={{ display: "flex" }}>
              {mainCount} cartes
            </span>
            {sideCount > 0 && (
              <span style={{ display: "flex" }}>
                {sideCount} en réserve
              </span>
            )}
            <span style={{ display: "flex" }}>
              {runeCards.reduce((s, r) => s + r.quantity, 0)} runes
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              color: "#c4c0d0",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            riftboundfrance.fr
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        // Avec ?download=1 le navigateur enregistre un vrai .png au lieu de
        // deviner le nom depuis l'URL (Chrome sortait un fichier sans extension).
        ...(searchParams.get("download")
          ? { "Content-Disposition": `attachment; filename="${fileSlug(slug ?? shareCode ?? "decklist")}.png"` }
          : {}),
      },
    },
  );
}

function fileSlug(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "decklist";
}
