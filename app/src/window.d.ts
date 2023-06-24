import Axios from "redaxios";
import type { OneSignalPlugin } from "onesignal-cordova-plugin";
import OneSignal from "react-onesignal";

type IOneSignal = typeof OneSignal;

declare global {
  interface Window {
    axios: typeof Axios;
    plugins?: {
      OneSignal?: OneSignalPlugin | IOneSignal;
    };
  }
}
