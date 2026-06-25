import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import { decodeDeck } from "@/lib/deck-codec";
import { displayLegendName } from "@/lib/utils";

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
const WIDTH = 1000;
const HEIGHT = 1000;

const CARD_GAP = 6;
const BODY_W = WIDTH - 64; // 32px horizontal padding on each side

// Pick the LARGEST card size that still lets the whole deck (main + runes +
// battlefields + side) fit inside the square. Maximizes legibility per deck.
function pickSizes(mainN: number, runeN: number, bfN: number, sideN: number) {
  const HEADER = 178; // legend header block
  const FOOTER = 64;
  const SECT = 34; // section title + spacing
  for (const pw of [132, 124, 116, 108, 100, 92, 84, 78, 72]) {
    const ph = Math.round(pw * 1.4);
    const lw = Math.round(pw * 1.7);
    const lh = Math.round(pw * 1.2);
    const cols = Math.floor((BODY_W + CARD_GAP) / (pw + CARD_GAP));
    const bfCols = Math.max(1, Math.floor((BODY_W + CARD_GAP) / (lw + CARD_GAP)));
    const rowH = ph + CARD_GAP;
    let h = HEADER + FOOTER;
    h += SECT + Math.ceil(mainN / cols) * rowH;
    if (runeN) h += SECT + Math.ceil(runeN / cols) * rowH;
    if (bfN) h += SECT + Math.ceil(bfN / bfCols) * (lh + CARD_GAP);
    if (sideN) h += SECT + Math.ceil(sideN / cols) * rowH;
    if (h <= HEIGHT) return { pw, ph, lw, lh };
  }
  return { pw: 72, ph: 101, lw: 122, lh: 86 };
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
        borderRadius: 6,
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
            borderRadius: 6,
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
            borderRadius: 6,
            border: "1px solid #2a2740",
          }}
        >
          <span
            style={{
              color: "#6b6580",
              fontSize: 10,
              textAlign: "center",
              padding: 4,
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
            top: 4,
            right: 4,
            backgroundColor: "rgba(139, 92, 246, 0.9)",
            borderRadius: 10,
            width: 22,
            height: 22,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {card.quantity}
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
        gap: 8,
        marginBottom: 8,
        marginTop: 4,
      }}
    >
      <span
        style={{
          color: "#d4a843",
          fontSize: 14,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </span>
      <span style={{ color: "#6b6580", fontSize: 13 }}>({count})</span>
      <div
        style={{
          display: "flex",
          flex: 1,
          height: 1,
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

  const { title, legendName, playerName, tournamentContext, placement, record, cards, domains } =
    deckData;

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
  const { pw, ph, lw, lh } = pickSizes(
    mainDisplayCards.length,
    runeCards.length,
    battlefieldCards.length,
    sideCards.length,
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

        {/* Dark overlay for readability over the background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(10, 10, 18, 0.72)",
            display: "flex",
          }}
        />

        {/* Domain gradient tint */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(160deg, ${domainColor1}33 0%, transparent 45%, ${domainColor2}22 100%)`,
            display: "flex",
          }}
        />

        {/* Subtle top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${domainColor1}, ${domainColor2})`,
            display: "flex",
          }}
        />

        {/* ===== HEADER ===== */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "24px 32px 14px",
            position: "relative",
          }}
        >
          {/* Legend image + info row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 20,
            }}
          >
            {/* Legend card image */}
            {legendImgUrl && (
              <div
                style={{
                  display: "flex",
                  width: 90,
                  height: 126,
                  borderRadius: 8,
                  overflow: "hidden",
                  flexShrink: 0,
                  border: `2px solid ${domainColor1}60`,
                }}
              >
                <img
                  src={legendImgUrl}
                  width={90}
                  height={126}
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
                gap: 6,
              }}
            >
              {/* Legend name */}
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
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
                    gap: 8,
                    marginTop: 2,
                  }}
                >
                  {domains.map((d) => (
                    <div
                      key={d}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        backgroundColor: `${DOMAIN_COLORS[d] ?? "#8b5cf6"}25`,
                        border: `1px solid ${DOMAIN_COLORS[d] ?? "#8b5cf6"}50`,
                        borderRadius: 12,
                        padding: "3px 10px",
                        color: DOMAIN_COLORS[d] ?? "#8b5cf6",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
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
                  gap: 2,
                  marginTop: 4,
                }}
              >
                {tournamentContext && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 14,
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
                      <span
                        style={{
                          display: "flex",
                          color: domainColor1,
                          fontWeight: 600,
                        }}
                      >
                        ({record})
                      </span>
                    )}
                  </div>
                )}
                {playerName && (
                  <div
                    style={{
                      display: "flex",
                      fontSize: 14,
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
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#c4c0d0",
                    marginTop: 2,
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
            height: 1,
            margin: "0 32px",
            background: `linear-gradient(90deg, ${domainColor1}40, ${domainColor2}40, transparent)`,
          }}
        />

        {/* ===== CARD GRID BODY ===== */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "16px 32px",
            gap: 4,
            overflow: "hidden",
          }}
        >
          {/* Main deck section */}
          <SectionHeader label="Deck Principal" count={mainCount} />
          <CardRow cards={mainDisplayCards} w={pw} h={ph} />

          {/* Runes section */}
          {runeCards.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
              <SectionHeader label="Runes" count={runeCards.reduce((s, r) => s + r.quantity, 0)} />
              <CardRow cards={runeCards} w={pw} h={ph} />
            </div>
          )}

          {/* Battlefields section */}
          {battlefieldCards.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
              <SectionHeader
                label="Champs de bataille"
                count={battlefieldCards.reduce((s, b) => s + b.quantity, 0)}
              />
              <CardRow cards={battlefieldCards} w={lw} h={lh} />
            </div>
          )}

          {/* Side deck section */}
          {sideCards.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
              <SectionHeader label="Reserve" count={sideCount} />
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
            padding: "16px 32px 24px",
            borderTop: "1px solid #1e1b2e",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              color: "#6b6580",
              fontSize: 13,
            }}
          >
            <span style={{ display: "flex" }}>
              {mainCount} cartes
            </span>
            {sideCount > 0 && (
              <span style={{ display: "flex" }}>
                {sideCount} reserve
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
              gap: 8,
              color: domainColor1,
              fontSize: 16,
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
      },
    },
  );
}
