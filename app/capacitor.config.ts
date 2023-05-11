import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "org.clothingloop.app",
  appName: "My Clothing Loop",
  webDir: "build",
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchAuthHide: false,
      launchFadeOutDuration: 0,
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
    },
  },
  server: {
    url: "http://localhost:8100",
    cleartext: true,
    allowNavigation: ["localhost:8100/*"],
  },
};

export default config;
