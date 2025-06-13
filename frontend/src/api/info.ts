import axios from "./axios";
import type { Info, InfoTopLoop } from "./typex2";

export function infoGet() {
  return axios.get<Info>("/v2/info");
}

export function infoTopTenGet() {
  return axios.get<InfoTopLoop[]>("/v2/info/top-ten");
}
