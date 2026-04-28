import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LocateFixed, Search, SlidersHorizontal, Store } from "lucide-react";
import clsx from "clsx";
import { CROP_CATEGORIES } from "../constants/crops";
import { useListings } from "../hooks/useListings";
import { ListingCard } from "../components/listings/ListingCard";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import { Pagination } from "../components/ui/Pagination";
import type { CropCategory, ListingFilters } from "../types";
import { getApiError } from "../utils/format";

export function MarketplacePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CropCategory | "">("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    radius: number;
  } | null>(null);
  const [locationError, setLocationError] = useState("");

  const filters = useMemo<ListingFilters>(
    () => ({
      search: search.trim() || undefined,
      category: category || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      latitude: location?.latitude,
      longitude: location?.longitude,
      radius: location?.radius,
      page,
      limit: 12,
    }),
    [category, location, maxPrice, minPrice, page, search]
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useListings(filters);

  function submit(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    refetch();
  }

  function useMyLocation() {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("This browser does not support geolocation.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          radius: 50,
        });
        setPage(1);
      },
      () => setLocationError("Could not access your current location."),
      { enableHighAccuracy: true, timeout: 12_000 }
    );
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-lg border border-stone-200 p-5 shadow-sm sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="inline-flex rounded-full bg-sun-100 px-3 py-1 text-xs font-black text-sun-800">
              Live marketplace
            </p>
            <h1 className="mt-4 max-w-2xl text-3xl font-black text-stone-950 sm:text-4xl">
              Find available produce from verified farmers.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
              Search the real listings endpoint, filter by category and price,
              or use proximity when location-tagged listings are available.
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-leaf-50 p-3 text-leaf-700">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-stone-950">
                  {data?.pagination.total ?? 0}
                </p>
                <p className="text-xs font-semibold text-stone-500">
                  Listings returned by the API
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="app-panel p-4">
        <form
          onSubmit={submit}
          className="grid gap-3 lg:grid-cols-[1fr_9rem_9rem_auto]"
        >
          <label className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2.5">
            <Search className="h-4 w-4 text-stone-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search crops, descriptions, farms"
              className="w-full border-0 bg-transparent text-sm outline-none"
            />
          </label>
          <Input
            label="Min price"
            className="py-2"
            type="number"
            min="0"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />
          <Input
            label="Max price"
            className="py-2"
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
          <Button
            type="submit"
            icon={<SlidersHorizontal className="h-4 w-4" />}
          >
            Apply
          </Button>
        </form>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              setCategory("");
              setPage(1);
            }}
            className={clsx(
              "whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition",
              category === ""
                ? "bg-leaf-700 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-leaf-50 hover:text-leaf-800"
            )}
          >
            All
          </button>
          {CROP_CATEGORIES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setCategory(item.value);
                setPage(1);
              }}
              className={clsx(
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition",
                category === item.value
                  ? "bg-leaf-700 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-leaf-50 hover:text-leaf-800"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-stone-500">
            {location ? (
              <span>
                Showing within {location.radius}km of your browser location.
              </span>
            ) : (
              <span>Location filter is off.</span>
            )}
          </div>
          <div className="flex gap-2">
            {location ? (
              <Button variant="ghost" onClick={() => setLocation(null)}>
                Clear location
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              icon={<LocateFixed className="h-4 w-4" />}
              onClick={useMyLocation}
            >
              Use my location
            </Button>
          </div>
        </div>
        {locationError ? (
          <Alert type="error" className="mt-3">
            {locationError}
          </Alert>
        ) : null}
      </section>

      {isError ? (
        <Alert type="error">{getApiError(error)}</Alert>
      ) : isLoading ? (
        <Spinner label="Loading marketplace" />
      ) : data?.listings.length ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-stone-500">
              {isFetching
                ? "Refreshing..."
                : `${data.pagination.total} listings found`}
            </p>
            <Link
              to="/my-listings/new"
              className="text-sm font-bold text-leaf-700"
            >
              Create listing
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
          <Pagination pagination={data.pagination} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState
          title="No listings found"
          message="Try another search or clear filters. New listings will appear here as farmers publish them."
          action={{
            label: "Create listing",
            onClick: () => navigate("/my-listings/new"),
          }}
        />
      )}
    </div>
  );
}
