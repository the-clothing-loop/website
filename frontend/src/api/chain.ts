import { Chain, UID, User } from "./types";
import axios from "./axios";
import { RequestRegisterChain } from "./login";

export function chainGet(chainUID: UID) {
  return axios.get<Chain>("/v2/chain", {
    params: { chain_uid: chainUID },
  });
}

interface RequestChainGetAllParams {
  filter_sizes?: string[];
  filter_genders?: string[];
  filter_out_unpublished?: boolean;
}
export function chainGetAll(params?: RequestChainGetAllParams) {
  return axios.get<Chain[]>("/v2/chain/all", { params });
}

export function chainCreate(chain: RequestRegisterChain) {
  return axios.post<never>("/v2/chain", chain);
}

export type ChainUpdateBody = Partial<Chain> & { uid: UID };

export function chainUpdate(chain: ChainUpdateBody) {
  return axios.patch<never>("/v2/chain", chain);
}

export function chainAddUser(
  chainUID: UID,
  userUID: UID,
  isChainAdmin: boolean
) {
  return axios.post<never>("/v2/chain/add-user", {
    user_uid: userUID,
    chain_uid: chainUID,
    is_chain_admin: isChainAdmin,
  });
}

export function chainRemoveUser(chainUID: UID, userUID: UID) {
  return axios.post<never>("/v2/chain/remove-user", {
    user_uid: userUID,
    chain_uid: chainUID,
  });
}

export function userDelete(chainUID: string, userUID: string) {
  return axios.delete<never>("/v2/user", {
    params: { user_uid: userUID, chain_uid: chainUID },
  });
}

export function chainUserApprove(chainUID: string, userUID: string) {
  return axios.patch<never>("/v2/chain/approve-user", {
    user_uid: userUID,
    chain_uid: chainUID,
  });
}

export function chainDeleteUnapproved(chainUID: string, userUID: string) {
  return axios.delete<never>(
    `/v2/chain/unapproved-user?user_uid=${userUID}&chain_uid=${chainUID}`
  );
}

export function chainGetUnapproved(chainUID: string) {
  return axios.get<User[]>("v2/chain/unapproved-users", {
    params: { chain_uid: chainUID },
  });
}
