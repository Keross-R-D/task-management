import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { mainRoutes } from '@/routes';
import ProjectDetailsPage from '@/pages/projects/ProjectDetailsPage';
import ProjectStatusDetailPage from './pages/project-status-report/components/ProjectStatusDetailPage';
import { basePath, appPath } from '@/utils/basePath';

function App() {
  return (
    <Routes>
      {/* Redirect root to dashboard */}
      <Route path={basePath || "/"} element={<Navigate to={appPath("/dashboard")} replace />} />

      <Route element={<ProtectedRoute />}>
        <Route path={`${basePath}/`} element={<MainLayout />}>
          {mainRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="project-status-report/:id" element={<ProjectStatusDetailPage />} />
          <Route path="*" element={<div>Page Not Found</div>} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
