import type { OptimalPath, UID } from "./types";
import axios from "./index";

export function routeGetOrder(chainUID: UID) {
  return axios.get<UID[]>("/v2/route/order", {
    params: { chain_uid: chainUID },
  });
}

export function routeSetOrder(chainUID: UID, userUIDs: UID[]) {
  return axios.post<never>("/v2/route/order", {
    chain_uid: chainUID,
    route_order: userUIDs,
  });
}

export function routeOptimizeOrder(chainUID: UID) {
  return axios.get<OptimalPath>("/v2/route/optimize", {
    params: { chain_uid: chainUID },
  });
}

export interface RouteCoordinate {
  user_uid: string;
  latitude: number;
  longitude: number;
  route_order: number;
}

export function routeCoordinates(chainUID: UID) {
  return axios.get<RouteCoordinate[]>("/v2/route/coordinates", {
    params: { chain_uid: chainUID },
  });
}
