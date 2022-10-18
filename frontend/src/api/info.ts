import axios from "./axios";

export interface InfoBody {
  total_chains: number;
  total_users: number;
}

export function infoGet() {
  return axios.get<InfoBody>("/v2/info");
}
