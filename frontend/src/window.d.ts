import redaxios from "redaxios";
import type { Severity } from "goscope2-sdk-js";

interface GoatCounter {
  path: string | ((p: string) => string | null);
  allow_frame: boolean;
  allow_local: boolean;
  endpoint: string;
  // Filter some requests that we (probably) don't want to count.
  filter():
    | "visibilityState"
    | "frame"
    | "localhost"
    | "localfile"
    | "disabled with #toggle-goatcounter"
    | false;

  // Get URL to send to GoatCounter.
  url(vars?: any): string | void;

  // Count a hit.
  count(vars?: any): void;

  // Get a query parameter.
  get_query(name: string): string;

  // Track click events.
  bind_events(): void;

  // Add a "visitor counter" frame or image.
  visit_count(opt: {
    type?: string;
    append?: string;
    path?: string;
    attr?: any;
  }): void;
}

declare global {
  var axios: typeof redaxios;
  interface Window {
    MapboxGeocoder: MapboxGeocoder;
    goatcounter?: GoatCounter;
    goscope2?: {
      token: string;
      baseUrl: string;
      New(token: string, baseUrl: string): void;
      Log(severity: Severity, message: string): void;
    };
  }
}
