import axios from "redaxios";

export function loginStep1(email: string) {
  return axios.post("/login/email/step1", { email });
}

export function loginStep2(key: string) {
  return axios.post(`/login/email/step2?apiKey=${key}`);
}

export function logout() {
  return axios.delete("/logout");
}
