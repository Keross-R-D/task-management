import { isAuthenticated } from "@/features/auth/authSlice";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { appPath } from "@/utils/basePath";
import { useGetCurrentUserRolesAndGroupsQuery } from "@/features/auth/authApiSlice";

export const ProtectedRoute = () => {
  const authenticated = useSelector(isAuthenticated);
  const { isLoading } = useGetCurrentUserRolesAndGroupsQuery(undefined, {
    skip: !authenticated, // Only fetch if authenticated
  });

  if (!authenticated) {
    // Hard redirect required: main.tsx uses a static pathname check
    // to decide which React tree to render (LoginPage vs ProviderWrapper).
    // A soft <Navigate> only updates the URL without re-mounting the root.
    window.location.href = appPath("/login");
    return null;
  }

  if (isLoading) {
    return <div>Loading...</div>; // or a proper loading spinner
  }

  return <Outlet />;
};
