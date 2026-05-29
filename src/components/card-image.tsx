import Image from "next/image";
import { cn } from "@/lib/utils";

interface CardImageProps {
  src: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
}

const sizes = {
  sm: { width: 140, height: 195 },
  md: { width: 200, height: 279 },
  lg: { width: 300, height: 419 },
  xl: { width: 400, height: 558 },
};

export function CardImage({ src, alt, size = "md", className, priority }: CardImageProps) {
  const { width, height } = sizes[size];

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-game-card bg-surface-raised text-ink-muted",
          className
        )}
        style={{ width, height }}
      >
        <span className="text-xs">No image</span>
      </div>
    );
  }

  // Card art is served by the Sanity CDN (cmsassets.rgpub.io), which resizes
  // and serves WebP natively via URL params. We offload resizing to it instead
  // of the Next.js image optimizer — the small server can't optimize hundreds
  // of card images per page (deck grids, articles) without choking.
  if (src.includes("cmsassets.rgpub.io")) {
    const sep = src.includes("?") ? "&" : "?";
    // Aggressive resize for grid thumbnails (sm/md); crisper for large/detail
    // views (lg/xl) so the card-detail hero stays sharp.
    const large = size === "lg" || size === "xl";
    const reqW = Math.round(width * (size === "xl" ? 2.5 : 2));
    const resized = `${src}${sep}w=${reqW}&q=${large ? 90 : 72}&auto=format`;
    return (
      <Image
        src={resized}
        alt={alt}
        width={width}
        height={height}
        className={cn("rounded-game-card game-card-hover w-full h-auto", className)}
        priority={priority}
        unoptimized
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("rounded-game-card game-card-hover w-full h-auto", className)}
      priority={priority}
    />
  );
}
