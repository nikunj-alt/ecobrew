import { processSteps } from "@/lib/data/process";
import { LeafIcon } from "@/components/icons";

export default function ProcessTimeline() {
  return (
    <ol className="relative">
      <div className="absolute left-[22px] top-2 bottom-2 w-px bg-moss/25" aria-hidden="true" />
      {processSteps.map((step) => (
        <li key={step.n} className="relative flex gap-6 pb-10 last:pb-0">
          <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-leaf-deep text-sprout">
            <span className="font-display text-base font-medium">{step.n}</span>
          </div>
          <div className="pt-1">
            <h3 className="font-display text-xl font-medium text-leaf-deep">{step.title}</h3>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-moss">{step.body}</p>
          </div>
        </li>
      ))}
      <div className="flex items-center gap-3 pt-2 text-moss">
        <LeafIcon className="h-5 w-5 text-sprout" />
        <span className="text-sm font-medium">…and a product is born.</span>
      </div>
    </ol>
  );
}
