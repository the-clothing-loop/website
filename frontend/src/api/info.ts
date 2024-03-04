import axios from "./index";
export interface InfoBody {
  total_chains: number;
  total_users: number;
  total_countries: number;
}

export function infoGet() {
  return axios.get<InfoBody>("/v2/info");
}
