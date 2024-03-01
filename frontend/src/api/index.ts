import redaxios from "redaxios";

const axios = redaxios.create({
  baseURL: "/api",
});
export default axios;
