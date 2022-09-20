import axios from "./axios";
import { User } from "./types";

export interface RequestRegisterUser {
  name: string;
  email: string;
  address: string;
  phone_number: string;
  newsletter: boolean;
  sizes: string[] | null;
}

export interface RequestRegisterChain {
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  open_to_new_members: boolean;
  sizes: string[] | null;
  genders: string[] | null;
}

export function registerChainAdmin(
  user: RequestRegisterUser,
  chain: RequestRegisterChain
) {
  return axios.post("/v2/register/chain-admin", { user, chain });
}

export function registerBasicUser(user: RequestRegisterUser, chainUID: string) {
  return axios.post("/v2/register/basic-user", { user, chain_uid: chainUID });
}

export function loginEmail(email: string) {
  return axios.post("/v2/login/email", { email });
}

export function loginValidate(key: string) {
  return axios.get<User>(`/v2/login/validate?apiKey=${key}`);
}

export function logout() {
  return axios.delete("/v2/logout");
}
