export interface JournalPost {
  tag: string;
  title: string;
  excerpt: string;
  body: string[];
}

export const JOURNAL_POSTS: JournalPost[] = [
  {
    tag: "Process",
    title: "Where the leaves come from",
    excerpt: "Every piece starts in the same place — the bottom of a chai glass.",
    body: [
      "The spent tea leaves behind our products are collected the way you'd expect: from cups of chai. Across chai stalls and homes, the leaves left after a brew are usually thrown away.",
      "EcoBrew takes those leaves and gives them a second life. It begins with the simple act of gathering them — clean, dry, and sorted as the first stage of the process.",
    ],
  },
  {
    tag: "Materials",
    title: "A note on the binder",
    excerpt: "Natural binders hold each piece together. No glue, no plastic.",
    body: [
      "Tea leaves on their own don't hold a shape. To turn them into a pen stand or a small chair, they need something to bind them — and that's where natural binders come in.",
      "The idea is simple: what holds a piece together should be as harmless as the leaves themselves, so the finished object can return to the earth when it's done being used.",
    ],
  },
  {
    tag: "Process",
    title: "Pressing the first shapes",
    excerpt: "Cleaned leaves, a binder, and a press — the step where waste becomes a shape.",
    body: [
      "Once the leaves are clean and dry, they're measured with a natural binder and pressed into a mould. This is the turning point: after this step, what was tea waste is now a solid, usable object.",
      "The shapes start small — pen stands, coasters, stationery — and build up to mini furniture and decor.",
    ],
  },
  {
    tag: "Event",
    title: "From chai glass to desk piece",
    excerpt: "How a familiar waste becomes something useful.",
    body: [
      "Every EcoBrew piece begins as spent tea leaves collected from chai stalls and homes across the city. A familiar waste, transformed into something useful.",
      "It all answers one question: what happens to the tea leaves after the cup is emptied?",
    ],
  },
];
