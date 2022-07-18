import axios from "redaxios";

export function postNewsletter(email: string, subscribe: boolean) {
  return axios.post("/contact/newsletter", {
    email,
    subscribe,
  });
}

export function postMail(name: string, email: string, message: string) {
  return axios.post("/contact/email", {
    name,
    email,
    message,
  });
}
