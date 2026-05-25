import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "@/context/AuthContext";

const loadingShellClassName =
  "grid min-h-screen place-items-center bg-[#e8e1d8] px-4 font-circular text-[#3f3b37]";
const loadingCardClassName =
  "rounded-2xl border border-white/55 bg-white/58 px-6 py-5 text-sm font-medium shadow-[0_20px_70px_rgba(66,53,42,0.12)] backdrop-blur-xl";

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className={loadingShellClassName}>
        <div className={loadingCardClassName}>Loading your library...</div>
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
        <div className={loadingCardClassName}>Checking your session...</div>
      </div>
    );
  }

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
