import redaxios from "redaxios";
import type { OneSignalPlugin } from "onesignal-cordova-plugin";
import { type Capacitor } from "@capacitor";

declare global {
  var axios: typeof redaxios;
  interface Window {
    axios: typeof Axios;
    plugins?: {
      OneSignal?: OneSignalPlugin;
    };
    Capacitor?: Capacitor;
  }
}
