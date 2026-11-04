import type { Metadata } from "next";
import { categoryLabels } from "@/lib/data/products";

const slugLabels: Record<string, string> = {
  "leaf-pen-stand": "Leaf Pen Stand",
  "tea-cup-organiser": "Tea Cup Organiser",
  "leaf-coaster-set": "Leaf Coaster Set",
  "spoon-bookmark": "Spoon Bookmark",
  "leaf-notebook": "Leaf Notebook",
  "mini-chair": "Mini Chair",
  "mini-table": "Mini Table",
  "wall-leaf-tile": "Wall Leaf Tile",
  "tea-soil-pots": "Tea-Soil Pots",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = slugLabels[slug];
  return {
    title: name ? `${name} — EcoBrew` : "Product — EcoBrew",
    description: `Hand-shaped from reclaimed tea leaves: the ${name || slug}, a ${name ? categoryLabels[slug as keyof typeof categoryLabels] : "product"} from EcoBrew.`,
    openGraph: {
      title: name ? `${name} — EcoBrew` : "EcoBrew",
      description: `Hand-shaped from reclaimed tea leaves: the ${name || slug}.`,
    },
  };
}
