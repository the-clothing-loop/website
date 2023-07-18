# Steps to release app

## Google Play Store

1. Create a git tag (e.g.: `v1.4-app`)
2. Open a terminal in the app directory
   And run `npm i; npm run build:android:production`
3. Open android studio and open a project in the app directory;
   `<root>/app/android`
4. Open in the menu bar:
   **Build**
   -> **Generate Signed Bundle/APK**
   -> **Android App Bundle**
   -> **Build Variants: Release**
5. Find the build in: `app/android/app/release/app-release.aab`

## Apple App Store

(coming soon)
