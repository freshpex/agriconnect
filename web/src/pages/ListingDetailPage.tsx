import { FormEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  Edit3,
  Eye,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { useListing } from "../hooks/useListings";
import { useCreateOrder } from "../hooks/useOrders";
import { useCreateReport } from "../hooks/useReports";
import { useAuth } from "../state/AuthContext";
import { ListingMap } from "../components/maps/ListingMap";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input, TextArea } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Alert } from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";
import { EmptyState } from "../components/ui/EmptyState";
import {
  formatCurrency,
  formatDate,
  getApiError,
  getCategoryLabel,
  getFarmer,
  initials,
} from "../utils/format";

export function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: listing, isLoading, isError, error } = useListing(id);
  const createOrder = useCreateOrder();
  const createReport = useCreateReport();
  const [quantity, setQuantity] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [orderOpen, setOrderOpen] = useState(false);
  const [reportReason, setReportReason] = useState("scam");
  const [reportDescription, setReportDescription] = useState("");
  const [reportMessage, setReportMessage] = useState("");

  const farmer = listing ? getFarmer(listing) : null;
  const isOwnListing = useMemo(() => {
    if (!listing || !user) return false;
    const farmerId =
      typeof listing.farmer === "string" ? listing.farmer : listing.farmer?._id;
    return farmerId === user.id || farmerId === user._id;
  }, [listing, user]);
  const canManageOwnListing = user?.role === "farmer" && isOwnListing;

  if (isLoading) return <Spinner label="Loading listing" />;

  if (isError || !listing) {
    return (
      <EmptyState
        title="Listing not available"
        message={getApiError(error) || "The listing could not be loaded."}
      />
    );
  }

  const image = listing.images?.[0];
  const total =
    quantity && Number(quantity) > 0
      ? Number(quantity) * listing.pricePerUnit
      : 0;
  const coordinates = listing.coordinates?.coordinates;
  const hasCoordinates = Array.isArray(coordinates) && coordinates.length === 2;
  const latitude = hasCoordinates ? coordinates![1] : undefined;
  const longitude = hasCoordinates ? coordinates![0] : undefined;

  async function submitOrder(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    if (!listing) return;
    const amount = Number(quantity);

    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/listings/${id}` } } });
      return;
    }

    if (!amount || amount <= 0) {
      setMessage("Enter a valid quantity.");
      return;
    }

    if (amount > listing.quantity) {
      setMessage("Requested quantity exceeds available stock.");
      return;
    }

    try {
      await createOrder.mutateAsync({
        listingId: listing._id,
        quantity: amount,
        deliveryAddress: deliveryAddress.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      navigate("/orders");
    } catch (err) {
      setMessage(getApiError(err));
    }
  }

  async function submitReport(event: FormEvent) {
    event.preventDefault();
    setReportMessage("");

    if (!listing) {
      setReportMessage("Listing details are missing.");
      return;
    }

    if (!isAuthenticated) {
      setReportMessage("Sign in to report issues.");
      return;
    }

    try {
      await createReport.mutateAsync({
        targetType: "listing",
        targetId: listing._id,
        reason: reportReason,
        description: reportDescription.trim() || undefined,
      });
      setReportMessage("Report submitted. Our admin team will review it.");
      setReportDescription("");
    } catch (err) {
      setReportMessage(getApiError(err));
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
      <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-leaf-100 via-earth-100 to-sun-100">
          {image ? (
            <img
              src={image}
              alt={listing.cropName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-7xl font-black text-leaf-800/70">
              {initials(listing.cropName)}
            </div>
          )}
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Badge tone="green">{getCategoryLabel(listing.category)}</Badge>
            <Badge tone={listing.active ? "green" : "red"}>
              {listing.active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-black text-stone-950">
                {listing.cropName}
              </h1>
              <p className="mt-2 text-sm text-stone-500">
                Listed by {farmer?.name || "AgriConnect seller"}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-3xl font-black text-leaf-800">
                {formatCurrency(listing.pricePerUnit, listing.currency)}
              </p>
              <p className="text-sm font-semibold text-stone-500">
                per {listing.unit}
              </p>
            </div>
          </div>

          {listing.description ? (
            <div>
              <h2 className="text-sm font-black uppercase text-stone-400">
                Description
              </h2>
              <p className="mt-2 leading-7 text-stone-700">
                {listing.description}
              </p>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile
              icon={<Package className="h-5 w-5" />}
              label="Available quantity"
              value={`${listing.quantity} ${listing.unit}`}
            />
            <InfoTile
              icon={<CalendarDays className="h-5 w-5" />}
              label="Harvest date"
              value={formatDate(listing.harvestDate)}
            />
            {typeof listing.trustScore === "number" ? (
              <InfoTile
                icon={<ShieldCheck className="h-5 w-5" />}
                label="Trust score"
                value={`${listing.trustScore}/100 (${listing.trustDecision || "pending"})`}
              />
            ) : null}
            <InfoTile
              icon={<Eye className="h-5 w-5" />}
              label="Views"
              value={`${listing.views}`}
            />
            <InfoTile
              icon={<MapPin className="h-5 w-5" />}
              label="Farm location"
              value={listing.farmAddress || "Not provided"}
            />
          </div>

          {hasCoordinates &&
          latitude !== undefined &&
          longitude !== undefined ? (
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <h2 className="text-sm font-black uppercase text-stone-400">
                Farm location map
              </h2>
              <div className="mt-3">
                <ListingMap
                  latitude={latitude}
                  longitude={longitude}
                  label={listing.farmAddress || listing.cropName}
                />
              </div>
            </div>
          ) : null}

          <div className="rounded-lg border border-stone-200 bg-earth-50 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-leaf-700">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-black text-stone-950">
                    {farmer?.name || "Seller"}
                  </p>
                  <p className="text-sm text-stone-500">
                    {farmer?.phone || "Phone hidden"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {farmer?.kycVerified ? (
                  <Badge tone="green">KYC verified</Badge>
                ) : null}
                {farmer?.locationVerified || listing.locationVerified ? (
                  <Badge tone="blue">Location verified</Badge>
                ) : null}
                {farmer?.rating ? (
                  <Badge tone="amber">{farmer.rating.toFixed(1)} rating</Badge>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        {canManageOwnListing ? (
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-stone-950">
              This is your listing
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Update availability, price, and listing status from your listing
              tools.
            </p>
            <Button
              className="mt-5 w-full"
              icon={<Edit3 className="h-4 w-4" />}
              onClick={() => navigate(`/my-listings/${listing._id}/edit`)}
            >
              Edit listing
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-stone-950">
              Place an order
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Orders use the protected backend endpoint and reduce stock
              atomically.
            </p>

            {!isAuthenticated ? (
              <div className="mt-5">
                <Alert type="info">
                  Sign in to place an order for this produce.
                </Alert>
                <Button
                  className="mt-4 w-full"
                  onClick={() => navigate("/login")}
                >
                  Sign in to buy
                </Button>
              </div>
            ) : !orderOpen ? (
              <Button
                className="mt-5 w-full"
                icon={<ShoppingCart className="h-4 w-4" />}
                onClick={() => setOrderOpen(true)}
                disabled={!listing.active || listing.quantity <= 0}
              >
                {listing.quantity > 0 ? "Buy now" : "Out of stock"}
              </Button>
            ) : (
              <form className="mt-5 space-y-4" onSubmit={submitOrder}>
                {message ? <Alert type="error">{message}</Alert> : null}
                <Input
                  label={`Quantity (${listing.unit})`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder={`Max ${listing.quantity}`}
                />
                <Input
                  label="Delivery address"
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  placeholder="Where should the produce go?"
                />
                <TextArea
                  label="Notes"
                  maxLength={300}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Delivery window, packaging, or pickup notes"
                />
                <div className="rounded-lg bg-leaf-50 p-4">
                  <p className="text-sm font-semibold text-stone-500">
                    Estimated total
                  </p>
                  <p className="mt-1 text-2xl font-black text-leaf-800">
                    {formatCurrency(total, listing.currency)}
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={createOrder.isPending}
                >
                  Confirm order
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setOrderOpen(false)}
                >
                  Cancel
                </Button>
              </form>
            )}
          </div>
        )}

        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-stone-950">Report issue</h2>
          <p className="mt-2 text-sm text-stone-500">
            Flag scams, wrong locations, or disputes for admin review.
          </p>
          {reportMessage ? (
            <Alert
              type={reportMessage.includes("submitted") ? "success" : "info"}
              className="mt-4"
            >
              {reportMessage}
            </Alert>
          ) : null}
          <form className="mt-4 space-y-3" onSubmit={submitReport}>
            <Select
              label="Reason"
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
            >
              <option value="scam">Possible scam/fraud</option>
              <option value="location">Wrong or fake location</option>
              <option value="quality">Quality/condition dispute</option>
              <option value="other">Other</option>
            </Select>
            <TextArea
              label="Details"
              maxLength={1000}
              value={reportDescription}
              onChange={(event) => setReportDescription(event.target.value)}
              placeholder="Share relevant details for review"
            />
            <Button
              type="submit"
              className="w-full"
              variant="outline"
              isLoading={createReport.isPending}
              disabled={!isAuthenticated}
            >
              Submit report
            </Button>
          </form>
        </div>

        <Link
          to="/"
          className="block rounded-lg border border-stone-200 bg-white p-4 text-center text-sm font-bold text-leaf-700 shadow-sm hover:bg-leaf-50"
        >
          Back to marketplace
        </Link>
      </aside>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="flex items-center gap-2 text-leaf-700">{icon}</div>
      <p className="mt-3 text-xs font-black uppercase text-stone-400">
        {label}
      </p>
      <p className="mt-1 font-bold text-stone-900">{value}</p>
    </div>
  );
}
