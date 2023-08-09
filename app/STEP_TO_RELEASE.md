# Steps to release app

1. Edit the `VITE_APP_VERSION` in [.env.production](/.env.production) (e.g.: `v1.4`)

**Apple App Store**

2. Open a terminal in the app directory
   And run `npm i; npm run build:ios:production`
3. Open xcode and open the workspace in the App directory;
   `xcode <root>/app/ios/App/App.xcworkspace`
4. On the sidebar open the folder icon, and update the version & marketing version:
   **[a] App**
   -> **Targets App**
   -> **Build Settings**
   -> **Versioning**
   -> **Marketing Version**
5. Run app on mobile device, archive
6. Open archives from **Window** => **Organizer**

`**Google Play Store**

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
7. Open <https://play.google.com/console/> and click on **Release**`

8. Create a git tag (e.g.: `v1.4-app`)
