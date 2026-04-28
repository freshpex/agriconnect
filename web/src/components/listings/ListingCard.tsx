import { Link } from "react-router-dom";
import { Eye, MapPin, ShieldCheck, Star, Truck } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { Listing } from "../../types";
import {
  formatCurrency,
  getCategoryLabel,
  getFarmer,
  initials,
  timeAgo,
} from "../../utils/format";

export function ListingCard({ listing }: { listing: Listing }) {
  const farmer = getFarmer(listing);
  const image = listing.images?.[0];

  return (
    <Link
      to={`/listings/${listing._id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-leaf-300 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-leaf-100 via-earth-100 to-sun-100">
        {image ? (
          <img
            src={image}
            alt={listing.cropName}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl font-black text-leaf-800/70">
            {initials(listing.cropName)}
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Badge tone="green">{getCategoryLabel(listing.category)}</Badge>
        </div>
        {listing.locationVerified ? (
          <div className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-leaf-700 shadow-sm">
            <ShieldCheck className="h-4 w-4" />
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black text-stone-950">
              {listing.cropName}
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              {farmer ? `by ${farmer.name}` : "Seller profile loading"}
            </p>
          </div>
          <p className="whitespace-nowrap text-xs font-semibold text-stone-400">
            {timeAgo(listing.createdAt)}
          </p>
        </div>

        <div className="mt-4 flex items-baseline gap-1">
          <p className="text-2xl font-black text-leaf-800">
            {formatCurrency(listing.pricePerUnit, listing.currency)}
          </p>
          <span className="text-sm font-semibold text-stone-400">
            /{listing.unit}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone={listing.quantity > 0 ? "green" : "red"}>
            {listing.quantity} {listing.unit} available
          </Badge>
          {farmer?.kycVerified ? <Badge tone="blue">KYC verified</Badge> : null}
        </div>

        <div className="mt-auto grid gap-2 pt-4 text-sm text-stone-500">
          {listing.farmAddress ? (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sun-600" />
              <span className="truncate">{listing.farmAddress}</span>
            </span>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-stone-400" />
              {listing.views} views
            </span>
            {farmer?.rating ? (
              <span className="flex items-center gap-1 font-semibold text-stone-700">
                <Star className="h-4 w-4 fill-sun-400 text-sun-400" />
                {farmer.rating.toFixed(1)}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-stone-400" />
                Ready to trade
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
