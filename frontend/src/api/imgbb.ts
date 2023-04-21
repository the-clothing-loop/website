export interface UploadImageBody {
  delete: string;
  image: string;
  thumb: string;
}

export function uploadImage(image: Blob, size: number, expiration?: number) {
  let params: { size: number; expiration?: number } = { size };
  if (expiration) params.expiration = expiration;

  return window.axios.post<UploadImageBody>("/v2/image", image, {
    params,
  });
}

export function deleteImage(url: string) {
  return window.axios.delete<never>("/v2/image", { params: { url } });
}
