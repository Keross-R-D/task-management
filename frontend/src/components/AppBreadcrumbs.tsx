/**
 * AppBreadcrumbs — Syncs route segments into the ikon-react-components-lib
 * breadcrumb context so they appear in the library's header automatically.
 *
 * This component renders NO visible DOM. It is a "headless" effect that calls
 * useBreadcrumb().addBreadcrumbItems() whenever the location changes.
 *
 * Usage: keep <AppBreadcrumbs /> anywhere inside the layout tree that is
 * wrapped by ProviderWrapper (the library's BreadcrumbProvider is part of it).
 */

import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { mainRoutes } from "@/routes";
import { useBreadcrumb } from "ikon-react-components-lib";
import { basePath, appPath } from "@/utils/basePath";

// Static label map built from the routes config
const routeNameMap: Record<string, string> = {};
mainRoutes.forEach((route) => {
  routeNameMap[route.path] = route.title;
});

export const AppBreadcrumbs: React.FC = () => {
  const location = useLocation();
  const { addBreadcrumbItems } = useBreadcrumb();
  const dynamicBreadcrumbs = useSelector(
    (state: RootState) => state.ui.dynamicBreadcrumbs,
  );

  const breadcrumbItems = useMemo(() => {
    // Strip the base path prefix (e.g. /apps/task-management/v1) from pathname
    let pathname = location.pathname;
    if (basePath && pathname.startsWith(basePath)) {
      pathname = pathname.slice(basePath.length) || "/";
    }
    const pathnames = pathname.split("/").filter(Boolean);

    // Don't show breadcrumbs if we're at a top-level page (e.g. /dashboard)
    if (pathnames.length <= 1) return [];

    return pathnames.map((segment, index) => {
      const href = appPath(`/${pathnames.slice(0, index + 1).join("/")}`);

      // Priority: dynamic label (UUID etc.) → static route map → capitalize
      let title = dynamicBreadcrumbs[segment];
      if (!title) title = routeNameMap[segment];
      if (!title)
        title = segment.charAt(0).toUpperCase() + segment.slice(1);

      return {
        title,
        href,
        level: index,
      };
    });
  }, [location.pathname, dynamicBreadcrumbs]);

  useEffect(() => {
    // isReplace = true → replace all items on every navigation
    addBreadcrumbItems(breadcrumbItems, true);
  }, [breadcrumbItems, addBreadcrumbItems]);

  // Renders nothing — breadcrumbs appear in the library's header
  return null;
};
