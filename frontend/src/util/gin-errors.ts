import { TFunction } from "react-i18next";

const regx = /Key: '((\w+\.)?(\w+))'/g;
export function GinParseErrors(
  t: TFunction<"translation", undefined>,
  e: string
): string {
  let m = e.matchAll(regx);
  let res = Array.from(m);
  console.log("gin", res, e);
  let errs = res.map((a) => a.at(3)) as string[];

  if (!errs.length) {
    return e;
  }

  return t("required") + ": " + errs.join(", ");
}
