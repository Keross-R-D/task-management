import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { mainRoutes } from '@/routes';
import ProjectDetailsPage from '@/pages/projects/ProjectDetailsPage';
import ProjectStatusDetailPage from './pages/project-status-report/components/ProjectStatusDetailPage';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {
  return (<>
   <Routes>
      <Route path="/" element={<Navigate to="/main/projects" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/main" element={<MainLayout />}>
          {mainRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="project-status-report/:id" element={<ProjectStatusDetailPage />} />
          <Route path="*" element={<div>Page Not Found</div>} />
        </Route>
      </Route>
    </Routes>
     <ToastContainer />
  </>
   
  );
}

export default App;
