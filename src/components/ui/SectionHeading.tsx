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
  return (
    <div className={`max-w-2xl ${alignCls}`}>
      {tag && (
        <p className="mb-2 text-sm font-medium text-tea">{tag}</p>
      )}
      <h2 className="text-3xl font-medium text-leaf-deep sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base leading-relaxed text-moss">{subtitle}</p>
      )}
    </div>
  );
}
