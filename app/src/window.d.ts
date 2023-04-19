import Axios from "redaxios";

declare global {
  interface Window {
    axios: typeof Axios;
  }
}
