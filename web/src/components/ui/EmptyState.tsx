import type { ReactNode } from "react";
import { Sprout } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({
  title,
  message,
  action,
  icon,
}: {
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
  icon?: ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-stone-300 bg-white/70 p-8 text-center">
      <div className="mb-4 rounded-full bg-leaf-50 p-4 text-leaf-700">
        {icon || <Sprout className="h-7 w-7" />}
      </div>
      <h3 className="text-lg font-bold text-stone-950">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-stone-500">{message}</p>
      {action ? (
        <Button className="mt-5" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
