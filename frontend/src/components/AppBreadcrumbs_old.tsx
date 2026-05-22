import React, { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { mainRoutes } from "@/routes";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "ikon-react-components-lib";

// Map specific top-level routes to readable names from our routes config
const routeNameMap: Record<string, string> = {};
mainRoutes.forEach((route) => {
    // route.path might be "projects", "tasks", etc.
    routeNameMap[route.path] = route.title;
});

// Hardcoded common roots
routeNameMap["main"] = "Home";

export const AppBreadcrumbs: React.FC = () => {
    const location = useLocation();
    const dynamicBreadcrumbs = useSelector(
        (state: RootState) => state.ui.dynamicBreadcrumbs,
    );

    const breadcrumbs = useMemo(() => {
        // Remove trailing slash and split
        const pathnames = location.pathname.split("/").filter((x) => x);

        // We don't want to show breadcrumbs if we are at the very root (e.g. just /main)
        // Adjust this condition based on design preferences.
        if (pathnames.length <= 1) {
            return null;
        }

        return pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;

            // Determine label:
            // 1. Check if it's a dynamic breadcrumb registered in Redux (like a UUID)
            // 2. Check if it's in our static route map
            // 3. Fallback to capitalizing the segment string
            let label = dynamicBreadcrumbs[value];
            if (!label) {
                label = routeNameMap[value];
            }
            if (!label) {
                label = value.charAt(0).toUpperCase() + value.slice(1);
            }

            return {
                label,
                to,
                isLast,
            };
        });
    }, [location.pathname, dynamicBreadcrumbs]);

    if (!breadcrumbs || breadcrumbs.length === 0) {
        return null;
    }

    return (
        <Breadcrumb className="mb-4">
            <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.to}>
                        <BreadcrumbItem>
                            {crumb.isLast ? (
                                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link to={crumb.to}>{crumb.label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                        {!crumb.isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
};
