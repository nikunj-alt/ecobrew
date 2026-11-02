import type { Category, Product } from "../types";

export const categories: Category[] = [
  "pen-stands",
  "stationery",
  "furniture",
  "decor",
];

export const categoryLabels: Record<Category, string> = {
  "pen-stands": "Pen stands",
  stationery: "Stationery",
  furniture: "Furniture",
  decor: "Decor",
};

export const products: Product[] = [
  {
    slug: "leaf-pen-stand",
    name: "Leaf Pen Stand",
    category: "pen-stands",
    price: 199,
    shortDescription: "A desk pen stand turned from pressed tea-leaf composite.",
    description:
      "Every pen stand starts its life in a chai glass. The spent leaves are cleaned, dried, and pressed with a compostable binder into a sturdy stand that holds pens, pencils, and brushes. Each one is hand-shaped, so no two are quite alike.",
    image: "/logo.png",
    impact: "≈ 40 cups of chaipatti per stand",
    inStock: true,
    featured: true,
    related: ["tea-cup-organiser", "leaf-coaster-set"],
  },
  {
    slug: "tea-cup-organiser",
    name: "Tea Cup Organiser",
    category: "pen-stands",
    price: 249,
    shortDescription: "A two-tier organiser for a tidy, leaf-made desk.",
    description:
      "A compact two-tier organiser for stationery, phone, and small odds and ends. The rich tea-brown finish comes from the leaf fibre itself — no dyes added.",
    image: "/logo.png",
    impact: "≈ 55 cups of chaipatti per organiser",
    inStock: true,
    related: ["leaf-pen-stand", "spoon-bookmark"],
  },
  {
    slug: "leaf-coaster-set",
    name: "Leaf Coaster Set",
    category: "stationery",
    price: 149,
    shortDescription: "A set of four coasters, each one a single pressed leaf.",
    description:
      "Four coasters pressed from a single batch of dried tea leaves. They are light, heat-tolerant, and naturally matte — a quiet reminder of what the cup once held.",
    image: "/logo.png",
    impact: "≈ 20 cups of chaipatti per set",
    inStock: true,
    featured: true,
    related: ["spoon-bookmark", "leaf-notebook"],
  },
  {
    slug: "spoon-bookmark",
    name: "Spoon Bookmark",
    category: "stationery",
    price: 99,
    shortDescription: "A slim bookmark with a tea-leaf edge.",
    description:
      "A thin, flexible bookmark made from the same hardened leaf composite as our furniture. The edge is shaped like a spoon — a nod to the chai spoon it once stirred with.",
    image: "/logo.png",
    impact: "≈ 12 cups of chaipatti per bookmark",
    inStock: true,
    related: ["leaf-coaster-set", "leaf-notebook"],
  },
  {
    slug: "leaf-notebook",
    name: "Leaf Notebook",
    category: "stationery",
    price: 299,
    shortDescription: "A notebook bound in tea-leaf composite covers.",
    description:
      "A lined notebook with hard covers made from the pressed-leaf material. The paper inside is recycled; the cover is pure chaipatti. It ages gracefully and gets smoother as you use it.",
    image: "/logo.png",
    impact: "≈ 30 cups of chaipatti per cover",
    inStock: true,
    related: ["spoon-bookmark", "leaf-coaster-set"],
  },
  {
    slug: "mini-chair",
    name: "Mini Chair",
    category: "furniture",
    price: 999,
    shortDescription: "A child-sized chair, sculpted from tea-leaf board.",
    description:
      "Our signature piece. A small, sturdy chair for a child's room, shaped from thick board of compressed tea leaves and a food-safe binder. It is proof that household waste can become real furniture.",
    image: "/logo.png",
    impact: "≈ 200 cups of chaipatti per chair",
    inStock: false,
    featured: true,
    related: ["mini-table", "leaf-pen-stand"],
  },
  {
    slug: "mini-table",
    name: "Mini Table",
    category: "furniture",
    price: 1299,
    shortDescription: "A low side table, leaf-made.",
    description:
      "A low side table that pairs with the Mini Chair. The hardened leaf composite is sanded smooth and finished with a natural wax, giving it a warm, woody feel.",
    image: "/logo.png",
    impact: "≈ 240 cups of chaipatti per table",
    inStock: true,
    related: ["mini-chair", "leaf-pen-stand"],
  },
  {
    slug: "wall-leaf-tile",
    name: "Wall Leaf Tile",
    category: "decor",
    price: 179,
    shortDescription: "A decorative tile pressed with a real leaf imprint.",
    description:
      "A wall tile with the imprint of a single tea leaf pressed into its face. Each tile is cast from a different leaf, making every one unique. Comes with a simple hanging loop.",
    image: "/logo.png",
    impact: "≈ 15 cups of chaipatti per tile",
    inStock: true,
    related: ["leaf-coaster-set", "leaf-pen-stand"],
  },
  {
    slug: "tea-soil-pots",
    name: "Tea-Soil Pots",
    category: "decor",
    price: 349,
    shortDescription: "Tiny planters that return to the soil.",
    description:
      "Small planters made from the leaf composite, mixed with a little extra fibre so they break down over a season. Plant a seed straight into one — the pot itself composts.",
    image: "/logo.png",
    impact: "≈ 25 cups of chaipatti per pot",
    inStock: true,
    related: ["wall-leaf-tile", "leaf-coaster-set"],
  },
];
