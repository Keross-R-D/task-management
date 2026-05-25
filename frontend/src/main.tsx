import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/app/store';
import { setIkonConfig, ProviderWrapper, Toaster } from 'ikon-react-components-lib';
import App from './App.tsx';
import { LoginPage } from './pages/auth/LoginPage.tsx';
import './index.css';

setIkonConfig({
  IKON_BASE_API_URL: import.meta.env.VITE_IKON_API_URL,
  IKON_PLATFORM_UI_URL: import.meta.env.VITE_IKON_PLATFORM_UI_URL,
  LOGIN_PAGE_URL: import.meta.env.VITE_LOGIN_PAGE_URL,
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
          <Toaster richColors={true} position="top-center" />
        </ProviderWrapper>
      )}
    </Provider>
  </StrictMode>,
);
