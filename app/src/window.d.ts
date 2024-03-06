import Axios from "redaxios";
import type { OneSignalPlugin } from "onesignal-cordova-plugin";
import { type Keyboard } from "@capacitor/keyboard";
import { type Capacitor } from "@capacitor";

declare global {
  interface Window {
    axios: typeof Axios;
    plugins?: {
      OneSignal?: OneSignalPlugin;
    };
    Keyboard?: Keyboard;
    Capacitor?: Capacitor;
  }
}
