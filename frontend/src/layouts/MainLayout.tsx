import React, { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { RenderSidebarNav } from "ikon-react-components-lib";
import { User } from "lucide-react";
import { mainRoutes } from "@/routes";
import { AppBreadcrumbs } from "@/components/AppBreadcrumbs";

export const MainLayout: React.FC = () => {
  const location = useLocation();

  const navItems = useMemo(() => {
    return mainRoutes.map((route) => ({
      title: route.title,
      url: `/main/${route.path}`,
      icon: route.icon,
      isActive: location.pathname.startsWith(`/main/${route.path}`),
    }));
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-background font-sans antialiased text-foreground">
      <div className="flex h-full w-full">
        {/* Sidebar */}
        <RenderSidebarNav
          items={navItems}
          sidebarHeader={
            <h2 className="flex items-center gap-2 text-md mb-5 mt-2">
              <User size={18} />
              Task Management
            </h2>
          }
        />

        {/* Main Content Area */}
        {/* <div className="flex-1 overflow-auto bg-slate-50 dark:bg-zinc-900"> */}
        <div className="flex-1 overflow-auto">
          <main className="p-6">
            <AppBreadcrumbs />
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
