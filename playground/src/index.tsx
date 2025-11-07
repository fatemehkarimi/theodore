import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initSentry } from './sentry';
import { isLocalhost } from './environment';

if (!isLocalhost()) initSentry();
const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />,
    </React.StrictMode>,
  );
}
