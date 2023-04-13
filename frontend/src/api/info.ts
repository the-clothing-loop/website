export interface InfoBody {
  total_chains: number;
  total_users: number;
}

export function infoGet() {
  return window.axios.get<InfoBody>("/v2/info");
}
