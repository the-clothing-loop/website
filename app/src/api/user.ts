import type { UID } from "./types";
import axios from "./axios";
import { User, UserUpdateRequest } from "./typex2";

export function userGetByUID(
  chainUID: string | undefined,
  userUID: string,
  { addApprovedTOH = false, addNotification = false },
) {
  let params: {
    user_uid: string;
    chain_uid?: string;
    add_approved_toh?: boolean;
    add_notification?: boolean;
  } = { user_uid: userUID };
  if (chainUID) params.chain_uid = chainUID;
  if (addApprovedTOH) params.add_approved_toh = true;
  if (addNotification) params.add_notification = true;

  return axios.get<User>("/v2/user", { params });
}

export function userGetAllByChain(chainUID: string) {
  return axios.get<User[]>("/v2/user/all-chain", {
    params: { chain_uid: chainUID },
  });
}

export function userUpdate(user: UserUpdateRequest) {
  return axios.patch<never>("/v2/user", user);
}

export function userAddAsChainAdmin(chainUID: string, userUID: string) {
  return axios.post<never>("/v2/user/add-as-chain-admin", {
    user_uid: userUID,
    chain_uid: chainUID,
  });
}

export function userPurge(userUID: string) {
  return axios.delete<never>("v2/user/purge", {
    params: { user_uid: userUID },
  });
}

export function userHasNewsletter(
  chainUID: string | undefined,
  userUID: string,
) {
  let params: { user_uid: UID; chain_uid?: UID } = { user_uid: userUID };
  if (chainUID) params.chain_uid = chainUID;
  return axios.get<boolean>("v2/user/newsletter", { params });
}

export function userTransferChain(
  fromChainUID: UID,
  toChainUID: UID,
  transferUserUID: UID,
  isCopy: boolean,
) {
  return axios.post<never>("v2/user/transfer-chain", {
    from_chain_uid: fromChainUID,
    to_chain_uid: toChainUID,
    transfer_user_uid: transferUserUID,
    is_copy: isCopy,
  });
}

export function userCheckEmailExists(email: string) {
  return axios.get<boolean>("/v2/user/check-email", {
    params: { email },
  });
}
