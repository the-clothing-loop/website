import type { Notifier } from "@airbrake/browser";

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
  url(vars?: GoatCounterVars): string | void;

  // Count a hit.
  count(vars?: GoatCounterVars): void;

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

export declare global {
  interface Window {
    airbrake?: Notifier;
    MapboxGeocoder: MapboxGeocoder;
    goatcounter: GoatCounter;
  }
}
