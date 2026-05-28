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
