import redaxios from "redaxios";

export default redaxios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "",
});
