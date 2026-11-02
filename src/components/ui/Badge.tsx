import type { ReactNode } from "react";

export default function Badge({
  children,
  tone = "moss",
}: {
  children: ReactNode;
  tone?: "moss" | "tea";
}) {
  const tones = {
    moss: "bg-moss/12 text-moss",
    tea: "bg-tea/12 text-tea",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
