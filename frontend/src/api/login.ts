import axios from "redaxios";
import { Chain, User } from "./types";

export function registerChainAdmin(user: User, chain: Chain) {
  return axios.post("/register/chain-admin", { user, chain });
}

export function registerBasicUser(user: User) {
  return axios.post("/register/basic-user", { user });
}

export function loginEmail(email: string) {
  return axios.post("/login/email", { email });
}

export function loginValidate(key: string) {
  return axios.get(`/login/validate?apiKey=${key}`);
}

export function logout() {
  return axios.delete("/logout");
}
