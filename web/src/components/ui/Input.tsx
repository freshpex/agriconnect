import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helper?: string;
  error?: string;
}

export function Input({
  label,
  helper,
  error,
  className,
  ...props
}: InputProps) {
  return (
    <label className="block">
      <span className="app-label">{label}</span>
      <input
        className={clsx("app-field", error && "border-red-300", className)}
        {...props}
      />
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : null}
      {helper && !error ? (
        <span className="mt-1 block text-xs text-stone-500">{helper}</span>
      ) : null}
    </label>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helper?: string;
  error?: string;
}

export function TextArea({
  label,
  helper,
  error,
  className,
  ...props
}: TextAreaProps) {
  return (
    <label className="block">
      <span className="app-label">{label}</span>
      <textarea
        className={clsx(
          "app-field min-h-28 resize-y",
          error && "border-red-300",
          className
        )}
        {...props}
      />
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : null}
      {helper && !error ? (
        <span className="mt-1 block text-xs text-stone-500">{helper}</span>
      ) : null}
    </label>
  );
}
