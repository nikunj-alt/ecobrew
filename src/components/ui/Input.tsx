import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "label"> {
  label?: ReactNode;
  error?: string;
}

export default function Input({ label, error, className = "", id, ...rest }: InputProps) {
  const inputId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-moss">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`h-12 rounded-full border border-leaf-deep/15 bg-white/70 px-5 text-sm text-leaf-deep placeholder:text-moss/50 focus:border-tea focus:outline-2 focus:outline-tea/40 ${
          error ? "border-red-400" : "border-moss/25"
        } ${className}`}
        {...rest}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
