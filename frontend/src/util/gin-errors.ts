import { TFunction } from "react-i18next";

const regx = /Key: '((\w+\.)?(\w+))'/g;
export function GinParseErrors(
  t: TFunction<"translation", undefined>,
  e: string | { data: string } | any
): string {
  if (!(typeof e?.data === "string")) {
    if (typeof e === "string" && e !== "") return e;

    return t("genericError") + ": " + JSON.stringify(e);
  }
  let m = e.matchAll(regx);
  let res = Array.from(m) as string[];
  let errs = res.map((a) => a.at(3) || "");

  if (!errs.length) {
    return e;
  }

  return t("required") + ": " + errs.join(", ");
}
