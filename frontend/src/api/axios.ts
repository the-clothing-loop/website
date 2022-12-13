import redaxios from "redaxios";

export default redaxios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
});
