"use client";

import type { ReactNode } from "react";

export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  void delay;
  return <div className={className}>{children}</div>;
}
