import axios from "redaxios";
import { InterestedSizes } from "../types";

export function userGetByUID(chainUID: string, uid: string) {
  return axios.get("/user", {
    query: {
      chain_uid: chainUID,
      uid: uid,
    },
  });
}

export function userGetByEmail(chainUID: string, email: string) {
  return axios.get("/user", {
    query: {
      chain_uid: chainUID,
      email: email,
    },
  });
}

export interface UserUpdateBody {
  name?: string;
  phone_number?: string;
  newsletter?: boolean;
  sizes?: InterestedSizes[];
  address?: string;
}
export function userUpdate(user: UserUpdateBody) {
  return axios.patch("/user", user);
}

export interface UserCreateBody {
  email: string;
  chain_uids: string[];
  name: string;
  phone_number: string;
  newsletter: boolean;
  interested_sizes: InterestedSizes[];
}
export function userCreate() {
  return axios.put("/user");
}

export function userAddAsChainAdmin(chainUID: string, uid: string) {
  return axios.post("/user/add-as-chain-admin", {});
}
