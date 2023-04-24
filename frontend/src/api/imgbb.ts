export interface UploadImageBody {
  delete: string;
  image: string;
  thumb: string;
}

function getBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () =>
      resolve(
        (reader.result as string).replace("data:", "").replace(/^.+,/, "")
      );
    reader.onerror = (error) => reject(error);
  });
}

export async function uploadImage(
  file: File,
  size: number,
  expiration?: number
) {
  let params: { size: number; expiration?: number } = { size };
  if (expiration) params.expiration = expiration;

  const image = await getBase64(file);

  return await window.axios.post<UploadImageBody>("/v2/image", image, {
    params,
  });
}

export function deleteImage(url: string) {
  return window.axios.delete<never>("/v2/image", { params: { url } });
}
