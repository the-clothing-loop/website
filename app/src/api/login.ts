import { Sizes } from "./enums";
import type { UID } from "./types";
import axios from "./axios";
import {
  ChainCreateRequest,
  RegisterBasicUserRequest,
  RegisterChainAdminRequest,
  User,
  UserCreateRequest,
} from "./typex2";

export function registerChainAdmin(
  user: UserCreateRequest,
  chain: ChainCreateRequest,
) {
  return axios.post<never>("/v2/register/chain-admin", {
    user,
    chain,
  } satisfies RegisterChainAdminRequest);
}

export function registerBasicUser(user: UserCreateRequest, chainUID: UID) {
  return axios.post<never>("/v2/register/basic-user", {
    user,
    chain_uid: chainUID,
  } satisfies RegisterBasicUserRequest);
}

export function registerOrphanedUser(user: UserCreateRequest) {
  return axios.post<never>("/v2/register/orphaned-user", {
    user,
  });
}

export function loginEmail(email: string, isApp: boolean) {
  return axios.post<unknown>(
    "/v2/login/email",
    { email, app: isApp },
    { auth: undefined },
  );
}

export function loginEmailAndAddToChain(email: string, chainUID: UID) {
  return axios.post<unknown>("/v2/login/email", {
    email,
    chain_uid: chainUID,
  });
}

export function loginValidate(u: string, apiKey: string, chainUID: UID = "") {
  let params: Record<string, string> = { u, apiKey };
  if (chainUID) {
    params["c"] = chainUID;
  }
  return axios.get<{ user: User; token: string }>(`/v2/login/validate`, {
    params,
    auth: undefined,
  });
}

export function logout() {
  return axios.delete<never>("/v2/logout");
}

export function refreshToken() {
  return axios.post<{ user: User; token: string }>("/v2/refresh-token");
}

export function loginSuperAsGenerateLink(userUID: UID, isApp: boolean) {
  return axios.post<string>("/v2/login/super/as", {
    user_uid: userUID,
    is_app: isApp,
  });
}
