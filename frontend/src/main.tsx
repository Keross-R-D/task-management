import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/app/store';
import { setIkonConfig, ProviderWrapper } from 'ikon-react-components-lib';
import App from './App.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import './index.css';

setIkonConfig({
  IKON_BASE_API_URL: import.meta.env.VITE_IKON_API_URL || "http://localhost:8080",
  IKON_PLATFORM_UI_URL: import.meta.env.VITE_IKON_PLATFORM_UI_URL || "http://localhost:3000",
  LOGIN_PAGE_URL: "/login"
});

const isLoginPage = window.location.pathname === '/login';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      {isLoginPage ? (
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      ) : (
        <ProviderWrapper>
          <App />
        </ProviderWrapper>
      )}
    </Provider>
  </StrictMode>,
);
