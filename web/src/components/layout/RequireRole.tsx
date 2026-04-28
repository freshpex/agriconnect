import type { ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../../state/AuthContext";
import type { Role } from "../../types";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";

export function RequireRole({
  allowedRoles,
  children,
}: {
  allowedRoles: Role[];
  children: ReactNode;
}) {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (auth.isLoading) return <Spinner label="Checking account access" />;

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!auth.user || !allowedRoles.includes(auth.user.role)) {
    return (
      <section className="mx-auto max-w-2xl rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-amber-700 ring-1 ring-amber-100">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-black uppercase text-amber-700">
              Farmer access required
            </p>
            <h1 className="mt-2 text-2xl font-black text-stone-950">
              Listings are only available to farmer accounts.
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              Buyer accounts cannot create, edit, deactivate, or manage produce
              listings. Request an account type change from your profile
              settings to unlock farmer listing tools after approval.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={() => navigate("/profile?farmerAccess=required")}
              >
                Request farmer access
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
              >
                Back to market
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
