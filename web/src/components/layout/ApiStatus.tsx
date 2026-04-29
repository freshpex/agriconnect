import { useQuery } from "@tanstack/react-query";
import { Wifi, WifiOff } from "lucide-react";
import { healthApi } from "../../api/health";

export function ApiStatus() {
  const { data, isError, isFetching } = useQuery({
    queryKey: ["api-health"],
    queryFn: () => healthApi.get().then((response) => response.data),
    refetchInterval: 60_000,
    retry: 0,
  });

  const ok = data?.status === "ok" && !isError;

  return (
    <div
      className="hidden items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 shadow-sm sm:flex"
      title={ok ? `${data.service} v${data.version}` : "API is not reachable"}
    >
      {ok ? (
        <Wifi className="h-3.5 w-3.5 text-leaf-600" />
      ) : (
        <WifiOff className="h-3.5 w-3.5 text-red-500" />
      )}
      <span>
        {isFetching ? "Checking API" : ok ? "API online" : "API offline"}
      </span>
    </div>
  );
}
