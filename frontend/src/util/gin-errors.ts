import { TFunction } from "react-i18next";

const regx = /Key: '((\w+\.)?(\w+))'/g;
export function GinParseErrors(
  t: TFunction<"translation", undefined>,
  e: string | { data: string } | any
): string {
  if (typeof e === "string") {
    return e !== "" ? e : t("genericError");
  }
  if (e?.data && typeof e.data === "string") {
    let m = e.data.matchAll(regx);
    let res = Array.from(m) as string[];
    let errs = res.map((a) => a.at(3) || "");

    if (!errs.length) {
      return e.data;
    }

    return t("required") + ": " + errs.join(", ");
  }

  return t("genericError") + ": " + JSON.stringify(e?.data || e);
}
