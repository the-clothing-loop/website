import axios from "redaxios";
import { Gender, Size } from "./enums";
import { User } from "./types";

export function userGetByUID(chainUID: string, uid: string) {
  return axios.get<User>("/user", {
    params: {
      chain_uid: chainUID,
      user_uid: uid,
    },
  });
}

export function userGetByEmail(chainUID: string, email: string) {
  return axios.get<User>("/user", {
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
  sizes?: Size[];
  address?: string;
}
export function userUpdate(user: UserUpdateBody) {
  return axios.patch("/user", user);
}

export function userAddAsChainAdmin(chainUID: string, userUID: string) {
  return axios.post("/user/add-as-chain-admin", {
    user_uid: userUID,
    chain_uid: chainUID,
  });
}

export function userDelete(chainUID: string, userUID: string) {
  return axios.delete(`/user/?user_uid=${userUID}&chain_uid=${chainUID}`);
}
