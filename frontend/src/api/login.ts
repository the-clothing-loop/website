import { Sizes } from "./enums";
import { User } from "./types";

export interface RequestRegisterUser {
  name: string;
  email: string;
  address: string;
  phone_number: string;
  newsletter: boolean;
  sizes: Array<Sizes | string>;
  longitude: number;
  latitude: number;
}

export interface RequestRegisterChain {
  name: string;
  description: string;
  address: string;
  country_code?: string;
  latitude: number;
  longitude: number;
  radius: number;
  open_to_new_members: boolean;
  sizes: Array<Sizes | string> | null;
  genders: Array<Sizes | string> | null;
}

export function registerChainAdmin(
  user: RequestRegisterUser,
  chain: RequestRegisterChain
) {
  return window.axios.post<never>("/v2/register/chain-admin", { user, chain });
}

export function registerBasicUser(user: RequestRegisterUser, chainUID: string) {
  return window.axios.post<never>("/v2/register/basic-user", {
    user,
    chain_uid: chainUID,
  });
}

export function registerOrphanedUser(user: RequestRegisterUser) {
  return window.axios.post<never>("/v2/register/orphaned-user", {
    user,
  });
}

export function loginEmail(email: string) {
  return window.axios.post<unknown>("/v2/login/email", { email });
}

export function loginEmailAndAddToChain(email: string, chainUID: string) {
  return window.axios.post<unknown>("/v2/login/email", {
    email,
    chain_uid: chainUID,
  });
}

export function loginValidate(key: string) {
  return window.axios.get<{ user: User }>(`/v2/login/validate?apiKey=${key}`);
}

export function logout() {
  return window.axios.delete<never>("/v2/logout");
}
