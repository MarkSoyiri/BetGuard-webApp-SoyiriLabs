import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from '@/contexts/AppProviders';
import { migrateLegacyDemoData } from '@/utils/storage';
import App from './App';
import '@/styles/index.css';

migrateLegacyDemoData();

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>,
);
