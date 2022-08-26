import axios from "./axios";

export function contactNewsletterSet(email: string, subscribe: boolean) {
  return axios.post("/v1/contact/newsletter", {
    email,
    subscribe,
  });
}

export function contactMailSend(name: string, email: string, message: string) {
  return axios.post("/v1/contact/email", {
    name,
    email,
    message,
  });
}
