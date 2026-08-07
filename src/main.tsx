import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import { localStore } from '~root/stores';
import { ThemeProvider } from '~root/providers/ThemeProvider';
import { applyTheme, readStoredTheme } from '~root/providers/theme';
import './index.css';

applyTheme(readStoredTheme());

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <JotaiProvider store={localStore}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
            <ToastContainer />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    </ThemeProvider>
  </StrictMode>,
);
