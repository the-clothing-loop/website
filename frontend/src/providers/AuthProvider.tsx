import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { History } from "history";
import { loginValidate as apiLogin, logout as apiLogout } from "../api/login";
import { User } from "../api/types";
import { userGetByUID } from "../api/user";

export enum UserRefreshState {
  NeverLoggedIn,
  LoggedIn,
  ForceLoggedOut,
}

export type AuthProps = {
  authUser: User | null;
  // ? Should loading only be used for authentication or also for login & logout?
  loading: boolean;
  authLoginValidate: (apiKey: string) => Promise<void>;
  authLogout: () => Promise<void>;
  authUserRefresh: () => Promise<UserRefreshState>;
};

export const AuthContext = createContext<AuthProps>({
  authUser: null,
  loading: true,
  authLoginValidate: (apiKey) => Promise.reject(),
  authLogout: () => Promise.reject(),
  authUserRefresh: () => Promise.reject(UserRefreshState.NeverLoggedIn),
});

const LOCALSTORAGE_USER_UID = "user_uid";

export function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  function authLoginValidate(apiKey: string) {
    setLoading(true);
    return (async () => {
      try {
        const user = (await apiLogin(apiKey)).data;
        setUser(user);

        window.localStorage.setItem(LOCALSTORAGE_USER_UID, user.uid);
      } catch (e) {
        setLoading(false);
        throw e;
      }
      setLoading(false);
    })();
  }
  function authLogout() {
    setLoading(true);
    return (async () => {
      await apiLogout().catch((e) => console.warn(e));
      window.localStorage.removeItem(LOCALSTORAGE_USER_UID);
      setUser(null);
      setLoading(false);
    })();
  }
  function authUserRefresh() {
    setLoading(true);
    console.log("trying to login");
    return (async () => {
      let oldUserUID = window.localStorage.getItem(LOCALSTORAGE_USER_UID);
      if (oldUserUID != null) {
        // check if authentication still works
        try {
          const user = (await userGetByUID(null, oldUserUID)).data;
          setUser(user);

          window.localStorage.setItem(LOCALSTORAGE_USER_UID, user.uid);
          setLoading(false);
        } catch (e) {
          await authLogout().catch((e) => {
            console.error("force logout failed:", e);
          });
          console.log("force logout");
          return UserRefreshState.ForceLoggedOut;
        }
        console.log("logged in");
        return UserRefreshState.LoggedIn;
      }

      console.log("never logged in");
      return UserRefreshState.NeverLoggedIn;
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
    window.goatcounter.count({
      path: location.pathname.substring(3),
    });
  });
}
