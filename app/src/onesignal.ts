// import OneSignal from "onesignal-cordova-plugin";

const ONE_SIGNAL_ID = import.meta.env.VITE_ONE_SIGNAL_ID;

// Call this function when your app starts
export function OneSignalInitCap(): Promise<string | boolean> {
  if (!ONE_SIGNAL_ID || !window.plugins?.OneSignal)
    return Promise.reject("No OneSignal ID");

  // NOTE: Update the setAppId value below with your OneSignal AppId.
  window.plugins.OneSignal.initialize(ONE_SIGNAL_ID);

  return window
    .plugins!.OneSignal!.Notifications.requestPermission(true)
    .then(function (accepted) {
      console.log("User accepted notifications: " + accepted);
      if (accepted) {
        return true;
      } else {
        throw false;
      }
    });
}
