import axios from "./axios";
import { UID, User } from "./types";

export function userGetByUID(chainUID: string | undefined, userUID: string) {
  let params: { user_uid: string; chain_uid?: string } = { user_uid: userUID };
  if (chainUID) params.chain_uid = chainUID;

  return axios.get<User>("/v2/user", { params });
}

export function userGetAllByChain(chainUID: string) {
  return axios.get<User[]>("/v2/user/all-chain", {
    params: { chain_uid: chainUID },
  });
}

export interface UserUpdateBody {
  user_uid: UID;
  chain_uid?: UID;
  name?: string;
  phone_number?: string;
  newsletter?: boolean;
  sizes?: string[];
  address?: string;
}
export function userUpdate(user: UserUpdateBody) {
  return axios.patch<never>("/v2/user", user);
}

export function userAddAsChainAdmin(chainUID: string, userUID: string) {
  return axios.post<never>("/v2/user/add-as-chain-admin", {
    user_uid: userUID,
    chain_uid: chainUID,
  });
}

export function userDelete(chainUID: string, userUID: string) {
  return axios.delete<never>("/v2/user/", {
    params: { user_uid: userUID, chain_uid: chainUID },
  });
}

export function userPurge(userUID: string) {
  return axios.delete<never>("v2/user/purge", {
    params: { user_uid: userUID },
  });
}

export function userHasNewsletter(
  chainUID: string | undefined,
  userUID: string
) {
  let params: { user_uid: UID; chain_uid?: UID } = { user_uid: userUID };
  if (chainUID) params.chain_uid = chainUID;
  return axios.get<boolean>("v2/user/newsletter", { params });
}
