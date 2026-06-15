import { Routes, Route } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { mainRoutes } from "@/routes";
import ProjectDetailsPage from "@/pages/projects/ProjectDetailsPage";
import ProjectStatusDetailPage from "./pages/project-status-report/components/ProjectStatusDetailPage";
import { basePath } from "@/utils/basePath";
import DashboardPage from "./pages/dashboard/DashboardPage";
import { AccessGuard } from "@/components/AccessGuard";

function App() {
  return (
    <Routes>
      <Route path={basePath || "/"} element={<ProtectedRoute />}>
        {/* Redirect root to dashboard */}

        <Route element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          {mainRoutes.map((route) => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={
                <AccessGuard 
                  roles={route.roles} 
                  groups={route.groups} 
                  fallback={<div>Not Authorized</div>}
                >
                  {route.element}
                </AccessGuard>
              } 
            />
          ))}
          <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
          <Route
            path="project-status-report/:id"
            element={<ProjectStatusDetailPage />}
          />
          <Route path="*" element={<div>Page Not Found</div>} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
