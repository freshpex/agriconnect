import { FormEvent, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  LockKeyhole,
  Phone,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import { COUNTRIES } from "../constants/countries";
import { useAuth } from "../state/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Alert } from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";
import { buildFullPhone, validatePhone } from "../utils/phone";
import { getApiError } from "../utils/format";
import type { Role } from "../types";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("NG");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("farmer");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const country = useMemo(
    () => COUNTRIES.find((item) => item.code === countryCode) || COUNTRIES[0],
    [countryCode]
  );

  if (auth.isLoading) return <Spinner label="Checking your session" />;
  if (auth.isAuthenticated) return <Navigate to="/" replace />;

  const destination =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname || "/";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    const phoneError = validatePhone(country, phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (mode === "register") {
      if (!name.trim()) {
        setError("Full name is required.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const fullPhone = buildFullPhone(country, phone);
      if (mode === "login") {
        await auth.login(fullPhone, password);
      } else {
        await auth.register(name.trim(), fullPhone, password, role);
      }
      navigate(destination, { replace: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-earth-50 px-4 pb-[calc(1.5rem_+_env(safe-area-inset-bottom))] pt-[calc(1.5rem_+_env(safe-area-inset-top))] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh_-_3rem_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] max-w-6xl overflow-hidden rounded-lg border border-stone-200 bg-white shadow-soft lg:grid-cols-[1fr_0.9fr]">
        <section className="relative flex flex-col justify-between overflow-hidden bg-leaf-900 p-6 text-white sm:p-10">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(120deg,#ffffff_1px,transparent_1px),linear-gradient(60deg,#ffffff_1px,transparent_1px)] [background-size:52px_52px]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <img
                src="/icon.png"
                alt="AgriConnect"
                className="h-12 w-12 rounded-lg"
              />
              <div>
                <p className="text-xl font-black">AgriConnect Market</p>
                <p className="text-sm text-leaf-100">
                  Farm trade with trust signals
                </p>
              </div>
            </div>

            <div className="mt-16 max-w-xl">
              <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-leaf-50 ring-1 ring-white/20">
                Built for African produce markets
              </p>
              <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
                Verified crops, real buyers, cleaner farm commerce.
              </h1>
              <p className="mt-5 text-base leading-7 text-leaf-50">
                List produce, verify phone and farm location, manage orders, and
                keep transactions moving with the backend checks already
                powering the mobile app.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-10 grid gap-3 sm:grid-cols-3">
            {[
              { label: "KYC match", icon: ShieldCheck },
              { label: "Phone verification", icon: Phone },
              { label: "Secure sessions", icon: LockKeyhole },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur"
                >
                  <Icon className="h-5 w-5 text-sun-300" />
                  <p className="mt-3 text-sm font-bold">{item.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex items-center p-6 sm:p-10">
          <div className="w-full">
            <div className="mb-8">
              <div className="mb-4 inline-flex rounded-full bg-leaf-50 p-3 text-leaf-700">
                <Sprout className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-black text-stone-950">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                {mode === "login"
                  ? "Sign in with the phone number registered on AgriConnect."
                  : "Start as a farmer or buyer using an E.164 compatible phone number."}
              </p>
            </div>

            {error ? (
              <Alert type="error" className="mb-5">
                {error}
              </Alert>
            ) : null}

            <form className="space-y-4" onSubmit={submit}>
              {mode === "register" ? (
                <>
                  <Input
                    label="Full name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    placeholder="Amina Okafor"
                  />
                  <div>
                    <span className="app-label">Account type</span>
                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-stone-100 p-1">
                      {(["farmer", "buyer"] as Role[]).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setRole(item)}
                          className={`rounded-md px-3 py-2 text-sm font-bold capitalize transition ${
                            role === item
                              ? "bg-white text-leaf-800 shadow-sm"
                              : "text-stone-500 hover:text-stone-800"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-[0.85fr_1fr]">
                <Select
                  label="Country"
                  value={countryCode}
                  onChange={(event) => setCountryCode(event.target.value)}
                >
                  {COUNTRIES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name} ({item.dial})
                    </option>
                  ))}
                </Select>
                <Input
                  label="Phone number"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="8012345678"
                />
              </div>

              <Input
                label="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                placeholder="At least 6 characters"
              />

              {mode === "register" ? (
                <Input
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat password"
                />
              ) : null}

              <Button
                type="submit"
                className="w-full"
                isLoading={isSubmitting}
                icon={<ArrowRight className="h-4 w-4" />}
              >
                {mode === "login" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-stone-500">
              {mode === "login" ? "No account yet?" : "Already registered?"}{" "}
              <Link
                to={mode === "login" ? "/register" : "/login"}
                className="font-bold text-leaf-700 hover:text-leaf-900"
              >
                {mode === "login" ? "Create one" : "Sign in"}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
