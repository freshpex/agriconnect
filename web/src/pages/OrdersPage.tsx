import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { ShoppingBag } from "lucide-react";
import { useOrders } from "../hooks/useOrders";
import { useAuth } from "../state/AuthContext";
import { OrderCard } from "../components/orders/OrderCard";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import { Pagination } from "../components/ui/Pagination";
import { Select } from "../components/ui/Select";
import type { OrderStatus } from "../types";
import { getApiError } from "../utils/format";

const statuses: Array<{ value: OrderStatus | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in-transit", label: "In transit" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewAs, setViewAs] = useState<"buyer" | "seller">(
    user?.role === "farmer" ? "seller" : "buyer"
  );
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useOrders({
    role: viewAs,
    status,
    page,
    limit: 20,
  });

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-lg border border-stone-200 p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="inline-flex rounded-full bg-sun-100 px-3 py-1 text-xs font-black text-sun-800">
              Orders
            </p>
            <h1 className="mt-4 text-3xl font-black text-stone-950">
              Purchases and sales
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Review authenticated buyer and seller orders, then advance the
              status transitions allowed by the backend.
            </p>
          </div>
          <Select
            label="Status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as OrderStatus | "");
              setPage(1);
            }}
          >
            {statuses.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 rounded-lg bg-stone-100 p-1">
        {(["buyer", "seller"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setViewAs(item);
              setPage(1);
            }}
            className={clsx(
              "rounded-md px-4 py-2.5 text-sm font-black transition",
              viewAs === item
                ? "bg-white text-leaf-800 shadow-sm"
                : "text-stone-500 hover:text-stone-800"
            )}
          >
            {item === "buyer" ? "My purchases" : "My sales"}
          </button>
        ))}
      </div>

      {isError ? <Alert type="error">{getApiError(error)}</Alert> : null}

      {isLoading ? (
        <Spinner label="Loading orders" />
      ) : data?.orders.length ? (
        <div className="space-y-3">
          {data.orders.map((order) => (
            <OrderCard key={order._id} order={order} viewAs={viewAs} />
          ))}
          <Pagination pagination={data.pagination} onPageChange={setPage} />
        </div>
      ) : (
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" />}
          title={viewAs === "buyer" ? "No purchases yet" : "No sales yet"}
          message={
            viewAs === "buyer"
              ? "Orders you place from marketplace listings will appear here."
              : "Buyer orders for your listings will appear here."
          }
          action={
            viewAs === "buyer"
              ? { label: "Browse market", onClick: () => navigate("/") }
              : {
                  label: "Create listing",
                  onClick: () => navigate("/my-listings/new"),
                }
          }
        />
      )}

      <p className="text-center text-xs text-stone-400">
        Need a fresh order?{" "}
        <Link to="/" className="font-bold text-leaf-700">
          Open the marketplace
        </Link>
        .
      </p>
    </div>
  );
}
