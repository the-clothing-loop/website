import OriginalImageToProxy from "./image_proxy";

test("should replace the original url with the proxied url", () => {
  const expected = "https://images.clothingloop.org/900x/kirsten_en_rosan.jpg";
  const result = OriginalImageToProxy(
    "https://images.clothingloop.org/original/kirsten_en_rosan.jpg",
    "900x",
  );

  expect(result).toEqual(expected);
});

test("should return the original url", () => {
  const expected =
    "https://res.cloudinary.com/dr5iag9id/image/upload/v1/upload/gncktmw90gor2n1yv6bx?_a=AQAK9iZ";
  const result = OriginalImageToProxy(expected, "900x");
  expect(result).toEqual(expected);
});

test("should return falsy", () => {
  const result = OriginalImageToProxy(null, "900x");
  expect(result).toBeFalsy();
});
