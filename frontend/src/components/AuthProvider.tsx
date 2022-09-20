import React, { useEffect, useState } from "react";
import { loginValidate as apiLogin, logout as apiLogout } from "../api/login";
import { UID, User, UserChain } from "../api/types";
import { userGetByUID } from "../api/user";

export type AuthProps = {
  authChainUID: UID | null;
  // TODO: multi chain
  // setAuthChainUID
  authUser: User | null;
  authIsChainAdmin: boolean;
  // ? Should loading only be used for authentication or also for login & logout?
  loading: boolean;
  authLogin: (apiKey: string) => Promise<void>;
  authLogout: () => Promise<void>;
};

export const AuthContext = React.createContext<AuthProps>({
  authChainUID: null,
  authUser: null,
  authIsChainAdmin: false,
  loading: true,
  authLogin: (apiKey) => Promise.reject(),
  authLogout: () => Promise.reject(),
});

const LOCALSTORAGE_USER_UID = "user_uid";

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [chainUID, setChainUID] = useState<UID | null>(null);
  const [isChainAdmin, setIsChainAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const authLogin = (apiKey: string) => {
    setLoading(true);
    return (async () => {
      try {
        const user = (await apiLogin(apiKey)).data;
        setUser(user);

        let selectedUserChain = user.chains[0] as UserChain | undefined;
        setIsChainAdmin(selectedUserChain?.is_chain_admin || false);
        setChainUID(selectedUserChain?.chain_uid || null);

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
      setChainUID(null);
      setIsChainAdmin(false);
      setLoading(false);
    })();
  };
  const authenticate = (user: User) => {
    setUser(user);

    let selectedUserChain = user.chains[0] as UserChain | undefined;
    setIsChainAdmin(selectedUserChain?.is_chain_admin || false);
    setChainUID(selectedUserChain?.chain_uid || null);

    window.localStorage.setItem(LOCALSTORAGE_USER_UID, user.uid);
  };
  useEffect(() => {
    (async () => {
      let oldUserUID = window.localStorage.getItem(LOCALSTORAGE_USER_UID);
      if (oldUserUID != null) {
        // check if authentication still works
        try {
          const user = (await userGetByUID(null, oldUserUID)).data;
          authenticate(user);
        } catch (e) {
          window.localStorage.removeItem(LOCALSTORAGE_USER_UID);
        }
      }

      setLoading(false);
    })();
  }, []);
  const contextValue = {
    authUser: user,
    authChainUID: chainUID,
    authIsChainAdmin: isChainAdmin,
    loading: loading,
    authLogin,
    authLogout,
  };
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
