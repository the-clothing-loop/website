import type { UID } from "./types";
import type { Bag } from "./typex2";
import axios from "./axios";

const regxBag = /^(\d+)/;
export function sortBags(bags: Bag[]) {
  return bags.sort((a, z) => {
    const matchA = regxBag.exec(a.number);
    const matchZ = regxBag.exec(z.number);
    const noA = matchA?.[1] ? parseInt(matchA[1]) : NaN;
    const noZ = matchZ?.[1] ? parseInt(matchZ[1]) : NaN;

    if (Number.isNaN(noA) && Number.isNaN(noZ)) {
      const compare = a.number.localeCompare(z.number, "kn");
      return compare < 0 ? -1 : compare > 0 ? 1 : 0;
    }
    if (Number.isNaN(noA)) return 1;
    if (Number.isNaN(noZ)) return -1;
    return noA < noZ ? -1 : 1;
  });
}

export function bagGetAllByChain(chainUID: UID, userUID: UID) {
  return axios
    .get<Bag[]>("/v2/bag/all", {
      params: { chain_uid: chainUID, user_uid: userUID },
    })
    .then((res) => {
      sortBags(res.data);
      return res;
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

export interface BagHistoryItem {
  id: number;
  number: string;
  color: string;
  history: BagHistoryHistoryItem[];
}
export interface BagHistoryHistoryItem {
  uid?: UID;
  name: string;
  date?: string;
}

export function bagHistory(chainUID: UID) {
  return axios.get("/v2/bag/history", {
    params: { chain_uid: chainUID },
  });
}
