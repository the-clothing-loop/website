import type { OptimalPath, UID } from "./types";
import axios from "./axios";

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

// user uid will be used for participants to anonymise the route
export function routeCoordinates(chainUID: UID, userUID?: UID) {
  const params: any = { chain_uid: chainUID };
  if (userUID) params.user_uid = userUID;
  return axios.get<RouteCoordinate[]>("/v2/route/coordinates", { params });
}
