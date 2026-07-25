import { BrowserRouter } from 'react-router-dom';
import { RouterProvider } from './app/providers/RouterProvider';
import { ReactQueryProvider } from './app/providers/ReactQueryProvider';
import { AuthProvider } from './app/providers/AuthProvider';
import { Notifications } from '@mantine/notifications';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { FeatureFlagsTabsProvider } from './widgets/FeatureFlag/FeatureFlagsView';
import { ScrollToTop } from './shared/ui';
import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      <ReactQueryProvider>
        <BrowserRouter>
          <AuthProvider>
            <FeatureFlagsTabsProvider>
              <ScrollToTop />
              <ReactQueryDevtools />
              <Notifications />
              <RouterProvider />
            </FeatureFlagsTabsProvider>
          </AuthProvider>
        </BrowserRouter>
      </ReactQueryProvider>
    </HelmetProvider>
  );
}

export default App;
