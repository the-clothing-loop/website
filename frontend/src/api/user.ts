import axios from "./axios";
import { User } from "./types";

export function userGetByUID(chainUID: string | null, userUID: string) {
  interface Params {
    user_uid: string;
    chain_uid?: string;
  }
  let params: Params = { user_uid: userUID };
  if (chainUID !== null) {
    params.chain_uid = chainUID;
  }

  return axios.get<User>("/v1/user", { params });
}

export function userGetAllByChain(chainUID: string) {
  return axios.get<User[]>("/v1/user/all-chain", {
    params: { chain_uid: chainUID },
  });
}

export function userGetByEmail(chainUID: string, email: string) {
  return axios.get<User>("/v1/user", {
    params: {
      chain_uid: chainUID,
      email: email,
    },
  });
}

export interface UserUpdateBody {
  name?: string;
  phone_number?: string;
  newsletter?: boolean;
  sizes?: string[];
  address?: string;
}
export function userUpdate(user: UserUpdateBody) {
  return axios.patch("/v1/user", user);
}

export function userAddAsChainAdmin(chainUID: string, userUID: string) {
  return axios.post("/v1/user/add-as-chain-admin", {
    user_uid: userUID,
    chain_uid: chainUID,
  });
}

export function userDelete(chainUID: string, userUID: string) {
  return axios.delete(`/user/?user_uid=${userUID}&chain_uid=${chainUID}`);
}
