import { UID } from "./types";

export function routeGetOrder(chainUID: UID) {
  return window.axios.get<UID[]>("/v2/route/order", {
    params: { chain_uid: chainUID },
  });
}

export function routeSetOrder(chainUID: UID, userUIDs: UID[]) {
  return window.axios.post<never>("/v2/route/order", {
    chain_uid: chainUID,
    route_order: userUIDs,
  });
}
