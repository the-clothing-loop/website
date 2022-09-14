import axios from "./axios";
import { User } from "./types";

export interface RequestRegisterUser {
  name: string;
  email: string;
  phone_number: string;
  address: string;
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

export function registerBasicUser(user: RequestRegisterUser) {
  return axios.post("/v2/register/basic-user", { user });
}

export function loginEmail(email: string) {
  return axios.post("/v2/login/email", { email });
}

export function loginValidate(key: string) {
  return axios.get<User>(`/login/validate?apiKey=${key}`);
}

export function logout() {
  return axios.delete("/v2/logout");
}
