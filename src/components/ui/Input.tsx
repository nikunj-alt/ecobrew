import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, className = "", id, ...rest }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-moss">
        {label}
      </label>
      <input
        id={inputId}
        className={`h-11 rounded-xl border bg-white/60 px-4 text-sm text-leaf-deep placeholder:text-moss/50 focus:border-sprout focus:outline-2 focus:outline-sprout/40 ${
          error ? "border-red-400" : "border-moss/25"
        } ${className}`}
        {...rest}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
