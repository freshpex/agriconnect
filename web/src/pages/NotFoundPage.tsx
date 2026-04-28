import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-full bg-leaf-50 p-5 text-leaf-700">
        <Compass className="h-10 w-10" />
      </div>
      <h1 className="mt-5 text-3xl font-black text-stone-950">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-stone-500">
        That route is not part of the AgriConnect web app.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-lg bg-leaf-700 px-4 py-2 text-sm font-bold text-white shadow-lift hover:bg-leaf-800"
      >
        Back to market
      </Link>
    </div>
  );
}
