import { init } from '@sentry/react';
import packageJson from '../../package.json';

export function initSentry() {
  const buildNumber = process.env.NEXT_PUBLIC_BUILD_NUMBER ?? 'local';

  init({
    dsn: 'https://865aaf6a7af905655d6567ef20fb8a67@o4508353698136064.ingest.us.sentry.io/4510132531822592',
    sendDefaultPii: true,
    dist: buildNumber,
    release: `theodore-landing@${packageJson.version}+${buildNumber}`,
    tracesSampleRate: 1,
    replaysSessionSampleRate: 1,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NODE_ENV,
    denyUrls: [/.*localhost.*/],
  });
}
