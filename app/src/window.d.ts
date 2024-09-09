import redaxios from "redaxios";
import type { OneSignalPlugin } from "onesignal-cordova-plugin";
import { type Capacitor } from "@capacitor";
import { Channel, Client, Session, Socket } from "@heroiclabs/nakama-js";

declare global {
  var axios: typeof redaxios;
  interface Window {
    axios: typeof Axios;
    plugins?: {
      OneSignal?: OneSignalPlugin;
    };
    Capacitor?: Capacitor;
    nClient?: Client;
    nSession?: Session;
    nSocket?: Socket;
    nChannel?: Channel;
  }
}
