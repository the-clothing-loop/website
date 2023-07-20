import { OptimalPath, UID } from "./types";

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

export function routeOptimizeOrder(chainUID: UID) {
  return window.axios.get<OptimalPath>("/v2/route/optimize", {
    params: { chain_uid: chainUID },
  });
}
