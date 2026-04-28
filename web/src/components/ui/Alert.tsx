import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import clsx from "clsx";
import type { ReactNode } from "react";

const styles = {
  info: {
    wrap: "border-sky-200 bg-sky-50 text-sky-900",
    icon: <Info className="h-4 w-4" />,
  },
  success: {
    wrap: "border-leaf-200 bg-leaf-50 text-leaf-900",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  error: {
    wrap: "border-red-200 bg-red-50 text-red-800",
    icon: <AlertCircle className="h-4 w-4" />,
  },
};

export function Alert({
  type = "info",
  children,
  className,
}: {
  type?: keyof typeof styles;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
        styles[type].wrap,
        className
      )}
    >
      <span className="mt-0.5">{styles[type].icon}</span>
      <div>{children}</div>
    </div>
  );
}
