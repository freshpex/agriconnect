import { FormEvent, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  LocateFixed,
  MapPin,
  PackagePlus,
  Phone,
  Save,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";
import { useAuth } from "../state/AuthContext";
import {
  useRequestFarmerAccess,
  useUpdateProfile,
  useVerifyKyc,
  useVerifyLocation,
  useVerifyNumber,
} from "../hooks/useFarmer";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input, TextArea } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { getApiError } from "../utils/format";

export function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const updateProfile = useUpdateProfile();
  const requestFarmerAccess = useRequestFarmerAccess();
  const verifyKyc = useVerifyKyc();
  const verifyNumber = useVerifyNumber();
  const verifyLocation = useVerifyLocation();

  const [profile, setProfile] = useState({ name: "", farmAddress: "" });
  const [kyc, setKyc] = useState({
    nationalId: "",
    fullName: "",
    dateOfBirth: "",
  });
  const [location, setLocation] = useState({
    latitude: "",
    longitude: "",
    radius: "5000",
  });
  const [farmerAccessNote, setFarmerAccessNote] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        farmAddress: user.farmAddress || "",
      });
      if (user.farmCoordinates) {
        setLocation((current) => ({
          ...current,
          latitude: String(user.farmCoordinates?.latitude || ""),
          longitude: String(user.farmCoordinates?.longitude || ""),
        }));
      }
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "buyer" && searchParams.get("farmerAccess")) {
      setMessage({
        type: "info",
        text: "Only farmer accounts can manage listings. Request a farmer account type change below.",
      });
    }
  }, [searchParams, user?.role]);

  if (isLoading || !user) return <Spinner label="Loading profile" />;

  const farmerAccessRequest = user.accountTypeChangeRequest;
  const farmerAccessPending = farmerAccessRequest?.status === "pending";

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    try {
      await updateProfile.mutateAsync({
        name: profile.name.trim(),
        farmAddress: profile.farmAddress.trim() || undefined,
      });
      setMessage({ type: "success", text: "Profile updated." });
    } catch (err) {
      setMessage({ type: "error", text: getApiError(err) });
    }
  }

  async function submitFarmerAccessRequest(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    try {
      const response = await requestFarmerAccess.mutateAsync({
        note: farmerAccessNote.trim() || undefined,
      });
      setFarmerAccessNote("");
      setMessage({ type: "success", text: response.data.message });
    } catch (err) {
      setMessage({ type: "error", text: getApiError(err) });
    }
  }

  async function submitKyc(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    try {
      const response = await verifyKyc.mutateAsync(kyc);
      setMessage({
        type: response.data.kycVerified ? "success" : "error",
        text: response.data.message,
      });
    } catch (err) {
      setMessage({ type: "error", text: getApiError(err) });
    }
  }

  async function submitNumberVerification() {
    setMessage(null);
    try {
      const response = await verifyNumber.mutateAsync();
      setMessage({
        type: response.data.numberVerified ? "success" : "info",
        text: response.data.message,
      });
    } catch (err) {
      setMessage({ type: "error", text: getApiError(err) });
    }
  }

  async function submitLocation(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    try {
      const response = await verifyLocation.mutateAsync({
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        radius: location.radius ? Number(location.radius) : undefined,
      });
      setMessage({
        type: response.data.locationVerified ? "success" : "error",
        text: response.data.message,
      });
    } catch (err) {
      setMessage({ type: "error", text: getApiError(err) });
    }
  }

  function useCurrentLocation() {
    setMessage(null);
    if (!navigator.geolocation) {
      setMessage({
        type: "error",
        text: "This browser does not support geolocation.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation((current) => ({
          ...current,
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
        }));
        setMessage({ type: "success", text: "Current location captured." });
      },
      () =>
        setMessage({
          type: "error",
          text: "Could not access your current location.",
        }),
      { enableHighAccuracy: true, timeout: 12_000 }
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="bg-leaf-900 p-6 text-white sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white/10 text-white ring-1 ring-white/15">
                <UserRound className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black">{user.name}</h1>
                <p className="mt-1 text-sm text-leaf-100">{user.phone}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="green">{user.role}</Badge>
              {user.kycVerified ? (
                <Badge tone="blue">KYC verified</Badge>
              ) : null}
              {user.locationVerified ? (
                <Badge tone="amber">Location verified</Badge>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {message ? <Alert type={message.type}>{message.text}</Alert> : null}

      {user.role === "buyer" ? (
        <form
          onSubmit={submitFarmerAccessRequest}
          className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <div className="rounded-lg bg-leaf-50 p-3 text-leaf-700">
                <PackagePlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-stone-950">
                  Account type change
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-500">
                  Buyer accounts can purchase produce only. Request farmer
                  access here if you need to create and manage produce
                  listings.
                </p>
              </div>
            </div>
            {farmerAccessRequest ? (
              <Badge
                tone={
                  farmerAccessRequest.status === "rejected" ? "red" : "amber"
                }
                className="capitalize"
              >
                {farmerAccessRequest.status}
              </Badge>
            ) : null}
          </div>

          {farmerAccessPending ? (
            <Alert type="info" className="mt-5">
              Your farmer access request is pending review. Listing tools will
              stay locked until your account type is changed to farmer.
            </Alert>
          ) : (
            <div className="mt-5 space-y-4">
              {farmerAccessRequest?.status === "rejected" ? (
                <Alert type="error">
                  Your last farmer access request was rejected. You can submit a
                  new request with more detail.
                </Alert>
              ) : null}
              <TextArea
                label="Request note"
                maxLength={500}
                value={farmerAccessNote}
                onChange={(event) => setFarmerAccessNote(event.target.value)}
                placeholder="Tell the team what crops or farm business you want to list."
              />
              <Button
                type="submit"
                icon={<PackagePlus className="h-4 w-4" />}
                isLoading={requestFarmerAccess.isPending}
              >
                Request farmer access
              </Button>
            </div>
          )}
        </form>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="space-y-6">
          <form
            onSubmit={saveProfile}
            className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-leaf-50 p-3 text-leaf-700">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-stone-950">Profile</h2>
                <p className="text-sm text-stone-500">
                  Update the fields accepted by the backend profile endpoint.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Name"
                value={profile.name}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
              <Input
                label="Farm address"
                value={profile.farmAddress}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    farmAddress: event.target.value,
                  }))
                }
                placeholder="Farm, town, state"
              />
            </div>
            <Button
              type="submit"
              className="mt-5"
              icon={<Save className="h-4 w-4" />}
              isLoading={updateProfile.isPending}
            >
              Save profile
            </Button>
          </form>

          <form
            onSubmit={submitKyc}
            className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-sky-50 p-3 text-sky-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-stone-950">KYC match</h2>
                <p className="text-sm text-stone-500">
                  Verify identity against telco records.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="National ID"
                value={kyc.nationalId}
                onChange={(event) =>
                  setKyc((current) => ({
                    ...current,
                    nationalId: event.target.value,
                  }))
                }
              />
              <Input
                label="Full name"
                value={kyc.fullName}
                onChange={(event) =>
                  setKyc((current) => ({
                    ...current,
                    fullName: event.target.value,
                  }))
                }
              />
              <Input
                label="Date of birth"
                type="date"
                value={kyc.dateOfBirth}
                onChange={(event) =>
                  setKyc((current) => ({
                    ...current,
                    dateOfBirth: event.target.value,
                  }))
                }
              />
            </div>
            <Button
              type="submit"
              className="mt-5"
              isLoading={verifyKyc.isPending}
              disabled={Boolean(user.kycVerified)}
            >
              {user.kycVerified ? "KYC already verified" : "Verify KYC"}
            </Button>
          </form>

          <form
            onSubmit={submitLocation}
            className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-sun-100 p-3 text-sun-700">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-stone-950">
                  Farm location
                </h2>
                <p className="text-sm text-stone-500">
                  Confirm that your phone is near the farm coordinates.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Latitude"
                type="number"
                step="any"
                value={location.latitude}
                onChange={(event) =>
                  setLocation((current) => ({
                    ...current,
                    latitude: event.target.value,
                  }))
                }
              />
              <Input
                label="Longitude"
                type="number"
                step="any"
                value={location.longitude}
                onChange={(event) =>
                  setLocation((current) => ({
                    ...current,
                    longitude: event.target.value,
                  }))
                }
              />
              <Input
                label="Radius (meters)"
                type="number"
                min="100"
                max="100000"
                value={location.radius}
                onChange={(event) =>
                  setLocation((current) => ({
                    ...current,
                    radius: event.target.value,
                  }))
                }
              />
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                icon={<LocateFixed className="h-4 w-4" />}
                onClick={useCurrentLocation}
              >
                Use current location
              </Button>
              <Button type="submit" isLoading={verifyLocation.isPending}>
                Verify location
              </Button>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <VerificationCard
            title="KYC match"
            icon={<ShieldCheck className="h-5 w-5" />}
            verified={Boolean(user.kycVerified)}
            description="Identity check"
          />
          <VerificationCard
            title="Phone number"
            icon={<Phone className="h-5 w-5" />}
            verified={Boolean(user.numberVerified)}
            description="Network phone verification"
            action={
              <Button
                variant="outline"
                className="mt-4 w-full"
                isLoading={verifyNumber.isPending}
                onClick={submitNumberVerification}
              >
                Verify phone
              </Button>
            }
          />
          <VerificationCard
            title="Farm location"
            icon={<MapPin className="h-5 w-5" />}
            verified={Boolean(user.locationVerified)}
            description="Location verification"
          />
          <VerificationCard
            title="SIM swap"
            icon={<Smartphone className="h-5 w-5" />}
            verified={Boolean(user.simSwapChecked)}
            description="Checked automatically during auth"
          />
        </aside>
      </div>
    </div>
  );
}

function VerificationCard({
  title,
  icon,
  verified,
  description,
  action,
}: {
  title: string;
  icon: ReactNode;
  verified: boolean;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="rounded-lg bg-leaf-50 p-3 text-leaf-700">{icon}</div>
          <div>
            <p className="font-black text-stone-950">{title}</p>
            <p className="mt-1 text-sm text-stone-500">{description}</p>
          </div>
        </div>
        {verified ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-leaf-600" />
        ) : (
          <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-bold text-stone-500">
            Pending
          </span>
        )}
      </div>
      {action}
    </div>
  );
}
