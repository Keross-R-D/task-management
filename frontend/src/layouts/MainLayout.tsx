import React, { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { RenderSidebarNav } from "ikon-react-components-lib";
import { User } from "lucide-react";
import { mainRoutes } from "@/routes";
import { AppBreadcrumbs } from "@/components/AppBreadcrumbs";
import { appPath } from "@/utils/basePath";

export const MainLayout: React.FC = () => {
  const location = useLocation();

  const navItems = useMemo(() => {
    return mainRoutes.map((route) => ({
      title: route.title,
      url: appPath(`/${route.path}`),
      icon: route.icon,
      isActive: location.pathname.includes(`/${route.path}`),
    }));
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-auto bg-background font-sans antialiased text-foreground custom-scrollbar">
      {/* Syncs breadcrumbs into the library header — renders no DOM */}
      <AppBreadcrumbs />

      <div className="flex h-full w-full">
        {/* Sidebar */}
        <RenderSidebarNav
          items={navItems}
          sidebarHeader={
            <h2 className="flex items-center gap-2 text-xl ml-2 mb-5 mt-2">
              <User size={18} />
              Task Management
            </h2>
          }
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <main className="">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
