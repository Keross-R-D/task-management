import { isAuthenticated } from "@/features/auth/authSlice";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const authenticated = useSelector(isAuthenticated);

  if (!authenticated) {
    // Hard redirect required: main.tsx uses a static pathname check
    // to decide which React tree to render (LoginPage vs ProviderWrapper).
    // A soft <Navigate> only updates the URL without re-mounting the root.
    window.location.href = "/login";
    return null;
  }

  return <Outlet />;
};
