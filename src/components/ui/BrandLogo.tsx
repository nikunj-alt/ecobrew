import Image from "next/image";
import { cn } from "@/lib/utils";

export const TEARX_LOGO_SRC = "/assets/aistudio/tearx_logo_4ef86950.webp";

interface BrandLogoProps {
  className?: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Circular TeaRX brand emblem wrapping the official circular TeaRX mark.
 * Uses aspect-square + rounded-full + subtle scale so the circular emblem
 * fills the frame edge-to-edge without clipping the top leaf or side arrows.
 */
export default function BrandLogo({
  className = "h-10 w-10",
  alt = "TeaRX Logo",
  sizes = "96px",
  priority = false,
}: BrandLogoProps) {
  return (
    <div
      className={cn(
        "relative aspect-square shrink-0 overflow-hidden rounded-full bg-white",
        className,
      )}
    >
      <Image
        src={TEARX_LOGO_SRC}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover object-center scale-[1.15]"
      />
    </div>
  );
}
