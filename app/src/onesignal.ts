// import OneSignal from "onesignal-cordova-plugin";

const ONE_SIGNAL_ID = import.meta.env.VITE_ONE_SIGNAL_ID;

// Call this function when your app starts
export function OneSignalInitCap(): Promise<boolean> {
  if (!ONE_SIGNAL_ID || !window.plugins?.OneSignal)
    return Promise.reject<boolean>("No OneSignal ID");

  // NOTE: Update the setAppId value below with your OneSignal AppId.
  window.plugins.OneSignal.initialize(ONE_SIGNAL_ID);

  return window
    .plugins!.OneSignal!.Notifications.requestPermission(false)
    .then(function (accepted) {
      console.log("User accepted notifications: " + accepted);
      return accepted;
    });
}

export function OneSignalCheckPermissions(): Promise<boolean | null> {
  if (!ONE_SIGNAL_ID || !window.plugins?.OneSignal)
    return Promise.resolve(null);

  return window.plugins.OneSignal.Notifications.getPermissionAsync();
}

export function OneSignalRequestPermissions(): Promise<boolean | null> {
  if (!ONE_SIGNAL_ID || !window.plugins?.OneSignal)
    return Promise.resolve(null);
  return window.plugins.OneSignal.Notifications.requestPermission(true);
}
