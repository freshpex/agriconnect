import clsx from "clsx";
import type { ReactNode } from "react";

const toneClass = {
  green: "bg-leaf-100 text-leaf-800 ring-leaf-200",
  amber: "bg-sun-100 text-sun-800 ring-sun-200",
  blue: "bg-sky-100 text-sky-800 ring-sky-200",
  red: "bg-red-100 text-red-700 ring-red-200",
  stone: "bg-stone-100 text-stone-700 ring-stone-200",
  purple: "bg-purple-100 text-purple-700 ring-purple-200",
} as const;

export function Badge({
  children,
  tone = "stone",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof toneClass;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        toneClass[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
