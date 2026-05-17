import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "@/context/AuthContext";

const loadingShellClassName =
  "grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.12),transparent_18%),linear-gradient(180deg,#fff8f1_0%,#f4f1eb_48%,#efece6_100%)] px-4";

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className={loadingShellClassName}>
        <div className="rounded-3xl border border-stone-200/70 bg-white/85 px-6 py-5 text-sm font-medium text-stone-600 shadow-xl backdrop-blur">
          Loading your library...
        </div>
      </div>
    );
  }

  if (status === "guest") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className={loadingShellClassName}>
        <div className="rounded-3xl border border-stone-200/70 bg-white/85 px-6 py-5 text-sm font-medium text-stone-600 shadow-xl backdrop-blur">
          Checking your session...
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
