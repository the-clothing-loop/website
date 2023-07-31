import Axios from "redaxios";
import type { OneSignalPlugin } from "onesignal-cordova-plugin";

declare global {
  interface Window {
    axios: typeof Axios;
    plugins?: {
      OneSignal?: OneSignalPlugin;
    };
  }
}
