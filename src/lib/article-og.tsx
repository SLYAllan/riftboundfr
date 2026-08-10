import { ImageResponse } from "next/og";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { allowSvgInSharp } from "@/lib/og-sharp";

// X/Twitter ne rend pas le WebP : on génère une image PNG à la volée à partir
// de la cover de l'article (convertie via sharp) avec un bandeau de marque.
// Partagé par opengraph-image.tsx et twitter-image.tsx.
export const OG_SIZE = { width: 1200, height: 630 };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://riftboundfrance.fr";

async function loadCoverAsPng(coverImage: string | null): Promise<string | null> {
  if (!coverImage) return null;
  try {
    const url = coverImage.startsWith("http") ? coverImage : `${SITE_URL}${coverImage}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const input = Buffer.from(await res.arrayBuffer());
    const png = await sharp(input)
      .resize(OG_SIZE.width, OG_SIZE.height, { fit: "cover", position: "attention" })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function renderArticleOgImage(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { title: true, coverImage: true },
  });

  const title = article?.title ?? "Riftbound France";
  const cover = await loadCoverAsPng(article?.coverImage ?? null);
  await allowSvgInSharp();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#0f0d1a",
        }}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            width={OG_SIZE.width}
            height={OG_SIZE.height}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              background: "linear-gradient(135deg, #1e1b3a 0%, #0f0d1a 60%, #2a1b3d 100%)",
            }}
          />
        )}

        {/* Dégradé bas pour la lisibilité */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "55%",
            display: "flex",
            background: "linear-gradient(to top, rgba(8,7,18,0.95) 0%, rgba(8,7,18,0.7) 45%, rgba(8,7,18,0) 100%)",
          }}
        />

        {/* Contenu */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            padding: "0 60px 48px",
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-1px",
              display: "flex",
              textShadow: "0 2px 12px rgba(0,0,0,0.6)",
            }}
          >
            {title.length > 80 ? title.slice(0, 80) + "…" : title}
          </div>

          <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#6366f1",
                color: "#ffffff",
                fontSize: 26,
                fontWeight: 700,
                borderRadius: 9999,
                padding: "8px 22px",
              }}
            >
              riftboundfrance.fr
            </div>
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
