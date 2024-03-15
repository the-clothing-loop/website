import { atom } from "nanostores";
import type { User } from "../api/types";
import { loginValidate, logout, refreshToken } from "../api/login";
import { userGetByUID } from "../api/user";
import {
  cookieUserUID,
  localRouteMapLine,
  sessionAuthUser,
} from "./browser_storage";

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
    // Remove legacy cookies
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
    if (hasLoginSession) console.info("has session storage");

    let userUID = cookieUserUID.get();
    if (userUID) console.info("retrieved user uid from cookie");

    if (!userUID) {
      $authUser.set(null);
      sessionAuthUser.set(undefined);
      console.log("never logged in");
      return UserRefreshState.NeverLoggedIn;
    }
    if (!user || force) {
      try {
        await refreshToken();
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
    $loading.set(false);
    console.log("logged in");
    return UserRefreshState.LoggedIn;
  })();
}
