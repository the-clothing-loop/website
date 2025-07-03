import type { Response } from "redaxios";
import axios from "./axios";
import type { NewsletterUploadResponse } from "./typex2";
export function contactNewsletterSet(
  name: string,
  email: string,
  subscribe: boolean,
) {
  return axios.post<never>("/v2/contact/newsletter", {
    name,
    email,
    subscribe,
  });
}

export function newsletterUpload(file: File) {
  const formData = new FormData();
  formData.append("newsletter", file);

  return axios.patch<NewsletterUploadResponse>(
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
  return axios.post<string>("/v2/contact/email", {
    name,
    email,
    message,
  });
}
