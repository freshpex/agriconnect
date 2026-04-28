import { Loader2 } from "lucide-react";

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-stone-600">
      <Loader2 className="h-7 w-7 animate-spin text-leaf-700" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
