import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { Auth0ProviderWithNavigate } from './auth/Auth0ProviderWithNavigate';
import ErrorBoundary from './error/ErrorBoundary';

const rootElement = document.getElementById('root') as HTMLElement;

if (rootElement) {
  const root = createRoot(rootElement);

  root.render(
    <BrowserRouter>
      <ErrorBoundary>
        <Auth0ProviderWithNavigate>
          <App />
        </Auth0ProviderWithNavigate>
      </ErrorBoundary>
    </BrowserRouter>
  );

  reportWebVitals();
} else {
  console.error('Failed to find the root element');
}
