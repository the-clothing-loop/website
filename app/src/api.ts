import redaxios from "redaxios";

export type UID = string;

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
}

export interface UserChain {
  user_uid: UID;
  chain_uid: UID;
  is_chain_admin: boolean;
  is_approved: boolean;
  created_at: string;
}

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
}

window.axios = redaxios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  withCredentials: false,
});

export function loginEmail(email: string) {
  return window.axios.post<never>(
    "/v2/login/email",
    { email },
    { auth: undefined, withCredentials: false }
  );
}

export function loginValidate(key: string) {
  return window.axios.get<{ user: User; token: string }>(
    `/v2/login/validate?apiKey=${key}`,
    { auth: undefined, withCredentials: false }
  );
}

export function logout() {
  return window.axios.delete<never>("/v2/logout");
}

export function userGetByUID(chainUID: string | undefined, userUID: string) {
  let params: { user_uid: string; chain_uid?: string } = { user_uid: userUID };
  if (chainUID) params.chain_uid = chainUID;

  return window.axios.get<User>("/v2/user", { params });
}

export function chainGet(chainUID: UID) {
  return window.axios.get<Chain>("/v2/chain", {
    params: { chain_uid: chainUID },
  });
}

export function userGetAllByChain(chainUID: string) {
  return window.axios.get<User[]>("/v2/user/all-chain", {
    params: { chain_uid: chainUID },
  });
}
