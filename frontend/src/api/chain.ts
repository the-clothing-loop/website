import { Chain, UID } from "./types";
import axios from "./axios";
import { RequestRegisterChain } from "./login";

export function chainGet(chainUID: UID) {
  return axios.get<Chain>("/v1/chain", {
    body: { chain_uid: chainUID },
  });
}
export function chainGetAll() {
  return axios.get<Chain[]>("/v1/chain/all", {
    body: {},
  });
}

export function chainCreate(chain: RequestRegisterChain) {
  return axios.post("/v1/chain", chain);
}

export type ChainUpdateBody = Partial<Chain> & { uid: UID };

export function chainUpdate(chain: ChainUpdateBody) {
  return axios.patch("/v1/chain", chain);
}

export function chainAddUser(
  chainUID: UID,
  userUID: UID,
  isChainAdmin: boolean
) {
  return axios.post("/v1/chain/add-user", {
    user_uid: userUID,
    chain_uid: chainUID,
    is_chain_admin: isChainAdmin,
  });
}

export function chainRemoveUser(chainUID: UID, userUID: UID) {
  return axios.post("/v1/chain/remove-user", {
    user_uid: userUID,
    chain_uid: chainUID,
  });
}

export function userDelete(chainUID: string, userUID: string) {
  return axios.delete("/v1/user", {
    params: { user_uid: userUID, chain_uid: chainUID },
  });
}
