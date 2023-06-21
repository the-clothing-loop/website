import Axios from "redaxios";
import type { OneSignalPlugin } from "onesignal-cordova-plugin";

declare global {
  interface Window {
    axios: typeof Axios;
    plugins?: {
      OneSignal?: OneSignalPlugin;
    };
    // Used for One Signal React plugin for web spa support
    OneSignal?: any;
  }
}
