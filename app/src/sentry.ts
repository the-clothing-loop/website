import * as Sentry from "@sentry/capacitor";
import * as SentryReact from "@sentry/react";

const VERSION = import.meta.env.VITE_APP_VERSION;

Sentry.init({
  dsn: "https://8f024a83f641201d93f0643300318bbc@o4506932463730688.ingest.us.sentry.io/4506932467662848",
  // Set your release version, such as "getsentry@1.0.0"
  release: "ionic@" + VERSION,
  // Set your dist version, such as "1"
  dist: VERSION,
  environment:
    VERSION === "development"
      ? "dev"
      : VERSION === "acceptance"
      ? "qa"
      : "production",
  integrations: [
    new SentryReact.BrowserProfilingIntegration(),
    new Sentry.BrowserTracing({ tracingOrigins: ["*"] }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  tracesSampleRate: 0.1,

  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/[\w\.]+\.clothingloop\.org\/api/,
  ],

  // Capture Replay for 0% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
