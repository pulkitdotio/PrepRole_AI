import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import { router } from './app.routes';
import { AuthProvider } from './context/AuthContext';
import AppErrorBoundary from './components/common/AppErrorBoundary';

import './styles/global.scss';

createRoot(
  document.getElementById('root')
).render(
  <StrictMode>
    <AppErrorBoundary>
      <AuthProvider>
        <RouterProvider
          router={router}
        />
      </AuthProvider>
    </AppErrorBoundary>
  </StrictMode>
);
