import type { ReactNode } from "react";
import { Suspense } from "react";

function DetailFallback() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:py-20">
      <div className="h-5 w-24 animate-pulse rounded-full bg-moss/15" />
      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-3xl bg-moss/15" />
        <div className="flex flex-col gap-4">
          <div className="h-6 w-28 animate-pulse rounded-full bg-moss/15" />
          <div className="h-9 w-2/3 animate-pulse rounded-full bg-moss/15" />
          <div className="h-8 w-32 animate-pulse rounded-full bg-moss/15" />
          <div className="mt-4 h-24 animate-pulse rounded-xl bg-moss/15" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<DetailFallback />}>{children}</Suspense>;
}
