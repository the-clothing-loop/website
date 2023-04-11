import { createContext, useEffect, useState } from "react";
import { Storage } from "@ionic/storage";
import {
  chainGet,
  userGetByUID,
  User,
  Chain,
  logout,
  loginValidate,
  userGetAllByChain,
} from "./api";

interface StorageAuth {
  user_uid: string;
  token: string;
}

export const StoreContext = createContext({
  isAuthenticated: null as boolean | null,
  authUser: null as null | User,
  chain: null as Chain | null,
  chainUsers: [] as Array<User>,
  setChain: (c: Chain | null) => Promise.reject<void>(),
  authenticate: () => Promise.reject<void>(),
  login: (token: string) => Promise.reject<void>(),
  logout: () => Promise.reject<void>(),
  init: () => Promise.reject<void>(),
});

const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY as string;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [chain, setChain] = useState<Chain | null>(null);
  const [chainUsers, setChainUsers] = useState<Array<User>>([]);
  const [storage, setStorage] = useState(new Storage({ name: "store_v1" }));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  async function _init() {
    const _storage = await storage.create();

    const version = (await _storage.get("version")) as number | null;
    if (version !== 1) {
      await _storage.set("version", 1);
    }
    setStorage(_storage);
  }

  async function _logout() {
    logout().catch((err) => {
      console.warn(err);
    });
    window.axios.defaults.auth = undefined;

    await storage.set("auth", null);
    await storage.set("chain_uid", null);
    setAuthUser(null);
    setChain(null);
    setIsAuthenticated(false);
  }

  async function _login(token: string) {
    const res = await loginValidate(token);
    window.axios.defaults.auth = "Bearer " + res.data.token;
    await storage.set("auth", {
      user_uid: res.data.user.uid,
      token: res.data.token,
    } as StorageAuth);
    setAuthUser(res.data.user);
    setIsAuthenticated(true);
  }

  async function _authenticate() {
    const auth = (await storage.get("auth")) as StorageAuth | null;

    let _authUser: typeof authUser = null;
    let _chain: typeof chain = null;
    let _isAuthenticated: typeof isAuthenticated = null;
    try {
      if (auth && auth.user_uid && auth.token) {
        window.axios.defaults.auth = "Bearer " + auth.token;

        _authUser = (await userGetByUID(undefined, auth.user_uid)).data;

        _isAuthenticated = true;
      } else {
        throw new Error("Not authenticated");
      }
    } catch (err) {
      window.axios.defaults.auth = undefined;
      _isAuthenticated = false;
    }

    try {
      const chainUID: string | null = await storage.get("chain_uid");
      if (_isAuthenticated && chainUID) {
        _chain = (await chainGet(chainUID)).data;
      } else if (chainUID) {
        throw new Error("Not authenticated but still has chain_uid");
      }
    } catch (err) {
      await storage.set("chain_uid", null);
    }

    setChain(_chain);
    setAuthUser(_authUser);
    setIsAuthenticated(_isAuthenticated);
  }

  async function _setChain(c: Chain | null) {
    let _chainUsers: typeof chainUsers = [];
    if (c) _chainUsers = (await userGetAllByChain(c.uid)).data;

    await storage.set("chain_uid", c ? c.uid : null);
    setChain(c);
    setChainUsers(_chainUsers);
  }

  return (
    <StoreContext.Provider
      value={{
        authUser,
        chain,
        chainUsers,
        setChain: _setChain,
        isAuthenticated,
        logout: _logout,
        authenticate: _authenticate,
        login: _login,
        init: _init,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
