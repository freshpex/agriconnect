import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Home,
  Leaf,
  LogOut,
  Menu,
  PackagePlus,
  UserRound,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { useAuth } from "../../state/AuthContext";
import type { Role } from "../../types";
import { ApiStatus } from "./ApiStatus";
import { LanguageSelector } from "./LanguageSelector";
import { MobileAppPrompt } from "./MobileAppPrompt";
import { PwaUpdatePrompt } from "./PwaUpdatePrompt";
import { Button } from "../ui/Button";

const navItems: Array<{
  to: string;
  label: string;
  icon: typeof Home;
  roles?: Role[];
}> = [
  { to: "/", label: "Market", icon: Home },
  {
    to: "/my-listings",
    label: "Listings",
    icon: PackagePlus,
    roles: ["farmer"],
  },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/profile", label: "Profile", icon: UserRound },
];

function getVisibleNavItems(role?: Role) {
  return navItems.filter(
    (item) => !item.roles || Boolean(role && item.roles.includes(role))
  );
}

function NavItems({
  items,
  onNavigate,
}: {
  items: typeof navItems;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                isActive
                  ? "bg-leaf-700 text-white shadow-lift"
                  : "text-stone-600 hover:bg-leaf-50 hover:text-leaf-800"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const visibleNavItems = getVisibleNavItems(user?.role);

  function signOut() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-earth-50 text-stone-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-stone-200 bg-white/90 p-5 backdrop-blur lg:block">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3">
            <img
              src="/icon.png"
              alt="AgriConnect"
              className="h-11 w-11 rounded-lg"
            />
            <div>
              <p className="text-base font-black text-leaf-900">AgriConnect</p>
              <p className="text-xs font-semibold text-stone-500">
                Verified produce market
              </p>
            </div>
          </div>

          <div className="mt-8">
            <NavItems items={visibleNavItems} />
          </div>

          <div className="mt-auto rounded-lg border border-stone-200 bg-earth-50 p-4">
            <p className="text-sm font-bold text-stone-950">{user?.name}</p>
            <p className="mt-0.5 text-xs text-stone-500">{user?.phone}</p>
            <p className="mt-3 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-bold capitalize text-leaf-800 ring-1 ring-leaf-100">
              {user?.role || "member"}
            </p>
            <Button
              type="button"
              variant="ghost"
              className="mt-3 w-full justify-start text-red-600 hover:bg-red-50"
              icon={<LogOut className="h-4 w-4" />}
              onClick={signOut}
            >
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-stone-200 bg-earth-50/90 backdrop-blur lg:pl-72">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="rounded-lg border border-stone-200 bg-white p-2 text-stone-700 lg:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-stone-950 sm:text-base">
              {user ? `Welcome, ${user.name}` : "AgriConnect Market"}
            </p>
            <p className="hidden text-xs text-stone-500 sm:block">
              Buy and sell verified farm produce with network checks built in.
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ApiStatus />
            <LanguageSelector />
          </div>
        </div>
      </header>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 bg-stone-950/40 lg:hidden">
          <div className="h-full w-80 max-w-[85vw] bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-leaf-50 p-2 text-leaf-700">
                  <Leaf className="h-5 w-5" />
                </div>
                <p className="font-black text-leaf-900">AgriConnect</p>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-8">
              <NavItems
                items={visibleNavItems}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              className="mt-8 w-full justify-start text-red-600 hover:bg-red-50"
              icon={<LogOut className="h-4 w-4" />}
              onClick={signOut}
            >
              Sign out
            </Button>
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:ml-72 lg:px-8">
        <Outlet />
      </main>

      <MobileAppPrompt />
      <PwaUpdatePrompt />

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 px-2 py-2 shadow-soft backdrop-blur lg:hidden">
        <div
          className={clsx(
            "grid gap-1",
            visibleNavItems.length === 3 ? "grid-cols-3" : "grid-cols-4"
          )}
        >
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  clsx(
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-xs font-bold transition",
                    isActive
                      ? "bg-leaf-700 text-white"
                      : "text-stone-500 hover:bg-leaf-50 hover:text-leaf-800"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
