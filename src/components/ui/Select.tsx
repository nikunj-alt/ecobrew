import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export default function Select({ label, options, error, className = "", id, ...rest }: SelectProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-moss">
        {label}
      </label>
      <select
        id={selectId}
        className={`h-11 rounded-xl border bg-white/60 px-3 text-sm text-leaf-deep focus:border-sprout focus:outline-2 focus:outline-sprout/40 ${
          error ? "border-red-400" : "border-moss/25"
        } ${className}`}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
