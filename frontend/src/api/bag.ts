import type { Bag, UID } from "./types";
import axios from "./axios";

export function bagGetAllByChain(chainUID: UID, userUID: UID) {
  return axios.get<Bag[]>("/v2/bag/all", {
    params: { chain_uid: chainUID, user_uid: userUID },
  });
}

export function bagPut(body: {
  chain_uid: UID;
  user_uid: UID;
  bag_id?: number;
  number?: string;
  holder_uid?: UID;
  color?: string;
}) {
  return axios.put("/v2/bag", body);
}

export function bagRemove(chainUID: UID, userUID: UID, bagID: number) {
  return axios.delete("/v2/bag", {
    params: { chain_uid: chainUID, user_uid: userUID, bag_id: bagID },
  });
}
