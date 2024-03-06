import Cookies from "js-cookie";
import type { User } from "../api/types";

const IS_DEV_MODE = import.meta.env.DEV;

type BrowserAtom<T = string> = {
  get: () => T | undefined | null;
  set: (v: T | undefined | null) => void;
};

// Cookies
// ----------------------------------------------------------------

const cookieOptions: Cookies.CookieAttributes = {
  secure: !IS_DEV_MODE,
  expires: 364,
  sameSite: "strict",
};

const KEY_C_USER_UID = "user_uid";
export const cookieUserUID: BrowserAtom = {
  get: () => Cookies.get(KEY_C_USER_UID),
  set: (uid) => {
    if (!uid) {
      Cookies.remove(KEY_C_USER_UID, cookieOptions);
      return;
    }
    Cookies.set(KEY_C_USER_UID, uid, cookieOptions);
  },
};

// Localstorage
// ----------------------------------------------------------------

const KEY_L_ROUTE_MAP_LINE = "route_map_line";
export const localRouteMapLine: BrowserAtom = {
  get: () => getS(window.localStorage, KEY_L_ROUTE_MAP_LINE),
  set: (v) => setS(window.localStorage, KEY_L_ROUTE_MAP_LINE)(v),
};

// Sessionstorage
// ----------------------------------------------------------------

const KEY_S_AUTH_USER = "auth_user";

export const sessionAuthUser: BrowserAtom<User> = {
  get: () => {
    const str = getS(window.sessionStorage, KEY_S_AUTH_USER);
    if (!str) return undefined;

    return JSON.parse(str);
  },
  set: (u: User | undefined | null) => {
    if (!u) {
      setS(window.sessionStorage, KEY_S_AUTH_USER)(undefined);
      return;
    }

    setS(window.sessionStorage, KEY_S_AUTH_USER)(JSON.stringify(u));
  },
};

// Util
// ----------------------------------------------------------------

function getS(s: Storage, key: string): string | null {
  return s.getItem(key);
}

function setS(s: Storage, key: string) {
  return (value: string | null | undefined) => {
    if (!value) {
      s.removeItem(key);
      return;
    }
    s.setItem(key, value);
  };
}
