export interface IPInfoData {
  ip: string;
  hostname: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  postal: string;
  timezone: string;
}

export function ipinfoGet(token: string) {
  return window.axios.get<IPInfoData>("https://ipinfo.io", {
    params: { token },
  });
}
