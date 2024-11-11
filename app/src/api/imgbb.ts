import axios from "./axios";
import { ImageUploadResponse } from "./typex2";

function getBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () =>
      resolve(
        (reader.result as string).replace("data:", "").replace(/^.+,/, ""),
      );
    reader.onerror = (error) => reject(error);
  });
}

export async function uploadImageFile(
  file: File,
  size: number,
  expiration?: number,
) {
  const image = await getBase64(file);
  return await uploadImage(image, size, expiration);
}

export async function uploadImage(
  image64: string,
  size: number,
  expiration?: number,
) {
  let params: { size: number; expiration?: number } = { size };
  if (expiration) params.expiration = expiration;

  return await axios.post<ImageUploadResponse>("/v2/image", image64, {
    params,
  });
}

export function deleteImage(url: string) {
  return axios.delete<never>("/v2/image", { params: { url } });
}
