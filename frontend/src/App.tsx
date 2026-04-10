import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { mainRoutes } from '@/routes';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/main/projects" replace />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/main" element={<MainLayout />}>
          {mainRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
