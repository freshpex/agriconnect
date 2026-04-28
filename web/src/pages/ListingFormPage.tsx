import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LocateFixed, Save, Trash2 } from "lucide-react";
import {
  CROP_CATEGORIES,
  CURRENCY_OPTIONS,
  UNIT_OPTIONS,
} from "../constants/crops";
import {
  useCreateListing,
  useDeleteListing,
  useListing,
  useUpdateListing,
} from "../hooks/useListings";
import { Button } from "../components/ui/Button";
import { Input, TextArea } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Alert } from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";
import type { CropCategory } from "../types";
import { getApiError } from "../utils/format";

const emptyForm = {
  cropName: "",
  category: "other" as CropCategory,
  quantity: "",
  unit: "kg",
  pricePerUnit: "",
  currency: "NGN",
  description: "",
  images: "",
  farmAddress: "",
  harvestDate: "",
  latitude: "",
  longitude: "",
  active: true,
};

export function ListingFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: listing, isLoading } = useListing(
    mode === "edit" ? id : undefined
  );
  const createListing = useCreateListing();
  const updateListing = useUpdateListing();
  const deleteListing = useDeleteListing();
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [locationStatus, setLocationStatus] = useState("");

  const isEdit = mode === "edit";

  useEffect(() => {
    if (listing && isEdit) {
      setForm({
        cropName: listing.cropName,
        category: listing.category,
        quantity: String(listing.quantity),
        unit: listing.unit,
        pricePerUnit: String(listing.pricePerUnit),
        currency: listing.currency || "NGN",
        description: listing.description || "",
        images: listing.images?.join("\n") || "",
        farmAddress: listing.farmAddress || "",
        harvestDate: listing.harvestDate
          ? listing.harvestDate.slice(0, 10)
          : "",
        latitude: listing.coordinates?.coordinates?.[1]?.toString() || "",
        longitude: listing.coordinates?.coordinates?.[0]?.toString() || "",
        active: listing.active,
      });
    }
  }, [isEdit, listing]);

  const isSaving = createListing.isPending || updateListing.isPending;

  const parsedImages = useMemo(
    () =>
      form.images
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    [form.images]
  );

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function useCurrentLocation() {
    setLocationStatus("");
    if (!navigator.geolocation) {
      setLocationStatus("This browser does not support geolocation.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateField("latitude", String(position.coords.latitude));
        updateField("longitude", String(position.coords.longitude));
        setLocationStatus("Current location added to the listing form.");
      },
      () => setLocationStatus("Could not access your current location."),
      { enableHighAccuracy: true, timeout: 12_000 }
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    if (!form.cropName.trim() || !form.quantity || !form.pricePerUnit) {
      setMessage("Crop name, quantity, and price are required.");
      return;
    }

    try {
      if (isEdit && id) {
        await updateListing.mutateAsync({
          id,
          data: {
            cropName: form.cropName.trim(),
            category: form.category,
            quantity: Number(form.quantity),
            unit: form.unit.trim(),
            pricePerUnit: Number(form.pricePerUnit),
            description: form.description.trim() || undefined,
            active: form.active,
            farmAddress: form.farmAddress.trim() || undefined,
            harvestDate: form.harvestDate || undefined,
          },
        });
      } else {
        await createListing.mutateAsync({
          cropName: form.cropName.trim(),
          category: form.category,
          quantity: Number(form.quantity),
          unit: form.unit.trim(),
          pricePerUnit: Number(form.pricePerUnit),
          currency: form.currency,
          description: form.description.trim() || undefined,
          images: parsedImages,
          farmAddress: form.farmAddress.trim() || undefined,
          harvestDate: form.harvestDate || undefined,
          latitude: form.latitude ? Number(form.latitude) : undefined,
          longitude: form.longitude ? Number(form.longitude) : undefined,
        });
      }
      navigate("/my-listings");
    } catch (err) {
      setMessage(getApiError(err));
    }
  }

  async function removeListing() {
    if (
      !id ||
      !window.confirm(
        "Deactivate this listing? Existing orders will remain intact."
      )
    ) {
      return;
    }

    try {
      await deleteListing.mutateAsync(id);
      navigate("/my-listings");
    } catch (err) {
      setMessage(getApiError(err));
    }
  }

  if (isEdit && isLoading) return <Spinner label="Loading listing form" />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="glass-panel rounded-lg border border-stone-200 p-5 shadow-sm sm:p-6">
        <p className="inline-flex rounded-full bg-leaf-100 px-3 py-1 text-xs font-black text-leaf-800">
          {isEdit ? "Edit listing" : "Create listing"}
        </p>
        <h1 className="mt-4 text-3xl font-black text-stone-950">
          {isEdit
            ? "Update produce availability"
            : "Publish produce to the marketplace"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
          The form submits directly to the backend listing endpoints. Image
          fields accept production image URLs because there is no upload
          endpoint in this API.
        </p>
      </section>

      <form
        onSubmit={submit}
        className="space-y-5 rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
      >
        {message ? <Alert type="error">{message}</Alert> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Crop name"
            value={form.cropName}
            onChange={(event) => updateField("cropName", event.target.value)}
            placeholder="Fresh tomatoes"
          />
          <Select
            label="Category"
            value={form.category}
            onChange={(event) =>
              updateField("category", event.target.value as CropCategory)
            }
          >
            {CROP_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <Input
            label="Quantity"
            type="number"
            min="0.01"
            step="0.01"
            value={form.quantity}
            onChange={(event) => updateField("quantity", event.target.value)}
          />
          <Select
            label="Unit"
            value={form.unit}
            onChange={(event) => updateField("unit", event.target.value)}
          >
            {UNIT_OPTIONS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </Select>
          <Input
            label="Price per unit"
            type="number"
            min="0.01"
            step="0.01"
            value={form.pricePerUnit}
            onChange={(event) =>
              updateField("pricePerUnit", event.target.value)
            }
          />
          <Select
            label="Currency"
            value={form.currency}
            disabled={isEdit}
            onChange={(event) => updateField("currency", event.target.value)}
          >
            {CURRENCY_OPTIONS.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </Select>
        </div>

        <TextArea
          label="Description"
          maxLength={500}
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="Quality, packaging, pickup terms, and freshness notes"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Farm address"
            value={form.farmAddress}
            onChange={(event) => updateField("farmAddress", event.target.value)}
            placeholder="Ogun State, Nigeria"
          />
          <Input
            label="Harvest date"
            type="date"
            value={form.harvestDate}
            onChange={(event) => updateField("harvestDate", event.target.value)}
          />
        </div>

        <div className="rounded-lg border border-stone-200 bg-earth-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={form.latitude}
              disabled={isEdit}
              onChange={(event) => updateField("latitude", event.target.value)}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={form.longitude}
              disabled={isEdit}
              onChange={(event) => updateField("longitude", event.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              icon={<LocateFixed className="h-4 w-4" />}
              disabled={isEdit}
              onClick={useCurrentLocation}
            >
              Use current
            </Button>
          </div>
          {locationStatus ? (
            <p className="mt-2 text-xs font-semibold text-stone-500">
              {locationStatus}
            </p>
          ) : null}
        </div>

        {!isEdit ? (
          <TextArea
            label="Image URLs"
            value={form.images}
            onChange={(event) => updateField("images", event.target.value)}
            helper="One URL per line or comma-separated. Leave blank if you do not have production images."
          />
        ) : null}

        {isEdit ? (
          <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div>
              <p className="font-bold text-stone-950">Listing active</p>
              <p className="text-sm text-stone-500">
                Inactive listings stay hidden from the marketplace.
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateField("active", !form.active)}
              className={`relative h-7 w-12 rounded-full transition ${
                form.active ? "bg-leaf-700" : "bg-stone-300"
              }`}
              aria-label="Toggle listing active status"
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  form.active ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-between">
          {isEdit ? (
            <Button
              type="button"
              variant="danger"
              icon={<Trash2 className="h-4 w-4" />}
              isLoading={deleteListing.isPending}
              onClick={removeListing}
            >
              Deactivate
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              icon={<Save className="h-4 w-4" />}
              isLoading={isSaving}
            >
              {isEdit ? "Save changes" : "Create listing"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
