export default function SectionHeading({
  tag,
  title,
  subtitle,
  align = "left",
}: {
  tag?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  const alignCls = align === "center" ? "mx-auto text-center" : "";
  const ruleAlign = align === "center" ? "mx-auto" : "";
  return (
    <div className={`max-w-2xl ${alignCls}`}>
      {tag && (
        <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-tea">
          <span className={`h-px w-10 bg-tea/50 ${ruleAlign}`} />
          {tag}
        </p>
      )}
      <h2 className="text-4xl font-medium text-leaf-deep sm:text-[2.9rem]">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-moss">{subtitle}</p>
      )}
    </div>
  );
}
