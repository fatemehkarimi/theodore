import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSentry } from './sentry';

initSentry();
createRoot(document.getElementById('root')!).render(<App />);
