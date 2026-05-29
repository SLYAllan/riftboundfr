import { renderArticleOgImage, OG_SIZE } from "@/lib/article-og";

export const runtime = "nodejs";
export const alt = "Riftbound France";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderArticleOgImage(slug);
}
