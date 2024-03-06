import redaxios from "redaxios";

export type UID = string;

export enum Sizes {
  baby = "1",
  "1To4YearsOld" = "2",
  "5To12YearsOld" = "3",
  womenSmall = "4",
  womenMedium = "5",
  womenLarge = "6",
  womenPlusSize = "7",
  menSmall = "8",
  menMedium = "9",
  menLarge = "A",
  menPlusSize = "B",
}

export const SizeI18nKeys: Record<Sizes | string, string> = {
  "1": "baby",
  "2": "1To4YearsOld",
  "3": "5To12YearsOld",
  "4": "womenSmall",
  "5": "womenMedium",
  "6": "womenLarge",
  "7": "womenPlusSize",
  "8": "menSmall",
  "9": "menMedium",
  A: "menLarge",
  B: "menPlusSize",
};

export interface User {
  uid: UID;
  email: string;
  name: string;
  phone_number: string;
  email_verified: boolean;
  chains: UserChain[];
  address: string;
  sizes: string[];
  is_root_admin: boolean;
  paused_until: null | string;
  i18n: string;
}

export interface UserUpdateBody {
  user_uid: UID;
  chain_uid?: UID;
  name?: string;
  phone_number?: string;
  newsletter?: boolean;
  sizes?: string[];
  address?: string;
  paused_until?: string;
  i18n?: string;
  theme?: string;
}

export interface UserChain {
  user_uid: UID;
  chain_uid: UID;
  is_chain_admin: boolean;
  is_approved: boolean;
  created_at: string;
}

export type ChainHeaders = Record<string, string>;

export interface Chain {
  uid: UID;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  genders: string[] | null;
  sizes: string[] | null;
  published: boolean;
  open_to_new_members: boolean;
  rules_override?: string;
  headers_override?: string;
  theme?: string;
  is_app_disabled?: boolean;
}

export interface Bag {
  id: number;
  number: string;
  color: string;
  chain_uid: UID;
  user_uid: UID;
  updated_at: string;
}
export interface BulkyItem {
  id: number;
  title: string;
  message: string;
  image_url: string;
  chain_uid: UID;
  user_uid: UID;
  created_at: string;
}

export const bagColors = [
  "#C9843E",
  "#AD8F22",
  "#79A02D",
  "#66926E",
  "#199FBA",
  "#6494C2",
  "#1467B3",
  "#A899C2",
  "#513484",
  "#B37EAD",
  "#B76DAC",
  "#F57BB0",
  "#A35C7B",
  "#E38C95",
  "#C73643",
  "#7D7D7D",
  "#3C3C3B",
];

window.axios = redaxios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  withCredentials: false,
});

export function loginEmail(email: string) {
  return window.axios.post<unknown>(
    "/v2/login/email",
    { email, app: true },
    { auth: undefined, withCredentials: false },
  );
}

export function loginValidate(u: string, apiKey: string) {
  return window.axios.get<{ user: User; token: string }>("/v2/login/validate", {
    auth: undefined,
    withCredentials: false,
    params: { apiKey, u },
  });
}

export function logout() {
  return window.axios.delete<never>("/v2/logout");
}

export function refreshToken() {
  return window.axios.post<never>("/v2/refresh-token");
}

export function userGetByUID(chainUID: string | undefined, userUID: string) {
  let params: { user_uid: string; chain_uid?: string } = { user_uid: userUID };
  if (chainUID) params.chain_uid = chainUID;

  return window.axios.get<User>("/v2/user", { params });
}

export function chainGet(
  chainUID: UID,
  o: {
    addRules?: boolean;
    addHeaders?: boolean;
    addTheme?: boolean;
    addIsAppDisabled?: boolean;
  } = {},
) {
  return window.axios.get<Chain>("/v2/chain", {
    params: {
      chain_uid: chainUID,
      add_rules: o.addRules || false,
      add_headers: o.addHeaders || false,
      add_theme: o.addTheme || false,
      add_is_app_disabled: o.addIsAppDisabled || false,
    },
  });
}

export type ChainUpdateBody = Partial<Chain> & { uid: UID };

export function chainUpdate(chain: ChainUpdateBody) {
  return window.axios.patch<never>("/v2/chain", chain);
}

export function userGetAllByChain(chainUID: UID) {
  return window.axios.get<User[]>("/v2/user/all-chain", {
    params: { chain_uid: chainUID },
  });
}

export function userUpdate(user: UserUpdateBody) {
  return window.axios.patch<never>("/v2/user", user);
}

export function routeGetOrder(chainUID: UID) {
  return window.axios.get<UID[]>("/v2/route/order", {
    params: { chain_uid: chainUID },
  });
}

export function bagGetAllByChain(chainUID: UID, userUID: UID) {
  return window.axios.get<Bag[]>("/v2/bag/all", {
    params: { chain_uid: chainUID, user_uid: userUID },
  });
}

export function bagPut(body: {
  chain_uid: UID;
  user_uid: UID;
  bag_id?: number;
  number?: string;
  holder_uid?: UID;
  color?: string;
  updated_at?: string;
}) {
  return window.axios.put("/v2/bag", body);
}

export function bagRemove(chainUID: UID, userUID: UID, bagID: number) {
  return window.axios.delete("/v2/bag", {
    params: { chain_uid: chainUID, user_uid: userUID, bag_id: bagID },
  });
}

export function bulkyItemGetAllByChain(chainUID: UID, userUID: UID) {
  return window.axios.get<BulkyItem[]>("/v2/bulky-item/all", {
    params: { chain_uid: chainUID, user_uid: userUID },
  });
}

export function bulkyItemPut(body: {
  id?: number;
  chain_uid: UID;
  user_uid: UID;
  title?: string;
  message?: string;
  image_url?: string;
}) {
  return window.axios.put("/v2/bulky-item", body);
}

export function bulkyItemRemove(chainUID: UID, userUID: UID, id: number) {
  return window.axios.delete("/v2/bulky-item", {
    params: { chain_uid: chainUID, user_uid: userUID, id },
  });
}

export function uploadImage(
  image64: string,
  size: number,
  expiration?: number,
) {
  let params: { size: number; expiration?: number } = { size };
  if (expiration) params.expiration = expiration;

  return window.axios.post<{
    delete: string;
    image: string;
    thumb: string;
  }>("/v2/image", image64, { params });
}

export interface OpenSourceLicense {
  name: string;
  modules: Array<string>;
}

export function getOpenSouceLicenses() {
  return window.axios.get<OpenSourceLicense[]>("/open_source_licenses.json", {
    baseURL: "",
  });
}

export interface RespPatchGetOrJoinRoom {
  chat_team: string;
  chat_channel: string;
  chat_user: string;
  chat_token?: string;
}
export function patchGetOrJoinRoom(chainUID: string, renewToken: boolean) {
  return window.axios.patch<RespPatchGetOrJoinRoom>(
    `/v2/chat/${chainUID}/room`,
    undefined,
    {
      params: { renew_token: renewToken },
    },
  );
}
