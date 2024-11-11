import axios from "./axios";
import type { UID } from "./types";
import type { BulkyItem } from "./typex2";

export function bulkyItemGetAllByChain(chainUID: UID, userUID: UID) {
  return axios.get<BulkyItem[]>("/v2/bulky-item/all", {
    params: { chain_uid: chainUID, user_uid: userUID },
  });
}

export function bulkyItemPut(body: {
  id?: number;
  chain_uid: UID;
  user_uid: UID;
  title?: string;
  message?: string;
  image_url?: string;
}) {
  return axios.put("/v2/bulky-item", body);
}

export function bulkyItemRemove(chainUID: UID, userUID: UID, id: number) {
  return axios.delete("/v2/bulky-item", {
    params: { chain_uid: chainUID, user_uid: userUID, id },
  });
}
