import redaxios from "redaxios";

window.axios = redaxios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
});
