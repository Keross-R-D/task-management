import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Users,
  BarChart2,
  Settings,
} from "lucide-react";
import React from "react";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ProjectsPage from "@/pages/projects/ProjectsPage";
import MyTasksPage from "@/pages/myTasks/MyTaskPage";
import ResourceUtilisationPage from "@/pages/resource-utilisation/ResourceUtilisationPage";
import ProjectStatusReportPage from "@/pages/project-status-report/ProjectStatusReportPage";
import SettingsPage from "@/pages/settings/SettingsPage";

export interface AppRoute {
  path: string;
  title: string;
  icon: any;
  element: React.ReactNode;
}

export const mainRoutes: AppRoute[] = [
  {
    path: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    element: <DashboardPage />,
  },
  {
    path: "projects",
    title: "Projects",
    icon: FolderKanban,
    element: <ProjectsPage />,
  },
  {
    path: "tasks",
    title: "My Tasks",
    icon: ClipboardList,
    element: <MyTasksPage />,
  },
  {
    path: "resource-utilisation",
    title: "Resource Utilisation",
    icon: Users,
    element: <ResourceUtilisationPage />,
  },
  {
    path: "project-status-report",
    title: "Project Status Report",
    icon: BarChart2,
    element: <ProjectStatusReportPage />,
  },
  {
    path: "settings",
    title: "Settings",
    icon: Settings,
    element: <SettingsPage />,
  },
];
