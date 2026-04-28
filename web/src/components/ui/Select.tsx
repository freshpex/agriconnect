import type { SelectHTMLAttributes } from "react";
import clsx from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  helper?: string;
}

export function Select({
  label,
  helper,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <label className="block">
      <span className="app-label">{label}</span>
      <select
        className={clsx("app-field appearance-none", className)}
        {...props}
      >
        {children}
      </select>
      {helper ? (
        <span className="mt-1 block text-xs text-stone-500">{helper}</span>
      ) : null}
    </label>
  );
}
