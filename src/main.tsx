import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppRoutes } from '~root/routes';
import { localStore } from '~root/stores';
import { ThemeProvider } from '~root/providers/ThemeProvider';
import { applyTheme, readStoredTheme } from '~root/providers/theme';
import { queryClient } from '~root/lib/query-client';
import './index.css';
import '@fontsource-variable/nunito-sans';

applyTheme(readStoredTheme());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <JotaiProvider store={localStore}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppRoutes />
            <ToastContainer />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    </ThemeProvider>
  </StrictMode>,
);
