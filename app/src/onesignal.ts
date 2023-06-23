// import OneSignal from "onesignal-cordova-plugin";
import OneSignalReact from "react-onesignal";

const ONE_SIGNAL_ID = import.meta.env.VITE_ONE_SIGNAL_ID;

// Call this function when your app starts
export function OneSignalInitCap(): void {
  // Uncomment to set OneSignal device logging to VERBOSE
  // OneSignal.setLogLevel(6, 0);
  if (!ONE_SIGNAL_ID || !window.plugins?.OneSignal) return;

  // NOTE: Update the setAppId value below with your OneSignal AppId.
  window.plugins.OneSignal.setAppId(ONE_SIGNAL_ID);
  window.plugins.OneSignal.setNotificationOpenedHandler(function (jsonData) {
    console.log("notificationOpenedCallback: " + JSON.stringify(jsonData));
  });

  // Prompts the user for notification permissions.
  //    * Since this shows a generic native prompt, we recommend instead using an In-App Message to prompt for notification permission (See step 7) to better communicate to your users what notifications they will get.
  window.plugins.OneSignal.promptForPushNotificationsWithUserResponse(function (
    accepted
  ) {
    console.log("User accepted notifications: " + accepted);
  });
}

export async function OneSignalInitReact(): Promise<void> {
  if (!ONE_SIGNAL_ID) return;
  await OneSignalReact.init({
    appId: ONE_SIGNAL_ID,
    allowLocalhostAsSecureOrigin: true,
  });

  if (!window.plugins) window.plugins = {};
  window.plugins.OneSignal = OneSignalReact;

  OneSignalReact.showSlidedownPrompt();
}
