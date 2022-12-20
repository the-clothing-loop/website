import type { Notifier } from "@airbrake/browser";

export declare global {
  interface Window {
    airbrake?: Notifier;
    MapboxGeocoder: MapboxGeocoder;
  }
}
