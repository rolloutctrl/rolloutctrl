import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import "@mantine/dates/styles.css";
import '@mantine/charts/styles.css';
import '@mantine/spotlight/styles.css';
import { MantineProvider } from '@mantine/core';
import { theme } from './shared/theme/theme.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <App />
    </MantineProvider>
  </StrictMode>,
);
