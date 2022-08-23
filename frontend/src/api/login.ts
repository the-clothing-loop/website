import axios from "./axios";
import { Chain, User } from "./types";

export function registerChainAdmin(user: User, chain: Chain) {
  return axios.post("/v1/register/chain-admin", { user, chain });
}

export function registerBasicUser(user: User) {
  return axios.post("/v1/register/basic-user", { user });
}

export function loginEmail(email: string) {
  return axios.post("/v1/login/email", { email });
}

export function loginValidate(key: string) {
  return axios.get(`/login/validate?apiKey=${key}`);
}

export function logout() {
  return axios.delete("/v1/logout");
}
