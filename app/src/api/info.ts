import axios from "./axios";
import { Info } from "./typex2";

export function infoGet() {
  return axios.get<Info>("/v2/info");
}
