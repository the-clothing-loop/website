import { Chain, UID } from "./types";
import { RequestRegisterChain } from "./login";

export function chainGet(
  chainUID: UID,
  addTotals = false,
  addIsAppDisabled = false,
  AddRoutePrivacy = false
) {
  return window.axios.get<Chain>("/v2/chain", {
    params: {
      chain_uid: chainUID,
      add_totals: addTotals,
      add_is_app_disabled: addIsAppDisabled,
      add_route_privacy: AddRoutePrivacy,
    },
  });
}

interface RequestChainGetAllParams {
  filter_sizes?: string[];
  filter_genders?: string[];
  filter_out_unpublished?: boolean;
  add_rules?: boolean;
}
export function chainGetAll(params?: RequestChainGetAllParams) {
  return window.axios.get<Chain[]>("/v2/chain/all", { params });
}

export function chainCreate(chain: RequestRegisterChain) {
  return window.axios.post<never>("/v2/chain", chain);
}

export type ChainUpdateBody = Partial<Chain> & { uid: UID };

export function chainUpdate(chain: ChainUpdateBody) {
  return window.axios.patch<never>("/v2/chain", chain);
}

export function chainDelete(chainUID: UID) {
  return window.axios.delete<never>(`/v2/chain?chain_uid=${chainUID}`);
}

export function chainAddUser(
  chainUID: UID,
  userUID: UID,
  isChainAdmin: boolean
) {
  return window.axios.post<never>("/v2/chain/add-user", {
    user_uid: userUID,
    chain_uid: chainUID,
    is_chain_admin: isChainAdmin,
  });
}

export function chainRemoveUser(chainUID: UID, userUID: UID) {
  return window.axios.post<never>("/v2/chain/remove-user", {
    user_uid: userUID,
    chain_uid: chainUID,
  });
}

export function chainUserApprove(chainUID: UID, userUID: UID) {
  return window.axios.patch<never>("/v2/chain/approve-user", {
    user_uid: userUID,
    chain_uid: chainUID,
  });
}

export enum UnapprovedReason {
  OTHER = "other",
  TOO_FAR_AWAY = "too_far_away",
  SIZES_GENDERS = "sizes_genders",
  LOOP_NOT_ACTIVE = "loop_not_active",
}

export function chainDeleteUnapproved(
  chainUID: UID,
  userUID: UID,
  reason: UnapprovedReason
) {
  return window.axios.delete<never>(
    `/v2/chain/unapproved-user?user_uid=${userUID}&chain_uid=${chainUID}&reason=${reason}`
  );
}

export function chainPoke(chainUID: UID) {
  return window.axios.post<never>("/v2/chain/poke", {
    chain_uid: chainUID,
  });
}
