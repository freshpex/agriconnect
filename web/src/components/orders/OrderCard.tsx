import { Link } from "react-router-dom";
import { ArrowRight, PackageCheck } from "lucide-react";
import type { Order } from "../../types";
import { formatCurrency, formatDate } from "../../utils/format";
import { Badge } from "../ui/Badge";

const statusTone = {
  pending: "amber",
  confirmed: "blue",
  "in-transit": "purple",
  delivered: "green",
  cancelled: "red",
} as const;

export function OrderCard({
  order,
  viewAs,
}: {
  order: Order;
  viewAs: "buyer" | "seller";
}) {
  const counterparty = viewAs === "seller" ? order.buyer : order.seller;

  return (
    <Link
      to={`/orders/${order._id}`}
      className="group block rounded-lg border border-stone-200 bg-white p-4 shadow-sm transition hover:border-leaf-300 hover:shadow-lift"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-leaf-50 text-leaf-700">
            <PackageCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-black text-stone-950">
                {order.listing?.cropName || "Produce order"}
              </h3>
              <Badge tone={statusTone[order.status]}>
                {order.status.replace("-", " ")}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-stone-500">
              {viewAs === "seller" ? "Buyer" : "Seller"}: {counterparty?.name}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Created {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <div className="text-right">
            <p className="text-lg font-black text-leaf-800">
              {formatCurrency(order.totalPrice, order.currency)}
            </p>
            <p className="text-xs font-semibold text-stone-500">
              {order.quantity} {order.unit}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-leaf-700">
            View{" "}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
