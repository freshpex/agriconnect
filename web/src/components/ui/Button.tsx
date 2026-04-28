import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-leaf-700 text-white shadow-lift hover:bg-leaf-800 focus-visible:ring-leaf-300",
  secondary:
    "bg-sun-400 text-stone-950 shadow-lift hover:bg-sun-500 focus-visible:ring-sun-200",
  outline:
    "border border-stone-200 bg-white text-stone-800 hover:border-leaf-300 hover:bg-leaf-50 focus-visible:ring-leaf-100",
  danger:
    "bg-red-600 text-white shadow-lift hover:bg-red-700 focus-visible:ring-red-200",
  ghost: "text-stone-700 hover:bg-stone-100 focus-visible:ring-stone-200",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  icon?: ReactNode;
}

export function Button({
  className,
  variant = "primary",
  isLoading,
  icon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      <span>{children}</span>
    </button>
  );
}
