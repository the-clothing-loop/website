import axios from "./axios";
import { UID, User } from "./types";

export function userGetByUID(chainUID: string | null, userUID: string) {
  interface Params {
    user_uid: string;
    chain_uid?: string;
  }
  let params: Params = { user_uid: userUID };
  if (chainUID !== null) {
    params.chain_uid = chainUID;
  }

  return axios.get<User>("/v2/user", { params });
}

export function userGetAllByChain(chainUID: string) {
  return axios.get<User[]>("/v2/user/all-chain", {
    params: { chain_uid: chainUID },
  });
}

export function userGetByEmail(chainUID: string, email: string) {
  return axios.get<User>("/v2/user", {
    params: {
      chain_uid: chainUID,
      email: email,
    },
  });
}

export interface UserUpdateBody {
  user_uid: UID;
  chain_uid: UID;
  name?: string;
  phone_number?: string;
  newsletter?: boolean;
  sizes?: string[];
  address?: string;
}
export function userUpdate(user: UserUpdateBody) {
  return axios.patch("/v2/user", user);
}

export function userAddAsChainAdmin(chainUID: string, userUID: string) {
  return axios.post("/v2/user/add-as-chain-admin", {
    user_uid: userUID,
    chain_uid: chainUID,
  });
}

export function userDelete(chainUID: string, userUID: string) {
  return axios.delete(`/v2/user/?user_uid=${userUID}&chain_uid=${chainUID}`);
}

export function userPurge(userUID: string) {
  return axios.delete(`v2/user/purge?user_uid=${userUID}`);
}

export function userHasNewsletter(userUID: string){
  return axios.get(`v2/user/newsletter?user_uid=${userUID}`);
}