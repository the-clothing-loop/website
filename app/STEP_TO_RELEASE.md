# Steps to release app

## Google Play Store

1. Create a git tag (e.g.: `v1.4-android`)
2. Edit in `<root>/app/android/app/build.gradle` the following: `versionCode` & `versionName`
3. Open a terminal in the app directory
   And run `npm i; npm run build:android:production`
4. Open android studio and open a project in the app directory;
   `<root>/app/android`
5. Open in the menu bar:
   **Build**
   -> **Generate Signed Bundle/APK**
   -> **Android App Bundle**
   -> **Build Variants: Release**
6. Find the build in: `app/android/app/release/app-release.aab`
7. Open <https://play.google.com/console/> and click on **Release**

## Apple App Store

1. Create a git tag (e.g.: `v1.4-ios`)
2. Open a terminal in the app directory
   And run `npm i; npm run build:ios:production`
3. Open xcode and open the workspace in the App directory;
   `xcode <root>/app/ios/App/App.xcworkspace`
4. Run app on mobile device, archive
5. Open archives from **Window** =>
