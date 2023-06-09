import "goscope2-sdk-js/sdk/js";
import Axios from "redaxios";

type Plausible = (t: string, e?: any) => void;

declare global {
  interface Window {
    MapboxGeocoder: MapboxGeocoder;
    plausible: Plausible;
    axios: typeof Axios;
  }
}
