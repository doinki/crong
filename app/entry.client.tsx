import {
  browserTracingIntegration,
  init,
  reactRouterV7BrowserTracingIntegration,
  replayIntegration,
} from '@sentry/react';
import { startTransition, StrictMode, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router';
import { HydratedRouter } from 'react-router/dom';

init({
  dsn: import.meta.env.SENTRY_DSN,
  enabled: import.meta.env.PROD,
  environment: import.meta.env.MODE,
  integrations: [
    browserTracingIntegration(),
    replayIntegration(),
    reactRouterV7BrowserTracingIntegration({
      createRoutesFromChildren,
      matchRoutes,
      useEffect,
      useLocation,
      useNavigationType,
    }),
  ],
  replaysOnErrorSampleRate: 1,
  replaysSessionSampleRate: 0.1,
  tracesSampleRate: 1,
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
