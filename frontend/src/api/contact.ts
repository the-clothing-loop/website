import axios from "./axios";

export function contactNewsletterSet(email: string, subscribe: boolean) {
  return axios.post("/v2/contact/newsletter", {
    email,
    subscribe,
  });
}

export function contactMailSend(name: string, email: string, message: string) {
  return axios.post("/v2/contact/email", {
    name,
    email,
    message,
  });
}
