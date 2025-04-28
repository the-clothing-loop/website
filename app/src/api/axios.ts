import redaxios from "redaxios";

globalThis.axios = redaxios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.PUBLIC_API_BASE_URL ||
    "/api",
  withCredentials: true,
});

globalThis.axios = axios;

export default axios;
