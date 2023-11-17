import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { History } from "history";
import { loginValidate as apiLogin, logout as apiLogout } from "../api/login";
import { User } from "../api/types";
import { userGetByUID, userUpdate } from "../api/user";
import Cookies from "js-cookie";
import i18n from "../i18n";

const IS_DEV_MODE = import.meta.env.DEV;

export enum UserRefreshState {
  NeverLoggedIn,
  LoggedIn,
  ForceLoggedOut,
}

export type AuthProps = {
  /**
   * Types define the state of the login process
   * - User: Is logged in
   * - null: Is logged out
   * - undefined: Is not finished loading
   */
  authUser: User | null | undefined;
  // ? Should loading only be used for authentication or also for login & logout?
  loading: boolean;
  authLoginValidate: (
    apiKey: string,
    chainUID: string
  ) => Promise<undefined | User>;
  authLogout: () => Promise<void>;
  authUserRefresh: () => Promise<UserRefreshState>;
};

export const AuthContext = createContext<AuthProps>({
  authUser: undefined,
  loading: true,
  authLoginValidate: (apiKey, c) => Promise.reject(),
  authLogout: () => Promise.reject(),
  authUserRefresh: () => Promise.reject(UserRefreshState.NeverLoggedIn),
});

const KEY_USER_UID = "user_uid";
const cookieOptions: Cookies.CookieAttributes = {
  secure: !IS_DEV_MODE,
  expires: 364,
  sameSite: "strict",
};

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [user, setUser] = useState<AuthProps["authUser"]>(undefined);
  const [loading, setLoading] = useState(true);
  function authLoginValidate(apiKey: string, chainUID: string) {
    setLoading(true);
    return (async () => {
      let _user: User | null | undefined = undefined;
      try {
        _user = (await apiLogin(apiKey, chainUID)).data.user;
        Cookies.set(KEY_USER_UID, _user.uid, cookieOptions);
      } catch (err) {
        setUser(null);
        setLoading(false);
        throw err;
      }
      setUser(_user);
      setLoading(false);
      return _user;
    })();
  }
  function authLogout() {
    setLoading(true);
    return (async () => {
      await apiLogout().catch((e) => console.warn(e));
      Cookies.remove(KEY_USER_UID, cookieOptions);
      setUser(null);
      setLoading(false);
    })();
  }
  function authUserRefresh() {
    setLoading(true);
    console.info("trying to login");
    return (async () => {
      let oldUserUID = getOldStorageUserUID();
      // without a user uid authentication is not possible
      if (!oldUserUID) {
        setUser(null);

        console.log("never logged in");
        return UserRefreshState.NeverLoggedIn;
      }

      try {
        const user = (await userGetByUID(undefined, oldUserUID)).data;
        setUser(user);

        Cookies.set(KEY_USER_UID, user.uid, cookieOptions);
        setLoading(false);
        const isChanged = user.i18n ? user.i18n !== i18n.language : false;
        const isUnset = !!user.i18n;
        if (!isUnset && isChanged) {
          i18n.changeLanguage(user.i18n);
        }
        if (isUnset || isChanged) {
          userUpdate({
            user_uid: user.uid,
            i18n: i18n.language,
          });
        }
      } catch (err) {
        await authLogout().catch((err) => {
          console.error("force logout failed:", err);
        });
        console.info("force logout");
        return UserRefreshState.ForceLoggedOut;
      }
      console.log("logged in");
      return UserRefreshState.LoggedIn;
    })();
  }
  const history = useHistory();
  useEffect(() => {
    console.log("trying to login");
    authUserRefresh().then((res) => {
      if (res === UserRefreshState.ForceLoggedOut) {
        const isHomeI18n = history.location.pathname.substring(3) === "/";
        const isHome = history.location.pathname === "/";
        if (!(isHome || isHomeI18n)) {
          history.push("/");
        }
      }
    });

    runGoatCounter(history);
  }, []);
  const contextValue: AuthProps = {
    authUser: user,
    loading: loading,
    authLoginValidate,
    authUserRefresh,
    authLogout,
  };
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

function runGoatCounter(history: History) {
  if (window.location.host !== "www.clothingloop.org") return;
  if (!window.goatcounter) return;

  window.goatcounter.count({
    path: location.pathname.substring(3),
  });
  history.listen((location) => {
    window.goatcounter?.count({
      path: location.pathname.substring(3),
    });
  });
}

function getOldStorageUserUID(): string | null | undefined {
  let oldUserUID: string | null | undefined =
    window.localStorage.getItem(KEY_USER_UID);
  if (oldUserUID) {
    window.localStorage.removeItem(KEY_USER_UID);
  } else {
    oldUserUID = Cookies.get(KEY_USER_UID);
  }
  return oldUserUID;
}
