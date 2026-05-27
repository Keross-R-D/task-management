/**
 * Shared base path constant for routing in production sub-path deployments.
 *
 * ProviderWrapper (ikon-react-components-lib) creates its own BrowserRouter
 * without a `basename`, so all paths must include the full prefix.
 *
 * - Local dev:  VITE_BASE_PATH is unset → basePath = ""  → paths like "/dashboard"
 * - Production: VITE_BASE_PATH = "/apps/task-management/v1/" → paths like "/apps/task-management/v1/dashboard"
 */
export const basePath =
  (import.meta.env.VITE_BASE_PATH || "/").replace(/\/+$/, "") === "/"
    ? ""
    : (import.meta.env.VITE_BASE_PATH || "/").replace(/\/+$/, "");

/** Prepend the base path to a route. e.g. appPath("/dashboard") → "/apps/task-management/v1/dashboard" */
export const appPath = (path: string) => `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
