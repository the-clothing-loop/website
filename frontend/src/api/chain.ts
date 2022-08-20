import { Chain, UID } from "./types";
import axios from "redaxios";
import { Gender, Size } from "./enums";

export function chainGet(chainUID: UID) {
  return axios.get<Chain>("/chain", {
    body: { chain_uid: chainUID },
  });
}
export function chainGetAll() {
  return axios.get<Chain[]>("/chain/all", {
    body: {},
  });
}

export interface ChainUpdateBody {
  name?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  sizes?: Size[];
  genders?: Gender[];
}
export function chainUpdate(chain: ChainUpdateBody) {
  return axios.patch("/chain", chain);
}

export function chainAddUser(
  chainUID: UID,
  userUID: UID,
  isChainAdmin: boolean
) {
  return axios.post("/chain/add-user", {
    user_uid: userUID,
    chain_uid: chainUID,
    is_chain_admin: isChainAdmin,
  });
}

export function userDelete(chainUID: string, userUID: string) {
  return axios.delete("/user", {
    params: { user_uid: userUID, chain_uid: chainUID },
  });
}
