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
};

export default config;
