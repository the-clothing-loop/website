import Cookies from "js-cookie";
import type { User } from "../api/types";

const IS_PRODUCTION =
  import.meta.env.PUBLIC_BASE_URL === "https://www.clothingloop.org";
const IS_ACCEPTANCE =
  import.meta.env.PUBLIC_BASE_URL === "https://acc.clothingloop.org";

const IS_DEV_MODE = import.meta.env.DEV;

function cookiePostfix(name: string): string {
  if (IS_PRODUCTION) return name;
  if (IS_ACCEPTANCE) return name + "_acc";
  return name + "_dev";
}

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

const KEY_C_USER_UID = cookiePostfix("user_uid");
export const cookieUserUID: BrowserAtom = {
  get: () => {
    console.log(KEY_C_USER_UID);
    return Cookies.get(KEY_C_USER_UID);
  },
  set: (uid) => {
    if (!uid) {
      Cookies.remove(KEY_C_USER_UID, cookieOptions);
      return;
    }
    Cookies.set(KEY_C_USER_UID, uid, cookieOptions);
  },
};

const KEY_C_POKE = cookiePostfix("poke");
export const cookiePoke = {
  get: () => Cookies.get(KEY_C_POKE),
  set: (uid: string, days: number) => {
    if (!uid) {
      Cookies.remove(KEY_C_POKE);
      return;
    }
    Cookies.set(KEY_C_POKE, uid, { expires: days });
  },
};

// Localstorage
// ----------------------------------------------------------------

const KEY_L_ROUTE_MAP_LINE = cookiePostfix("route_map_line");
export const localRouteMapLine: BrowserAtom = {
  get: () => getS(window.localStorage, KEY_L_ROUTE_MAP_LINE),
  set: (v) => setS(window.localStorage, KEY_L_ROUTE_MAP_LINE)(v),
};

// Sessionstorage
// ----------------------------------------------------------------

const KEY_S_AUTH_USER = cookiePostfix("auth_user");

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
