import axios from "./axios";
import { ContactMailRequest, ContactNewsletterRequest } from "./typex2";
export function contactNewsletterSet(
  name: string,
  email: string,
  subscribe: boolean,
) {
  return axios.post<never>("/v2/contact/newsletter", {
    name,
    email,
    subscribe,
  } satisfies ContactNewsletterRequest);
}

export function newsletterUpload(file: File) {
  const formData = new FormData();
  formData.append("newsletter", file);

  return axios.patch<{ message: string; filename?: string }>(
    "/v2/newsletter/download",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
}

export function newsletterDelete() {
  return axios.delete<never>("/v2/newsletter/download");
}

export function contactMailSend(name: string, email: string, message: string) {
  return axios.post<never>("/v2/contact/email", {
    name,
    email,
    message,
  } satisfies ContactMailRequest);
}
