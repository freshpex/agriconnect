import { Link, useNavigate } from "react-router-dom";
import { Edit3, PackagePlus, Trash2 } from "lucide-react";
import { useDeleteListing, useMyListings } from "../hooks/useListings";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import { Pagination } from "../components/ui/Pagination";
import { formatCurrency, getApiError, getCategoryLabel } from "../utils/format";
import { useState } from "react";

export function MyListingsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useMyListings({
    page,
    limit: 20,
  });
  const deleteListing = useDeleteListing();
  const [message, setMessage] = useState("");

  async function remove(id: string, cropName: string) {
    if (!window.confirm(`Deactivate "${cropName}"?`)) return;
    setMessage("");
    try {
      await deleteListing.mutateAsync(id);
    } catch (err) {
      setMessage(getApiError(err));
    }
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-lg border border-stone-200 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-leaf-100 px-3 py-1 text-xs font-black text-leaf-800">
              Farmer tools
            </p>
            <h1 className="mt-4 text-3xl font-black text-stone-950">
              My listings
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Manage produce inventory using the authenticated listing
              endpoints.
            </p>
          </div>
          <Button
            icon={<PackagePlus className="h-4 w-4" />}
            onClick={() => navigate("/my-listings/new")}
          >
            New listing
          </Button>
        </div>
      </section>

      {message ? <Alert type="error">{message}</Alert> : null}
      {isError ? <Alert type="error">{getApiError(error)}</Alert> : null}

      {isLoading ? (
        <Spinner label="Loading your listings" />
      ) : data?.listings.length ? (
        <div className="space-y-3">
          {data.listings.map((listing) => (
            <div
              key={listing._id}
              className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/listings/${listing._id}`}
                      className="text-lg font-black text-stone-950 hover:text-leaf-800"
                    >
                      {listing.cropName}
                    </Link>
                    <Badge tone={listing.active ? "green" : "stone"}>
                      {listing.active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge tone="blue">
                      {getCategoryLabel(listing.category)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-stone-500">
                    {listing.quantity} {listing.unit} available at{" "}
                    <span className="font-bold text-leaf-800">
                      {formatCurrency(listing.pricePerUnit, listing.currency)}
                    </span>{" "}
                    per {listing.unit}
                  </p>
                  {listing.farmAddress ? (
                    <p className="mt-1 text-sm text-stone-400">
                      {listing.farmAddress}
                    </p>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    icon={<Edit3 className="h-4 w-4" />}
                    onClick={() => navigate(`/my-listings/${listing._id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    icon={<Trash2 className="h-4 w-4" />}
                    isLoading={deleteListing.isPending}
                    onClick={() => remove(listing._id, listing.cropName)}
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
            </div>
          ))}
          <Pagination pagination={data.pagination} onPageChange={setPage} />
        </div>
      ) : (
        <EmptyState
          title="No listings yet"
          message="Create your first produce listing to start receiving buyer orders."
          action={{
            label: "Create listing",
            onClick: () => navigate("/my-listings/new"),
          }}
        />
      )}
    </div>
  );
}
