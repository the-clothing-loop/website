export default function OriginalImageToProxy(
  image: string | null | undefined,
  opts: string,
): string | null | undefined {
  if (!image) return image;
  if (!image.startsWith("https://images.clothingloop.org/original/"))
    return image;
  return `https://images.clothingloop.org/${opts}/${image.slice(41)}`;
}
