import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  MapPin,
  PhoneCall,
  RadioTower,
  Truck,
  XCircle,
} from "lucide-react";
import { useDeviceStatus } from "../hooks/useFarmer";
import { useOrder, useUpdateOrderStatus } from "../hooks/useOrders";
import { useAuth } from "../state/AuthContext";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import type { OrderStatus } from "../types";
import { formatCurrency, formatDate, getApiError } from "../utils/format";

const statusMeta: Record<
  OrderStatus,
  {
    label: string;
    tone: "amber" | "blue" | "purple" | "green" | "red";
    icon: ReactNode;
  }
> = {
  pending: {
    label: "Pending",
    tone: "amber",
    icon: <Clock className="h-4 w-4" />,
  },
  confirmed: {
    label: "Confirmed",
    tone: "blue",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  "in-transit": {
    label: "In transit",
    tone: "purple",
    icon: <Truck className="h-4 w-4" />,
  },
  delivered: {
    label: "Delivered",
    tone: "green",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  cancelled: {
    label: "Cancelled",
    tone: "red",
    icon: <XCircle className="h-4 w-4" />,
  },
};

export function OrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: order, isLoading, isError, error } = useOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const deviceStatus = useDeviceStatus();
  const [message, setMessage] = useState("");

  if (isLoading) return <Spinner label="Loading order" />;
  if (isError || !order) {
    return (
      <EmptyState
        title="Order not available"
        message={getApiError(error) || "The order could not be loaded."}
      />
    );
  }

  const isSeller =
    order.seller?._id === user?.id || order.seller?._id === user?._id;
  const isBuyer =
    order.buyer?._id === user?.id || order.buyer?._id === user?._id;
  const counterparty = isSeller ? order.buyer : order.seller;
  const meta = statusMeta[order.status];

  const actions: Array<{ status: OrderStatus; label: string; show: boolean }> =
    [
      {
        status: "confirmed",
        label: "Confirm order",
        show: isSeller && order.status === "pending",
      },
      {
        status: "in-transit",
        label: "Mark in transit",
        show: isSeller && order.status === "confirmed",
      },
      {
        status: "delivered",
        label: "Confirm delivery",
        show: isBuyer && order.status === "in-transit",
      },
      {
        status: "cancelled",
        label: "Cancel order",
        show:
          (isBuyer || isSeller) &&
          ["pending", "confirmed"].includes(order.status),
      },
    ];

  async function changeStatus(status: OrderStatus) {
    setMessage("");
    if (!order) return;
    try {
      await updateStatus.mutateAsync({ id: order._id, status });
    } catch (err) {
      setMessage(getApiError(err));
    }
  }

  async function checkDevice() {
    setMessage("");
    if (!counterparty?._id) {
      setMessage("Counterparty profile is missing from this order.");
      return;
    }
    try {
      await deviceStatus.mutateAsync(counterparty._id);
    } catch (err) {
      setMessage(getApiError(err));
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge tone={meta.tone}>
              <span className="mr-1 inline-flex">{meta.icon}</span>
              {meta.label}
            </Badge>
            <h1 className="mt-4 text-3xl font-black text-stone-950">
              {order.listing?.cropName || "Produce order"}
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Order placed {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="rounded-lg bg-leaf-50 p-4 text-left sm:text-right">
            <p className="text-sm font-semibold text-stone-500">Total value</p>
            <p className="mt-1 text-3xl font-black text-leaf-800">
              {formatCurrency(order.totalPrice, order.currency)}
            </p>
          </div>
        </div>
      </section>

      {message ? <Alert type="error">{message}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="space-y-4">
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-stone-950">
              Produce details
            </h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Detail
                label="Quantity"
                value={`${order.quantity} ${order.unit}`}
              />
              <Detail
                label="Price per unit"
                value={formatCurrency(
                  order.listing?.pricePerUnit ||
                    order.totalPrice / order.quantity,
                  order.currency
                )}
              />
              <Detail label="Currency" value={order.currency} />
              <Detail
                label="QoD session"
                value={order.qodSessionId || "Not created"}
              />
            </dl>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-stone-950">People</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Person
                title="Buyer"
                name={order.buyer?.name}
                phone={order.buyer?.phone}
              />
              <Person
                title="Seller"
                name={order.seller?.name}
                phone={order.seller?.phone}
              />
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-stone-950">Delivery</h2>
            <div className="mt-4 flex gap-3 text-stone-600">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-sun-600" />
              <p>
                {order.deliveryAddress || "No delivery address was provided."}
              </p>
            </div>
            {order.notes ? (
              <div className="mt-4 rounded-lg bg-stone-50 p-4 text-sm text-stone-600">
                {order.notes}
              </div>
            ) : null}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-stone-950">Order actions</h2>
            <div className="mt-4 space-y-2">
              {actions.filter((action) => action.show).length ? (
                actions
                  .filter((action) => action.show)
                  .map((action) => (
                    <Button
                      key={action.status}
                      className="w-full"
                      variant={
                        action.status === "cancelled" ? "danger" : "primary"
                      }
                      isLoading={updateStatus.isPending}
                      onClick={() => changeStatus(action.status)}
                    >
                      {action.label}
                    </Button>
                  ))
              ) : (
                <Alert type="info">
                  No status action is available for you right now.
                </Alert>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-stone-950">
              Device reachability
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Check the active counterparty only when the backend authorizes a
              shared order.
            </p>
            <Button
              className="mt-4 w-full"
              variant="outline"
              icon={<RadioTower className="h-4 w-4" />}
              isLoading={deviceStatus.isPending}
              onClick={checkDevice}
            >
              Check {counterparty?.name || "counterparty"}
            </Button>
            {deviceStatus.data ? (
              <Alert
                type={deviceStatus.data.isOnline ? "success" : "info"}
                className="mt-4"
              >
                {deviceStatus.data.reachabilityStatus}
              </Alert>
            ) : null}
          </div>

          <a
            href={`tel:${counterparty?.phone || ""}`}
            className="flex items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white p-4 text-sm font-bold text-leaf-700 shadow-sm hover:bg-leaf-50"
          >
            <PhoneCall className="h-4 w-4" />
            Call {counterparty?.name || "counterparty"}
          </a>

          <Link
            to="/orders"
            className="block rounded-lg border border-stone-200 bg-white p-4 text-center text-sm font-bold text-leaf-700 shadow-sm hover:bg-leaf-50"
          >
            Back to orders
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-stone-50 p-4">
      <dt className="text-xs font-black uppercase text-stone-400">{label}</dt>
      <dd className="mt-1 font-bold text-stone-900">{value}</dd>
    </div>
  );
}

function Person({
  title,
  name,
  phone,
}: {
  title: string;
  name?: string;
  phone?: string;
}) {
  return (
    <div className="rounded-lg bg-stone-50 p-4">
      <p className="text-xs font-black uppercase text-stone-400">{title}</p>
      <p className="mt-1 font-bold text-stone-950">{name || "Unknown"}</p>
      <p className="mt-1 text-sm text-stone-500">{phone || "No phone"}</p>
    </div>
  );
}
