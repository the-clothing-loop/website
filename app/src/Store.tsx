import { createContext, useMemo, useState } from "react";
import { Storage } from "@ionic/storage";
import {
  chainGet,
  userGetByUID,
  User,
  Chain,
  logout,
  loginValidate,
  userGetAllByChain,
  UID,
  routeGetOrder,
  Bag,
  bagGetAllByChain,
  BulkyItem,
  bulkyItemGetAllByChain,
  userUpdate,
  chainUpdate,
  ChainHeaders,
  refreshToken,
} from "./api";
import dayjs from "./dayjs";
import { OverlayContainsState, OverlayState } from "./utils/overlay_open";

interface StorageAuth {
  user_uid: string;
  token: string;
}

export enum IsAuthenticated {
  Unknown,
  LoggedIn,
  LoggedOut,
  OfflineLoggedIn,
}

type BagListView = "dynamic" | "list" | "card";

export const StoreContext = createContext({
  isAuthenticated: IsAuthenticated.Unknown,
  isChainAdmin: false,
  isThemeDefault: true,
  authUser: null as null | User,
  setPause: (date: Date | boolean) => {},
  setTheme: (c: string) => {},
  chain: null as Chain | null,
  chainUsers: [] as Array<User>,
  chainHeaders: undefined as ChainHeaders | undefined,
  getChainHeader: (key: string, override: string) => override,
  listOfChains: [] as Array<Chain>,
  route: [] as UID[],
  bags: [] as Bag[],
  bulkyItems: [] as BulkyItem[],
  setChain: (chainUID: UID | null | undefined, user: User | null) =>
    Promise.reject<void>(),
  authenticate: () => Promise.resolve(IsAuthenticated.Unknown),
  login: (email: string, token: string) => Promise.reject<void>(),
  logout: () => Promise.reject<void>(),
  init: () => Promise.reject<void>(),
  refresh: (tab: string) => Promise.reject<void>(),
  overlayState: OverlayState.OPEN_ALL,
  closeOverlay: (s: OverlayState) => {},
  bagListView: "dynamic" as BagListView,
  setBagListView: (v: BagListView) => {},
  connError: (err: any) => Promise.resolve(IsAuthenticated.Unknown),
  shouldBlur: false,
});

const errLoopMustBeSelected =
  "You must have first selected a Loop in the settings tab.";

