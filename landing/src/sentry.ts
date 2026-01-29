import * as Sentry from '@sentry/react';
import { replayIntegration } from '@sentry/react';
import packageJson from '../../package.json';

export function initSentry() {
  Sentry.init({
    dsn: 'https://865aaf6a7af905655d6567ef20fb8a67@o4508353698136064.ingest.us.sentry.io/4510132531822592',
    sendDefaultPii: true,
    integrations: [
      replayIntegration({
        maskAllText: false,
        maskAllInputs: false,
      }),
      Sentry.browserTracingIntegration(),
    ],
    dist: process.env.REACT_APP_BUILD_NUMBER,
    release: `theodore-playground@${packageJson.version}+${process.env.REACT_APP_BUILD_NUMBER}`,
    tracesSampleRate: 1,
    replaysSessionSampleRate: 1,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NODE_ENV,
    denyUrls: [/.*localhost.*/],
  });
}
