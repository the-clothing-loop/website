import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { loginValidate as apiLogin, logout as apiLogout } from "../api/login";
import { UID, User, UserChain } from "../api/types";
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

export const AuthContext = React.createContext<AuthProps>({
  authUser: null,
  loading: true,
  authLoginValidate: (apiKey) => Promise.reject(),
  authLogout: () => Promise.reject(),
  authUserRefresh: () => Promise.reject(UserRefreshState.NeverLoggedIn),
});

const LOCALSTORAGE_USER_UID = "user_uid";

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authLoginValidate = (apiKey: string) => {
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
  };
  const authLogout = () => {
    setLoading(true);
    return (async () => {
      await apiLogout().catch((e) => console.warn(e));
      window.localStorage.removeItem(LOCALSTORAGE_USER_UID);
      setUser(null);
      setLoading(false);
    })();
  };
  const authUserRefresh = () => {
    setLoading(true);
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
          await authLogout();
          return UserRefreshState.ForceLoggedOut;
        }
        return UserRefreshState.LoggedIn;
      }
      return UserRefreshState.NeverLoggedIn;
    })();
  };
  const history = useHistory();
  useEffect(() => {
    authUserRefresh().then((res) => {
      if (res == UserRefreshState.ForceLoggedOut) {
        if (history.location.pathname != "/") {
          history.push("/");
        }
      }
    });
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
};