export function StoreProvider({
  children,
  onIsOffline,
}: {
  children: React.ReactNode;
  onIsOffline: (err: any) => void;
}) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [chain, _setChain] = useState<Chain | null>(null);
  const [chainHeaders, setChainHeaders] = useState<ChainHeaders | undefined>(
    undefined,
  );
  const [chainUsers, setChainUsers] = useState<Array<User>>([]);
  const [listOfChains, setListOfChains] = useState<Array<Chain>>([]);
  const [route, setRoute] = useState<UID[]>([]);
  const [bags, setBags] = useState<Bag[]>([]);
  const [bulkyItems, setBulkyItems] = useState<BulkyItem[]>([]);
  const [storage, setStorage] = useState(new Storage({ name: "store_v1" }));
  const [isAuthenticated, setIsAuthenticated] = useState(
    IsAuthenticated.Unknown,
  );
  const [isChainAdmin, setIsChainAdmin] = useState(false);
  const [overlayState, setOverlayState] = useState(OverlayState.OPEN_ALL);
  const [bagListView, _setBagListView] = useState<BagListView>("dynamic");

  const shouldBlur = useMemo(() => {
    let isAppDisabledPopup =
      chain?.is_app_disabled &&
      !OverlayContainsState(
        overlayState,
        OverlayState.CLOSE_CHAIN_APP_DISABLED,
      );

    let isDraftPopup =
      !chain?.published &&
      !OverlayContainsState(overlayState, OverlayState.CLOSE_PAUSED);

    return isAppDisabledPopup || isDraftPopup || false;
  }, [chain, overlayState]);

  const isThemeDefault = useMemo(() => {
    let theme = chain?.theme;
    if (!theme) return true;
    if (theme === "default") return true;

    return false;
  }, [chain]);

  // Get storage from IndexedDB or LocalStorage
  async function init() {
    const _storage = await storage.create();

    const version = (await _storage.get("version")) as number | null;
    if (version !== 1) {
      await _storage.set("version", 1);
    }
    _setBagListView((await _storage.get("bag_list_view")) || "dynamic");
    setStorage(_storage);
  }

  async function logout() {
    window.plugins?.OneSignal?.removeExternalUserId();
    await logout().catch((err) => {
      console.warn(err);
    });
    window.axios.defaults.auth = undefined;

    await storage.set("auth", "");
    await storage.set("chain_uid", "");
    setAuthUser(null);
    _setChain(null);
    setChainHeaders(undefined);
    setListOfChains([]);
    setRoute([]);
    setBags([]);
    setBulkyItems([]);
    setIsAuthenticated(IsAuthenticated.LoggedOut);
    setIsChainAdmin(false);
    _setBagListView("dynamic");
  }

  async function login(email: string, token: string) {
    let emailBase64 = btoa(email);
    const res = await loginValidate(emailBase64, token);
    window.axios.defaults.auth = "Bearer " + res.data.token;
    await storage.set("auth", {
      user_uid: res.data.user.uid,
      token: res.data.token,
    } as StorageAuth);
    setAuthUser(res.data.user);
    setIsAuthenticated(IsAuthenticated.LoggedIn);
    refresh("settings", res.data.user);
  }

  // Will set the isAuthenticated value and directly return it as well (no need to run setIsAuthenticated)
  async function authenticate(): Promise<IsAuthenticated> {
    console.log("run authenticate");
    const auth = (await storage.get("auth")) as StorageAuth | null;

    let _authUser: typeof authUser = null;
    let _isAuthenticated: typeof isAuthenticated = IsAuthenticated.Unknown;
    let _isChainAdmin: typeof isChainAdmin = false;
    try {
      if (auth && auth.user_uid) {
        await refreshToken();
        _authUser = (await userGetByUID(undefined, auth.user_uid)).data;

        _isAuthenticated = IsAuthenticated.LoggedIn;
      } else {
        // logout without clearing empty token
        console.log("logout without clearing empty token");
        _isAuthenticated = IsAuthenticated.LoggedOut;
        window.axios.defaults.auth = undefined;
        setIsAuthenticated(_isAuthenticated);
        return _isAuthenticated;
      }
    } catch (err: any) {
      _isAuthenticated = await connError(err);
      return _isAuthenticated;
    }

    // at this point it is safe to assume _isAuthenticated is LoggedIn

    window.plugins?.OneSignal?.setExternalUserId(_authUser.uid);
    let chainUID: string | null = null;
    try {
      chainUID = await storage.get("chain_uid");
      // if empty get the first in the list
      const approvedChains = _authUser.chains.filter((uc) => uc.is_approved);
      if (!chainUID && approvedChains.length > 0) {
        chainUID = approvedChains[0].chain_uid;
      }

      if (!chainUID) {
        console.info("Authenticated but has no selected chain_uid");
      }
      await setChain(chainUID, _authUser);
    } catch (err: any) {
      console.error(err);
      return err?.isAuthenticated || IsAuthenticated.OfflineLoggedIn;
    }

    setAuthUser(_authUser);
    setIsAuthenticated(_isAuthenticated);
    return _isAuthenticated;
  }

  async function setChain(
    _chainUID: UID | null | undefined,
    _authUser: User | null,
  ) {
    let _chain: typeof chain = null;
    let _chainUsers: typeof chainUsers = [];
    let _chainHeaders: typeof chainHeaders = undefined;
    let _route: typeof route = [];
    let _bags: typeof bags = [];
    let _isChainAdmin: typeof isChainAdmin = false;
    let _bulkyItems: typeof bulkyItems = [];
    if (_chainUID && _authUser) {
      try {
        const res = await Promise.all([
          chainGet(_chainUID, {
            addRules: true,
            addHeaders: true,
            addTheme: true,
            addIsAppDisabled: true,
          }),
          userGetAllByChain(_chainUID),
          routeGetOrder(_chainUID),
          bagGetAllByChain(_chainUID, _authUser.uid),
          bulkyItemGetAllByChain(_chainUID, _authUser.uid),
        ]);
        _chain = res[0].data;
        _chainHeaders = ChainReadHeaders(_chain);
        _chainUsers = res[1].data;
        _route = res[2].data;
        _bags = res[3].data;
        _bulkyItems = res[4].data;
        _isChainAdmin = IsChainAdmin(_authUser, _chainUID);
      } catch (err: any) {
        let _isAuthenticated = IsAuthenticated.OfflineLoggedIn;
        if (err?.status === 401) {
          _isAuthenticated = IsAuthenticated.LoggedOut;
        }
        err.isAuthenticated = _isAuthenticated;
        setIsAuthenticated(_isAuthenticated);
        onIsOffline(err);
        return;
      }
    }

    await storage.set("chain_uid", _chainUID ? _chainUID : null);
    _setChain(_chain);
    setChainHeaders(_chainHeaders);
    setChainUsers(_chainUsers);
    setRoute(_route);
    setBags(_bags);
    setBulkyItems(_bulkyItems);
    setIsChainAdmin(_isChainAdmin);
  }

  async function setTheme(c: string) {
    if (!chain) throw Error("No loop selected");
    const oldTheme = chain.theme;
    _setChain((s) => ({ ...(s as Chain), theme: c }));
    chainUpdate({
      uid: chain.uid,
      theme: c,
    }).catch((e) => {
      _setChain((s) => ({ ...(s as Chain), theme: oldTheme }));
    });
  }

  async function setPause(pause: Date | boolean) {
    if (!authUser) return;

    let pauseUntil = dayjs();
    if (pause === true) {
      pauseUntil = pauseUntil.add(100, "years");
    } else if (pause === false || pause < new Date()) {
      pauseUntil = pauseUntil.add(-1, "week");
    } else {
      pauseUntil = dayjs(pause);
    }
    await userUpdate({
      user_uid: authUser.uid,
      paused_until: pauseUntil.format(),
    });
    const _authUser = (await userGetByUID(undefined, authUser.uid)).data;
    setAuthUser(_authUser);

    if (chain) {
      const _chainUsers = (await userGetAllByChain(chain.uid)).data;
      setChainUsers(_chainUsers);
    }
  }

  async function refresh(tab: string, __authUser: User | null): Promise<void> {
    if (!__authUser) logout();

    try {
      if (tab === "help") {
        if (!chain) throw errLoopMustBeSelected;

        let _chain = await chainGet(chain.uid, {
          addRules: true,
          addHeaders: true,
          addTheme: true,
          addIsAppDisabled: true,
        });
        _setChain(_chain.data);
      } else if (tab === "address" || tab === "bags") {
        if (!chain) throw errLoopMustBeSelected;

        const [_chainUsers, _route, _bags] = await Promise.all([
          userGetAllByChain(chain.uid),
          routeGetOrder(chain.uid),
          bagGetAllByChain(chain.uid, __authUser!.uid),
        ]);
        setChainUsers(_chainUsers.data);
        setRoute(_route.data);
        setBags(_bags.data);
      } else if (tab === "bulky-items") {
        if (!chain) throw errLoopMustBeSelected;
        const [_chainUsers, _bulkyItems] = await Promise.all([
          userGetAllByChain(chain.uid),
          bulkyItemGetAllByChain(chain.uid, __authUser!.uid),
        ]);
        setChainUsers(_chainUsers.data);
        setBulkyItems(_bulkyItems.data);
      } else if (tab === "settings") {
        const _authUser = await userGetByUID(undefined, __authUser!.uid);
        let _chain: Chain | null = null;
        const _listOfChains = await Promise.all(
          _authUser.data.chains
            .filter((uc) => uc.is_approved)
            .map((uc) => {
              const isCurrentChain = uc.chain_uid === chain?.uid;
              return chainGet(uc.chain_uid, {
                addRules: isCurrentChain,
                addHeaders: isCurrentChain,
                addTheme: isCurrentChain,
                addIsAppDisabled: true,
              });
            }),
        ).then((resp) =>
          resp.map((c) => {
            if (c.data.uid === chain?.uid) {
              _chain = c.data;
            }
            return c.data;
          }),
        );

        setAuthUser(_authUser.data);
        setListOfChains(_listOfChains);
        _setChain(_chain);
        setChainHeaders(ChainReadHeaders(_chain));
      }
    } catch (err: any) {
      if (err === errLoopMustBeSelected) {
        throw err;
      } else {
        await connError(err);
      }
    }
  }

  function closeOverlay(sTo: OverlayState) {
    setOverlayState((s) => {
      let newTo = s + sTo;
      if (newTo > OverlayState.CLOSE_ALL) newTo = OverlayState.CLOSE_ALL;
      return newTo;
    });
    setTimeout(
      () => {
        setOverlayState(OverlayState.OPEN_ALL);
      },
      1000 * 60 * 60, // 1 hour
    );
  }

  function setBagListView(v: BagListView) {
    _setBagListView(v);
    storage.set("bag_list_view", v);
  }

  async function connError(err: any) {
    if (err?.status === 401) {
      await logout();
      return IsAuthenticated.LoggedOut;
    }
    console.log("Connection error");
    onIsOffline(err);
    return IsAuthenticated.OfflineLoggedIn;
  }

  function getChainHeader(key: string, override: string): string {
    if (chainHeaders && chainHeaders[key]) {
      return chainHeaders[key];
    }

    return override;
  }

  return (
    <StoreContext.Provider
      value={{
        authUser,
        setPause,
        setTheme,
        route,
        bags,
        bulkyItems,
        chain,
        chainHeaders,
        isThemeDefault,
        chainUsers,
        getChainHeader,
        listOfChains,
        setChain,
        isAuthenticated,
        isChainAdmin,
        logout,
        authenticate,
        login,
        init,
        refresh: (t) => refresh(t, authUser),
        overlayState,
        closeOverlay,
        bagListView,
        setBagListView,
        connError,
        shouldBlur,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function IsChainAdmin(
  user: User | null,
  chainUID: UID | null | undefined,
): boolean {
  const userChain = chainUID
    ? user?.chains.find((uc) => uc.chain_uid === chainUID)
    : undefined;
  return userChain?.is_chain_admin || false;
}

function ChainReadHeaders(
  chain: Chain | null | undefined,
): ChainHeaders | undefined {
  if (chain?.headers_override) {
    return JSON.parse(chain.headers_override);
  }
}
