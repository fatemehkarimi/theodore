'use client';

import { useEffect } from 'react';
import { initSentry } from '../sentry';

export function SentryInit() {
  useEffect(() => {
    initSentry();
  }, []);

  return null;
}
