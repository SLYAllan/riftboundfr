import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { decodeDeck } from "@/lib/deck-codec";
import { allowSvgInSharp } from "@/lib/og-sharp";

export const alt = "Deck communautaire Riftbound";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const DOMAIN_COLORS: Record<string, string> = {
  Fury: "#ef4444",
  Calm: "#22c55e",
  Mind: "#3b82f6",
  Body: "#f97316",
  Chaos: "#8b5cf6",
  Order: "#eab308",
};

function displayLegend(name: string): string {
  const parts = name.split(" - ");
  if (parts.length >= 2) return `${parts[0].trim()}, ${parts.slice(1).join(" - ").trim()}`;
  return name;
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  await allowSvgInSharp();

  const deck = await prisma.communityDeck.findUnique({
    where: { shareCode: code },
    select: {
      title: true,
      legendName: true,
      domains: true,
      authorName: true,
      tags: true,
      deckCode: true,
      likes: true,
      views: true,
    },
  });

  if (!deck) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0f0d1a",
            color: "#fff",
            fontSize: 48,
          }}
        >
          Deck introuvable
        </div>
      ),
      size,
    );
  }

  const decoded = decodeDeck(deck.deckCode);
  const mainCount = decoded ? decoded.main.reduce((s, e) => s + e.quantity, 0) : 0;
  const runeCount = decoded ? decoded.rune.reduce((s, e) => s + e.quantity, 0) : 0;

  const domainColor1 = DOMAIN_COLORS[deck.domains[0]] ?? "#8b5cf6";
  const domainColor2 = DOMAIN_COLORS[deck.domains[1]] ?? domainColor1;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0f0d1a",
          padding: "50px 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${domainColor1}20 0%, transparent 50%, ${domainColor2}15 100%)`,
            display: "flex",
          }}
        />

        {/* Top bar with domains */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          {deck.domains.map((d) => (
            <div
              key={d}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: `${DOMAIN_COLORS[d] ?? "#8b5cf6"}30`,
                border: `2px solid ${DOMAIN_COLORS[d] ?? "#8b5cf6"}60`,
                borderRadius: "24px",
                padding: "6px 16px",
                color: DOMAIN_COLORS[d] ?? "#8b5cf6",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {d}
            </div>
          ))}
          {deck.tags.length > 0 && (
            <div style={{ display: "flex", gap: "8px", marginLeft: "12px" }}>
              {deck.tags.slice(0, 3).map((tag) => (
                <div
                  key={tag}
                  style={{
                    backgroundColor: "#8b5cf630",
                    border: "2px solid #8b5cf660",
                    borderRadius: "24px",
                    padding: "6px 14px",
                    color: "#a78bfa",
                    fontSize: 20,
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.15,
            marginBottom: "16px",
            display: "flex",
          }}
        >
          {deck.title.length > 40 ? deck.title.slice(0, 40) + "…" : deck.title}
        </div>

        {/* Legend name */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: domainColor1,
            marginBottom: "auto",
            display: "flex",
          }}
        >
          {displayLegend(deck.legendName)}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #ffffff15",
            paddingTop: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              color: "#a3a3b8",
              fontSize: 22,
            }}
          >
            <span style={{ display: "flex" }}>par {deck.authorName}</span>
            <span style={{ display: "flex" }}>{mainCount} cartes</span>
            <span style={{ display: "flex" }}>{runeCount} runes</span>
            {deck.likes > 0 && <span style={{ display: "flex" }}>♥ {deck.likes}</span>}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#6366f1",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            riftboundfrance.fr
          </div>
        </div>
      </div>
    ),
    size,
  );
}
