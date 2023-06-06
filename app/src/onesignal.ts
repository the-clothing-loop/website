import OneSignal from "onesignal-cordova-plugin";

const ONE_SIGNAL_ID = import.meta.env.VITE_ONE_SIGNAL_ID;

// Call this function when your app starts
export default function OneSignalInit(): void {
  // Uncomment to set OneSignal device logging to VERBOSE
  // OneSignal.setLogLevel(6, 0);
  if (!ONE_SIGNAL_ID) return;

  // NOTE: Update the setAppId value below with your OneSignal AppId.
  OneSignal.setAppId(ONE_SIGNAL_ID);
  OneSignal.setNotificationOpenedHandler(function (jsonData) {
    console.log("notificationOpenedCallback: " + JSON.stringify(jsonData));
  });

  // Prompts the user for notification permissions.
  //    * Since this shows a generic native prompt, we recommend instead using an In-App Message to prompt for notification permission (See step 7) to better communicate to your users what notifications they will get.
  OneSignal.promptForPushNotificationsWithUserResponse(function (accepted) {
    console.log("User accepted notifications: " + accepted);
  });
}
