import { atom } from "nanostores";
import type { User } from "../api/types";
import { loginValidate, logout } from "../api/login";
import { userGetByUID } from "../api/user";
import {
  cookieUserUID,
  localRouteMapLine,
  sessionAuthUser,
} from "./browser_storage";

const IS_DEV_MODE = import.meta.env.DEV;

export enum UserRefreshState {
  NeverLoggedIn,
  LoggedIn,
  ForceLoggedOut,
  Offline,
}

export const $authUser = atom<User | undefined | null>(undefined);
export const $loading = atom(true);

export function authLoginValidate(
  emailBase64: string,
  otp: string,
  chainUID: string,
): Promise<undefined | null | User> {
  $loading.set(true);
  return (async () => {
    let user: User | null | undefined = undefined;
    try {
      user = (await loginValidate(emailBase64, otp, chainUID)).data.user;
    } catch (err) {
      $authUser.set(null);
      $loading.set(false);
      sessionAuthUser.set(null);
      console.error(err);
      return undefined;
    }
    cookieUserUID.set(user.uid);
    sessionAuthUser.set(user);
    $authUser.set(user);
    $loading.set(false);
    return user;
  })();
}

export function authLogout() {
  $loading.set(true);
  return (async () => {
    await logout().catch((e) => console.warn(e));
    cookieUserUID.set(undefined);
    localRouteMapLine.set(undefined);
    $authUser.set(null);
    $loading.set(false);
  })();
}

export function authUserRefresh(force = false): Promise<UserRefreshState> {
  $loading.set(true);
  return (async () => {
    console.info("attempting to retrieve details from session storage");
    let user = sessionAuthUser.get();
    const hasLoginSession = !!user;
    if (hasLoginSession) {
      console.info("has session storage");
    }

    console.info("retrieve user uid from cookie");
    let userUID = cookieUserUID.get();

    if (!userUID) {
      $authUser.set(null);
      sessionAuthUser.set(undefined);
      console.log("never logged in");
      return UserRefreshState.NeverLoggedIn;
    }
    if (!user || force) {
      try {
        user = (
          await userGetByUID(undefined, userUID, {
            addApprovedTOH: true,
            addNotification: true,
          })
        ).data;
        if (!(user && user.uid)) {
          throw "unable to login, server might be offline";
        }
      } catch (err: any) {
        if (err?.status === 401) {
          cookieUserUID.set(undefined);
          await authLogout().catch((err) => {
            console.error("force logout failed:", err);
          });
          console.info("force logout");
        }
        console.info("fake logout, server might be offline");
        return UserRefreshState.ForceLoggedOut;
      }

      sessionAuthUser.set(user);
    }
    $authUser.set(user);
    cookieUserUID.set(user.uid);
    $loading.set(false);
    console.log("logged in");
    return UserRefreshState.LoggedIn;

    // // Astro will set the i18n by path only
    // // The home/admin page will redirect to the user's preferred language only
    //   Cookies.set(KEY_USER_UID, user.uid, cookieOptions);
    //   $loading.set(false);
    //   const isChanged = user.i18n ? user.i18n !== i18n.language : false;
    //   const isUnset = !user.i18n;
    //   if (!isUnset && isChanged) {
    //     i18n.changeLanguage(user.i18n);
    //   }
    //   if (isUnset || isChanged) {
    //     userUpdate({
    //       user_uid: user.uid,
    //       i18n: i18n.language,
    //     });
    //   }
    // } catch (err: any) {
    //   if (err?.status === 401) {
    //     await authLogout().catch((err) => {
    //       console.error("force logout failed:", err);
    //     });
    //   }
    //   console.info("force logout");
    //   return UserRefreshState.ForceLoggedOut;
    // }
  })();
}
