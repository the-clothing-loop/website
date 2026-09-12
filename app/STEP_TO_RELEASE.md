# Steps to release app

1. Update `version` in `package.json` (for example, `3.0.1`) and add a summary
   to `RELEASE_NOTES.md`. Production builds expose this as `VITE_APP_VERSION`
   with a `v` prefix; acceptance keeps its `acceptance` label.

**Apple App Store**

2. Open a terminal in the app directory
   And run `npm i; npm run build:ios:production`
3. Open xcode and open the workspace in the App directory;
   `xcode ./ios/App/App.xcworkspace`
4. On the sidebar open the folder icon, and update the version & marketing version:
   **[a] App**
   -> **Targets App**
   -> **Build Settings**
   -> **Versioning**
   -> **Marketing Version**
5. Run app on mobile device **Product** => **Run**
6. Archive the running app, from **Product** => **Archive**
7. Open archives from **Window** => **Organizer**

**Google Play Store**

Prerequisites: JDK 17, Android SDK Platform 36, and Android Studio Meerkat
Feature Drop (2024.3.2) or newer. The Gradle wrapper installs Gradle 8.11.1.
This project targets API 36 to meet the 2026 Google Play update requirement.

For the Android 3.0.1 compatibility release:

- `versionCode` is 53 because Google Play has already used version code 52 for
  the unfinished 4.0.0 test build. Check every track again before building and
  increase it if a higher code has since been uploaded.
- Run `npm ci` and `npm run build:android:production`. The build synchronizes
  native plugins as well as web assets.
- Run `cd android && ./gradlew :app:assembleDebug :app:bundleRelease :app:lintDebug`
  to verify the native build. The CLI release bundle is unsigned; use the existing
  upload key in Android Studio for the signed Play upload.
- Test on Android 16 and an older supported Android version: login, navigation
  and hardware/gesture Back, keyboard opening and dismissal, camera/gallery,
  sharing, and push notifications. Check top/bottom controls in portrait and
  landscape with both gesture and three-button navigation.
- Open the `android` directory in Android Studio. Select **Build → Generate Signed
  Bundle/APK → Android App Bundle**, choose the existing upload keystore, and build
  the release variant. Keep signing credentials outside Git.
- Upload the signed bundle to internal testing, review the pre-launch report
  and device compatibility (including 16 KB page-size support), then roll out
  to production. Source changes alone do not restore Play Store downloads.
- Tag the released commit after publication, for example `v3.0.1-app`.

The activity temporarily opts out of predictive Back to retain Capacitor 6's
existing navigation behavior. Revisit this when upgrading Capacitor.
